import { NcGravita, NcStato, NcTipo } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNonConformitaDto {
  @IsUUID()
  commessaId!: string;

  @IsString()
  titolo!: string;

  @IsString()
  descrizione!: string;

  @IsEnum(NcTipo)
  tipo!: NcTipo;

  @IsEnum(NcGravita)
  gravita!: NcGravita;

  @IsEnum(NcStato)
  stato!: NcStato;

  @IsOptional()
  @IsString()
  azioniCorrettive?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataApertura?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataChiusura?: Date;
}
