import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTracciabilitaDto {
  @IsUUID()
  materialeId!: string;

  @IsUUID()
  commessaId!: string;

  @IsString()
  @MaxLength(500)
  posizione!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  quantita!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descrizioneComponente?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  riferimentoDisegno?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  note?: string;
}
