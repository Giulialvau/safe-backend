import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWpsDto } from './dto/create-wps.dto';
import { UpdateWpsDto } from './dto/update-wps.dto';

const wpsInclude = {
  commessa: { select: { id: true, codice: true, cliente: true } },
  materiale: {
    select: { id: true, codice: true, descrizione: true, lotto: true, norma: true },
  },
  wpqr: { orderBy: { codice: 'asc' as const } },
};

@Injectable()
export class WpsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWpsDto) {
    const exists = await this.prisma.wps.findUnique({ where: { codice: dto.codice } });
    if (exists) {
      throw new ConflictException(`WPS con codice ${dto.codice} già esistente`);
    }
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    await this.validateMaterialeForWps(dto.materialeId, dto.commessaId);
    return this.prisma.wps.create({
      data: {
        codice: dto.codice,
        descrizione: dto.descrizione,
        processo: dto.processo,
        spessore: dto.spessore,
        materialeBase: dto.materialeBase,
        scadenza: dto.scadenza,
        note: dto.note,
        commessaId: dto.commessaId,
        materialeId: dto.materialeId,
      } as Prisma.WpsUncheckedCreateInput,
      include: wpsInclude,
    });
  }

  findAll() {
    return this.prisma.wps.findMany({
      orderBy: { codice: 'asc' },
      include: wpsInclude,
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.wps.findMany({
      where: { commessaId },
      orderBy: { codice: 'asc' },
      include: wpsInclude,
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.wps.findUnique({
      where: { id },
      include: wpsInclude,
    });
    if (!row) {
      throw new NotFoundException(`WPS ${id} non trovato`);
    }
    return row;
  }

  async update(id: string, dto: UpdateWpsDto) {
    await this.ensureExists(id);
    if (dto.codice) {
      const clash = await this.prisma.wps.findFirst({
        where: { codice: dto.codice, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`Codice WPS ${dto.codice} già in uso`);
      }
    }
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    const current = await this.prisma.wps.findUnique({ where: { id } });
    if (!current) {
      throw new NotFoundException(`WPS ${id} non trovato`);
    }
    const cur = current as typeof current & { materialeId?: string | null };
    const nextMaterialeId =
      dto.materialeId !== undefined
        ? dto.materialeId || undefined
        : cur.materialeId ?? undefined;
    const nextCommessaId =
      dto.commessaId !== undefined
        ? dto.commessaId || undefined
        : current.commessaId ?? undefined;
    await this.validateMaterialeForWps(nextMaterialeId, nextCommessaId);

    const data: Prisma.WpsUncheckedUpdateInput = {};
    if (dto.codice !== undefined) data.codice = dto.codice;
    if (dto.descrizione !== undefined) data.descrizione = dto.descrizione;
    if (dto.processo !== undefined) data.processo = dto.processo;
    if (dto.spessore !== undefined) data.spessore = dto.spessore;
    if (dto.materialeBase !== undefined) data.materialeBase = dto.materialeBase;
    if (dto.scadenza !== undefined) data.scadenza = dto.scadenza;
    if (dto.note !== undefined) data.note = dto.note;
    if (dto.commessaId !== undefined) {
      data.commessaId = dto.commessaId || null;
    }
    if (dto.materialeId !== undefined) {
      data.materialeId = dto.materialeId || null;
    }

    return this.prisma.wps.update({
      where: { id },
      data,
      include: wpsInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    try {
      await this.prisma.wps.delete({ where: { id } });
    } catch (e) {
      const pe = e as { code?: string };
      if (pe?.code === 'P2003' || pe?.code === 'P2014') {
        throw new BadRequestException(
          'Impossibile eliminare: esistono WPQR collegati a questa WPS. Rimuovi prima i record WPQR.',
        );
      }
      throw e;
    }
    return { deleted: true, id };
  }

  private async ensureCommessa(commessaId: string): Promise<void> {
    const c = await this.prisma.commessa.findUnique({ where: { id: commessaId } });
    if (!c) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }
  }

  private async ensureExists(id: string): Promise<void> {
    const w = await this.prisma.wps.findUnique({ where: { id } });
    if (!w) {
      throw new NotFoundException(`WPS ${id} non trovato`);
    }
  }

  /** Se valorizzato, il materiale deve esistere; se la WPS è di commessa, il materiale deve essere della stessa commessa. */
  private async validateMaterialeForWps(
    materialeId: string | undefined,
    commessaId: string | undefined,
  ): Promise<void> {
    if (!materialeId) return;
    const m = await this.prisma.materiale.findUnique({ where: { id: materialeId } });
    if (!m) {
      throw new NotFoundException(`Materiale ${materialeId} non trovato`);
    }
    if (commessaId && m.commessaId !== commessaId) {
      throw new BadRequestException(
        'Il materiale selezionato non appartiene alla commessa della WPS.',
      );
    }
  }
}
