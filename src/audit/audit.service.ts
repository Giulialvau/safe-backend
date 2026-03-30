import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAuditDto) {
    await this.ensureCommessa(dto.commessaId);
    return this.prisma.audit.create({ data: dto });
  }

  findAll() {
    return this.prisma.audit.findMany({
      orderBy: { data: 'desc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.audit.findMany({
      where: { commessaId },
      orderBy: { data: 'desc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.audit.findUnique({
      where: { id },
      include: { commessa: true },
    });
    if (!row) {
      throw new NotFoundException(`Audit ${id} non trovato`);
    }
    return row;
  }

  async update(id: string, dto: UpdateAuditDto) {
    await this.ensureExists(id);
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    return this.prisma.audit.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.audit.delete({ where: { id } });
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const a = await this.prisma.audit.findUnique({ where: { id } });
    if (!a) {
      throw new NotFoundException(`Audit ${id} non trovato`);
    }
  }
}
