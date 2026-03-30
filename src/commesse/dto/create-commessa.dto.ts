import { CommessaStato } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCommessaDto {
  @IsString()
  @MaxLength(64)
  codice!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  titolo?: string;

  @IsString()
  @MaxLength(255)
  cliente!: string;

  @IsOptional()
  @IsString()
  descrizione?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  responsabile?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  luogo?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataInizio?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataFine?: Date;

  @IsOptional()
  @IsEnum(CommessaStato)
  stato?: CommessaStato;
}
