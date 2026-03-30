import { ChecklistEsito, ChecklistStato } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ChecklistElementoDto } from './checklist-elemento.dto';

export class CreateChecklistDto {
  @IsString()
  titolo!: string;

  @IsString()
  categoria!: string;

  @IsOptional()
  @IsString()
  fase?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataCompilazione?: Date;

  @IsOptional()
  @IsEnum(ChecklistEsito)
  esito?: ChecklistEsito;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  operatore?: string;

  @IsOptional()
  allegati?: unknown;

  @IsEnum(ChecklistStato)
  stato!: ChecklistStato;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistElementoDto)
  elementi?: ChecklistElementoDto[];

  @IsOptional()
  @IsUUID()
  commessaId?: string;
}
