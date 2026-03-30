import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWpsDto {
  @IsString()
  @MaxLength(64)
  codice!: string;

  @IsOptional()
  @IsString()
  descrizione?: string;

  @IsString()
  @MaxLength(128)
  processo!: string;

  @IsOptional()
  @IsString()
  spessore?: string;

  @IsOptional()
  @IsString()
  materialeBase?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scadenza?: Date;

  @IsOptional()
  @IsUUID()
  commessaId?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsUUID()
  materialeId?: string;
}
