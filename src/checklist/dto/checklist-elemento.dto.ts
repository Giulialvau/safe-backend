import { IsBoolean, IsOptional, IsString } from 'class-validator';

/** Punto controllo / domanda con risposta strutturata */
export class ChecklistElementoDto {
  @IsString()
  id!: string;

  @IsString()
  descrizione!: string;

  @IsOptional()
  @IsBoolean()
  completato?: boolean;

  @IsOptional()
  @IsString()
  risposta?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
