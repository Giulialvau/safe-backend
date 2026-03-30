import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePianoControlloDto } from './dto/create-piano-controllo.dto';
import { UpdatePianoControlloDto } from './dto/update-piano-controllo.dto';

@Injectable()
export class PianiControlloService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePianoControlloDto) {
    await this.ensureCommessa(dto.commessaId);
    return this.prisma.pianoControllo.create({
      data: {
        commessaId: dto.commessaId,
        fase: dto.fase,
        controlliRichiesti:
          dto.controlliRichiesti as unknown as Prisma.InputJsonValue,
        esito: dto.esito,
      },
    });
  }

  findAll() {
    return this.prisma.pianoControllo.findMany({
      orderBy: { fase: 'asc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.pianoControllo.findMany({
      where: { commessaId },
      orderBy: { fase: 'asc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.pianoControllo.findUnique({
      where: { id },
      include: { commessa: true },
    });
    if (!row) {
      throw new NotFoundException(`Piano di controllo ${id} non trovato`);
    }
    return row;
  }

  async update(id: string, dto: UpdatePianoControlloDto) {
    await this.ensureExists(id);
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    const data: Prisma.PianoControlloUpdateInput = {
      fase: dto.fase,
      esito: dto.esito,
    };
    if (dto.commessaId !== undefined) {
      data.commessa = { connect: { id: dto.commessaId } };
    }
    if (dto.controlliRichiesti !== undefined) {
      data.controlliRichiesti =
        dto.controlliRichiesti as unknown as Prisma.InputJsonValue;
    }
    return this.prisma.pianoControllo.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.pianoControllo.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const x = await this.prisma.pianoControllo.findUnique({ where: { id } });
    if (!x) {
      throw new NotFoundException(`Piano di controllo ${id} non trovato`);
    }
  }
}
