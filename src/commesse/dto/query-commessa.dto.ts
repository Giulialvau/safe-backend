import { CommessaStato } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/** Filtri opzionali per GET /commesse (date in formato ISO YYYY-MM-DD) */
export class QueryCommessaDto {
  @IsOptional()
  @IsEnum(CommessaStato)
  stato?: CommessaStato;

  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  dataInizioDa?: string;

  @IsOptional()
  @IsString()
  dataInizioA?: string;
}
