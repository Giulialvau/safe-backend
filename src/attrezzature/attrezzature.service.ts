import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttrezzaturaDto } from './dto/create-attrezzatura.dto';
import { UpdateAttrezzaturaDto } from './dto/update-attrezzatura.dto';

@Injectable()
export class AttrezzatureService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAttrezzaturaDto) {
    const dup = await this.prisma.attrezzatura.findUnique({
      where: { matricola: dto.matricola },
    });
    if (dup) {
      throw new ConflictException(`Matricola ${dto.matricola} già registrata`);
    }
    return this.prisma.attrezzatura.create({ data: dto });
  }

  findAll() {
    return this.prisma.attrezzatura.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    const row = await this.prisma.attrezzatura.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Attrezzatura ${id} non trovata`);
    }
    return row;
  }

  async update(id: string, dto: UpdateAttrezzaturaDto) {
    await this.ensureExists(id);
    if (dto.matricola) {
      const clash = await this.prisma.attrezzatura.findFirst({
        where: { matricola: dto.matricola, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`Matricola ${dto.matricola} già in uso`);
      }
    }
    return this.prisma.attrezzatura.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.attrezzatura.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureExists(id: string): Promise<void> {
    const a = await this.prisma.attrezzatura.findUnique({ where: { id } });
    if (!a) {
      throw new NotFoundException(`Attrezzatura ${id} non trovata`);
    }
  }
}
