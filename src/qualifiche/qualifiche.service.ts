import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQualificaDto } from './dto/create-qualifica.dto';
import { UpdateQualificaDto } from './dto/update-qualifica.dto';

@Injectable()
export class QualificheService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateQualificaDto) {
    return this.prisma.qualifica.create({ data: dto });
  }

  findAll() {
    return this.prisma.qualifica.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.qualifica.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Qualifica ${id} non trovata`);
    }
    return row;
  }

  async update(id: string, dto: UpdateQualificaDto) {
    await this.ensureExists(id);
    return this.prisma.qualifica.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.qualifica.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureExists(id: string): Promise<void> {
    const q = await this.prisma.qualifica.findUnique({ where: { id } });
    if (!q) {
      throw new NotFoundException(`Qualifica ${id} non trovata`);
    }
  }
}
