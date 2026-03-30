import { DocumentoStatoApprovazione } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDocumentoDto {
  @IsUUID()
  commessaId!: string;

  @IsString()
  @MaxLength(255)
  nome!: string;

  @IsString()
  @MaxLength(128)
  tipo!: string;

  @IsString()
  @MaxLength(32)
  versione!: string;

  @IsString()
  percorsoFile!: string;

  @IsOptional()
  @IsEnum(DocumentoStatoApprovazione)
  statoApprovazione?: DocumentoStatoApprovazione;
}
