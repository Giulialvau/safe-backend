import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTracciabilitaDto } from './dto/create-tracciabilita.dto';
import { UpdateTracciabilitaDto } from './dto/update-tracciabilita.dto';

const tracciabilitaInclude = {
  materiale: {
    select: {
      id: true,
      codice: true,
      descrizione: true,
      lotto: true,
      certificato31: true,
    },
  },
  commessa: { select: { id: true, codice: true, cliente: true } },
} as const;

@Injectable()
export class TracciabilitaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTracciabilitaDto) {
    await this.ensureMaterialeCommessaCoherent(dto.materialeId, dto.commessaId);
    return this.prisma.tracciabilita.create({
      data: {
        materialeId: dto.materialeId,
        commessaId: dto.commessaId,
        posizione: dto.posizione,
        quantita: new Prisma.Decimal(dto.quantita),
        descrizioneComponente: dto.descrizioneComponente,
        riferimentoDisegno: dto.riferimentoDisegno,
        note: dto.note,
      },
      include: tracciabilitaInclude,
    });
  }

  findAll() {
    return this.prisma.tracciabilita.findMany({
      orderBy: [{ posizione: 'asc' }, { id: 'asc' }],
      include: tracciabilitaInclude,
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessaExists(commessaId);
    return this.prisma.tracciabilita.findMany({
      where: { commessaId },
      orderBy: [{ posizione: 'asc' }, { id: 'asc' }],
      include: tracciabilitaInclude,
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.tracciabilita.findUnique({
      where: { id },
      include: tracciabilitaInclude,
    });
    if (!row) {
      throw new NotFoundException(`Tracciabilità ${id} non trovata`);
    }
    return row;
  }

  async update(id: string, dto: UpdateTracciabilitaDto) {
    await this.ensureExists(id);
    const mid = dto.materialeId;
    const cid = dto.commessaId;
    if (mid !== undefined || cid !== undefined) {
      const current = await this.prisma.tracciabilita.findUnique({
        where: { id },
      });
      if (!current) {
        throw new NotFoundException(`Tracciabilità ${id} non trovata`);
      }
      await this.ensureMaterialeCommessaCoherent(
        mid ?? current.materialeId,
        cid ?? current.commessaId,
      );
    }
    const data: Prisma.TracciabilitaUpdateInput = {
      posizione: dto.posizione,
      descrizioneComponente: dto.descrizioneComponente,
      riferimentoDisegno: dto.riferimentoDisegno,
      note: dto.note,
    };
    if (dto.materialeId !== undefined) {
      data.materiale = { connect: { id: dto.materialeId } };
    }
    if (dto.commessaId !== undefined) {
      data.commessa = { connect: { id: dto.commessaId } };
    }
    if (dto.quantita !== undefined) {
      data.quantita = new Prisma.Decimal(dto.quantita);
    }
    return this.prisma.tracciabilita.update({
      where: { id },
      data,
      include: tracciabilitaInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.tracciabilita.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessaExists(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureMaterialeCommessaCoherent(
    materialeId: string,
    commessaId: string,
  ): Promise<void> {
    const m = await this.prisma.materiale.findUnique({
      where: { id: materialeId },
    });
    if (!m) {
      throw new NotFoundException(`Materiale ${materialeId} non trovato`);
    }
    const c = await this.prisma.commessa.findUnique({
      where: { id: commessaId },
    });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
    if (m.commessaId !== commessaId) {
      throw new BadRequestException(
        'Il materiale non appartiene alla commessa indicata: tracciabilità incoerente',
      );
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const t = await this.prisma.tracciabilita.findUnique({ where: { id } });
    if (!t) {
      throw new NotFoundException(`Tracciabilità ${id} non trovata`);
    }
  }
}
