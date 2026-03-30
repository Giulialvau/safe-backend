import { AuditEsito } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAuditDto {
  @IsUUID()
  commessaId!: string;

  @IsString()
  titolo!: string;

  @Type(() => Date)
  @IsDate()
  data!: Date;

  @IsString()
  auditor!: string;

  @IsEnum(AuditEsito)
  esito!: AuditEsito;

  @IsOptional()
  @IsString()
  note?: string;
}
