import { Injectable, NotFoundException } from '@nestjs/common';
import { NcStato } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [
      commesseTotal,
      commesseAttive,
      materialiTotal,
      documentiTotal,
      ncAperte,
      ncChiuse,
      auditTotal,
      auditNonConformi,
      wpsTotal,
      wpqrInScadenza,
    ] = await Promise.all([
      this.prisma.commessa.count(),
      this.prisma.commessa.count({
        where: { stato: { in: ['IN_CORSO', 'SOSPESA'] } },
      }),
      this.prisma.materiale.count(),
      this.prisma.documento.count(),
      this.prisma.nonConformita.count({
        where: { stato: { not: NcStato.CHIUSA } },
      }),
      this.prisma.nonConformita.count({
        where: { stato: NcStato.CHIUSA },
      }),
      this.prisma.audit.count(),
      this.prisma.audit.count({ where: { esito: 'NON_CONFORME' } }),
      this.prisma.wps.count(),
      this.prisma.wpqr.count({
        where: {
          scadenza: {
            lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
    ]);

    const ultimeNc = await this.prisma.nonConformita.findMany({
      take: 5,
      orderBy: { dataApertura: 'desc' },
      include: {
        commessa: { select: { codice: true, cliente: true } },
      },
    });

    const ultimiAudit = await this.prisma.audit.findMany({
      take: 5,
      orderBy: { data: 'desc' },
      include: {
        commessa: { select: { codice: true, cliente: true } },
      },
    });

    return {
      generatedAt: new Date().toISOString(),
      riepilogo: {
        commesseTotal,
        commesseAttive,
        materialiTotal,
        documentiTotal,
        nonConformitaAperte: ncAperte,
        nonConformitaChiuse: ncChiuse,
        auditTotal,
        auditNonConformi,
        wpsTotal,
        wpqrInScadenza90gg: wpqrInScadenza,
      },
      ultimeNonConformita: ultimeNc,
      ultimiAudit,
    };
  }

  async commessaReport(commessaId: string) {
    const commessa = await this.prisma.commessa.findUnique({
      where: { id: commessaId },
      include: {
        materiali: true,
        documenti: true,
        pianiControllo: true,
        nonConformita: true,
        audits: true,
        wps: true,
        wpqr: true,
        checklists: true,
        tracciabilita: {
          include: {
            materiale: { select: { codice: true, lotto: true } },
          },
        },
      },
    });

    if (!commessa) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }

    const aggregati = await this.prisma.nonConformita.groupBy({
      by: ['stato'],
      where: { commessaId },
      _count: { _all: true },
    });

    return {
      commessa,
      nonConformitaPerStato: aggregati,
    };
  }

  async materialiPerFornitore() {
    const rows = await this.prisma.materiale.groupBy({
      by: ['fornitore'],
      where: {
        fornitore: { not: null },
      },
      _count: { _all: true },
    });

    return rows.map((r) => ({
      fornitore: r.fornitore,
      conteggio: r._count._all,
    }));
  }
}
