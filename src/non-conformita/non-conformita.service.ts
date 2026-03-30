import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNonConformitaDto } from './dto/create-non-conformita.dto';
import { UpdateNonConformitaDto } from './dto/update-non-conformita.dto';

@Injectable()
export class NonConformitaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNonConformitaDto) {
    await this.ensureCommessa(dto.commessaId);
    return this.prisma.nonConformita.create({
      data: {
        commessaId: dto.commessaId,
        titolo: dto.titolo,
        descrizione: dto.descrizione,
        tipo: dto.tipo,
        gravita: dto.gravita,
        stato: dto.stato,
        azioniCorrettive: dto.azioniCorrettive,
        dataApertura: dto.dataApertura ?? undefined,
        dataChiusura: dto.dataChiusura,
      },
    });
  }

  findAll() {
    return this.prisma.nonConformita.findMany({
      orderBy: { dataApertura: 'desc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.nonConformita.findMany({
      where: { commessaId },
      orderBy: { dataApertura: 'desc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.nonConformita.findUnique({
      where: { id },
      include: { commessa: true },
    });
    if (!row) {
      throw new NotFoundException(`Non conformità ${id} non trovata`);
    }
    return row;
  }

  async update(id: string, dto: UpdateNonConformitaDto) {
    await this.ensureExists(id);
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    return this.prisma.nonConformita.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.nonConformita.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const x = await this.prisma.nonConformita.findUnique({ where: { id } });
    if (!x) {
      throw new NotFoundException(`Non conformità ${id} non trovata`);
    }
  }
}
