import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * Metadati multipart per POST /documenti/upload.
 * `commessaId` è UUID (come in Prisma); dal FormData arriva come stringa.
 */
export class UploadDocumentoDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsUUID()
  commessaId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  versione?: string;
}
