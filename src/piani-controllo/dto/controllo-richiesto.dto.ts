import { IsOptional, IsString } from 'class-validator';

export class ControlloRichiestoDto {
  @IsString()
  codice!: string;

  @IsString()
  descrizione!: string;

  @IsOptional()
  @IsString()
  riferimentoNormativo?: string;
}
