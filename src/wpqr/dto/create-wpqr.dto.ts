import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateWpqrDto {
  @IsString()
  @MaxLength(64)
  codice!: string;

  @IsString()
  @MaxLength(255)
  saldatore!: string;

  @IsUUID()
  wpsId!: string;

  @Type(() => Date)
  @IsDate()
  dataQualifica!: Date;

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
  qualificaId?: string;
}
