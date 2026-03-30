import { Injectable, NotFoundException } from '@nestjs/common';
import { DocumentoStatoApprovazione } from '@prisma/client';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import type { Express } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { UploadDocumentoDto } from './dto/upload-documento.dto';

const UPLOAD_SUBDIR = join('uploads', 'documenti');

function mimeFromExt(extension: string): string {
  switch (extension.toLowerCase()) {
    case '.pdf':
      return 'application/pdf';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

@Injectable()
export class DocumentiService {
  constructor(private readonly prisma: PrismaService) {
    this.ensureUploadDir();
  }

  private ensureUploadDir(): void {
    const abs = join(process.cwd(), UPLOAD_SUBDIR);
    if (!existsSync(abs)) {
      mkdirSync(abs, { recursive: true });
    }
  }

  async create(dto: CreateDocumentoDto) {
    await this.ensureCommessa(dto.commessaId);
    return this.prisma.documento.create({ data: dto });
  }

  /** Upload PDF: salva su disco e crea record (nome = title, come richiesto). */
  async uploadFromFile(file: Express.Multer.File, dto: UploadDocumentoDto) {
    this.ensureUploadDir();
    await this.ensureCommessa(dto.commessaId);

    const relativePath = join(UPLOAD_SUBDIR, file.filename).replace(/\\/g, '/');
    const tipo = dto.tipo?.trim() || 'modulo';
    const versione = dto.versione?.trim() || '1.0';

    return this.prisma.documento.create({
      data: {
        commessaId: dto.commessaId,
        nome: dto.title,
        tipo,
        versione,
        percorsoFile: relativePath,
        statoApprovazione: DocumentoStatoApprovazione.BOZZA,
      },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  absolutePathFromStored(percorsoFile: string): string {
    return join(process.cwd(), percorsoFile);
  }

  async getReadStreamForDocumento(id: string): Promise<{
    stream: ReturnType<typeof createReadStream>;
    filename: string;
    mimeType: string;
  }> {
    const row = await this.prisma.documento.findUnique({
      where: { id },
      select: { percorsoFile: true, nome: true },
    });
    if (!row) {
      throw new NotFoundException(`Documento ${id} non trovato`);
    }
    const abs = this.absolutePathFromStored(row.percorsoFile);
    if (!existsSync(abs)) {
      throw new NotFoundException(`File non trovato su disco per documento ${id}`);
    }
    const ext = extname(row.percorsoFile) || '.pdf';
    const safeName = `${row.nome.replace(/[^\w.\-]+/g, '_')}${ext}`;
    return {
      stream: createReadStream(abs),
      filename: safeName,
      mimeType: mimeFromExt(ext),
    };
  }

  findAll() {
    return this.prisma.documento.findMany({
      orderBy: { nome: 'asc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findByCommessa(commessaId: string) {
    await this.ensureCommessa(commessaId);
    return this.prisma.documento.findMany({
      where: { commessaId },
      orderBy: { nome: 'asc' },
      include: {
        commessa: { select: { id: true, codice: true, cliente: true } },
      },
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.documento.findUnique({
      where: { id },
      include: { commessa: true },
    });
    if (!row) {
      throw new NotFoundException(`Documento ${id} non trovato`);
    }
    return row;
  }

  async update(id: string, dto: UpdateDocumentoDto) {
    await this.ensureExists(id);
    if (dto.commessaId) {
      await this.ensureCommessa(dto.commessaId);
    }
    return this.prisma.documento.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const row = await this.prisma.documento.findUnique({
      where: { id },
      select: { percorsoFile: true },
    });
    if (!row) {
      throw new NotFoundException(`Documento ${id} non trovato`);
    }
    await this.prisma.documento.delete({ where: { id } });
    const abs = this.absolutePathFromStored(row.percorsoFile);
    if (existsSync(abs)) {
      try {
        unlinkSync(abs);
      } catch {
        /* file non rimosso: non bloccare la risposta */
      }
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
    const d = await this.prisma.documento.findUnique({ where: { id } });
    if (!d) {
      throw new NotFoundException(`Documento ${id} non trovato`);
    }
  }
}
