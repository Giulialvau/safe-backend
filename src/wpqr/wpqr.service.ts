import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWpqrDto } from './dto/create-wpqr.dto';
import { UpdateWpqrDto } from './dto/update-wpqr.dto';

const wpqrInclude = {
  wps: {
    select: {
      id: true,
      codice: true,
      processo: true,
      descrizione: true,
    },
  },
  commessa: { select: { id: true, codice: true, cliente: true } },
  qualifica: { select: { id: true, nome: true, ruolo: true, scadenza: true } },
} as const;

@Injectable()
export class WpqrService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWpqrDto) {
    const wps = await this.prisma.wps.findUnique({ where: { id: dto.wpsId } });
    if (!wps) {
      throw new NotFoundException(`WPS ${dto.wpsId} non trovato`);
    }
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
      if (wps.commessaId && wps.commessaId !== dto.commessaId) {
        throw new BadRequestException(
          'La WPS selezionata è associata a un’altra commessa.',
        );
      }
    }
    if (dto.qualificaId) {
      await this.ensureQualifica(dto.qualificaId);
    }
    return this.prisma.wpqr.create({
      data: {
        codice: dto.codice,
        saldatore: dto.saldatore,
        wpsId: dto.wpsId,
        dataQualifica: dto.dataQualifica,
        scadenza: dto.scadenza,
        note: dto.note,
        commessaId: dto.commessaId,
        qualificaId: dto.qualificaId,
      } as Prisma.WpqrUncheckedCreateInput,
      include: wpqrInclude,
    });
  }

  findAll() {
    return this.prisma.wpqr.findMany({
      orderBy: [{ dataQualifica: 'desc' }, { codice: 'asc' }],
      include: wpqrInclude,
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.wpqr.findMany({
      where: { commessaId },
      orderBy: [{ dataQualifica: 'desc' }, { codice: 'asc' }],
      include: wpqrInclude,
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.wpqr.findUnique({
      where: { id },
      include: wpqrInclude,
    });
    if (!row) {
      throw new NotFoundException(`WPQR ${id} non trovato`);
    }
    return row;
  }

  async update(id: string, dto: UpdateWpqrDto) {
    const current = await this.prisma.wpqr.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`WPQR ${id} non trovato`);
    }
    const nextWpsId = dto.wpsId ?? current.wpsId;
    const nextCommessa = dto.commessaId !== undefined ? dto.commessaId : current.commessaId;
    if (dto.wpsId) {
      const wps = await this.prisma.wps.findUnique({ where: { id: dto.wpsId } });
      if (!wps) {
        throw new NotFoundException(`WPS ${dto.wpsId} non trovato`);
      }
      if (nextCommessa && wps.commessaId && wps.commessaId !== nextCommessa) {
        throw new BadRequestException(
          'La WPS selezionata è associata a un’altra commessa.',
        );
      }
    } else {
      const wps = await this.prisma.wps.findUnique({ where: { id: nextWpsId } });
      if (wps && nextCommessa && wps.commessaId && wps.commessaId !== nextCommessa) {
        throw new BadRequestException(
          'La WPS corrente è associata a un’altra commessa.',
        );
      }
    }
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    if (dto.qualificaId) {
      await this.ensureQualifica(dto.qualificaId);
    }
    const data: Prisma.WpqrUncheckedUpdateInput = {};
    if (dto.codice !== undefined) data.codice = dto.codice;
    if (dto.saldatore !== undefined) data.saldatore = dto.saldatore;
    if (dto.wpsId !== undefined) data.wpsId = dto.wpsId;
    if (dto.dataQualifica !== undefined) data.dataQualifica = dto.dataQualifica;
    if (dto.scadenza !== undefined) data.scadenza = dto.scadenza;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.commessaId !== undefined) data.commessaId = dto.commessaId;
    if (dto.qualificaId !== undefined) data.qualificaId = dto.qualificaId;

    return this.prisma.wpqr.update({
      where: { id },
      data,
      include: wpqrInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.wpqr.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureQualifica(qualificaId: string): Promise<void> {
    const q = await this.prisma.qualifica.findUnique({ where: { id: qualificaId } });
    if (!q) {
      throw new NotFoundException(`Qualifica ${qualificaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const x = await this.prisma.wpqr.findUnique({ where: { id } });
    if (!x) {
      throw new NotFoundException(`WPQR ${id} non trovato`);
    }
  }
}
