import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

const checklistInclude = {
  commessa: { select: { id: true, codice: true, cliente: true } },
} as const;

@Injectable()
export class ChecklistService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateChecklistDto) {
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    const elementi = dto.elementi ?? [];
    return this.prisma.checklist.create({
      data: {
        titolo: dto.titolo,
        categoria: dto.categoria,
        fase: dto.fase,
        dataCompilazione: dto.dataCompilazione,
        esito: dto.esito,
        note: dto.note,
        operatore: dto.operatore,
        allegati:
          dto.allegati === undefined
            ? undefined
            : (dto.allegati as Prisma.InputJsonValue),
        stato: dto.stato,
        elementi: elementi as unknown as Prisma.InputJsonValue,
        commessaId: dto.commessaId,
      },
      include: checklistInclude,
    });
  }

  findAll() {
    return this.prisma.checklist.findMany({
      orderBy: [{ dataCompilazione: 'desc' }, { titolo: 'asc' }],
      include: checklistInclude,
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.checklist.findMany({
      where: { commessaId },
      orderBy: [{ dataCompilazione: 'desc' }, { titolo: 'asc' }],
      include: checklistInclude,
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.checklist.findUnique({
      where: { id },
      include: { commessa: true },
    });
    if (!row) {
      throw new NotFoundException(`Checklist ${id} non trovata`);
    }
    return row;
  }

  async update(id: string, dto: UpdateChecklistDto) {
    await this.ensureExists(id);
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    const data: Prisma.ChecklistUpdateInput = {
      titolo: dto.titolo,
      categoria: dto.categoria,
      fase: dto.fase,
      dataCompilazione: dto.dataCompilazione,
      esito: dto.esito,
      note: dto.note,
      operatore: dto.operatore,
      stato: dto.stato,
    };
    if (dto.allegati !== undefined) {
      data.allegati = dto.allegati as Prisma.InputJsonValue;
    }
    if (dto.commessaId !== undefined) {
      data.commessa = dto.commessaId
        ? { connect: { id: dto.commessaId } }
        : { disconnect: true };
    }
    if (dto.elementi !== undefined) {
      data.elementi = dto.elementi as unknown as Prisma.InputJsonValue;
    }
    return this.prisma.checklist.update({
      where: { id },
      data,
      include: checklistInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.checklist.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const x = await this.prisma.checklist.findUnique({ where: { id } });
    if (!x) {
      throw new NotFoundException(`Checklist ${id} non trovata`);
    }
  }
}
