import { Type } from 'class-transformer';
import {
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateMaterialeDto {
  @IsUUID()
  commessaId!: string;

  @IsString()
  @MaxLength(128)
  codice!: string;

  @IsString()
  descrizione!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  tipo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  norma?: string;

  @IsOptional()
  @IsString()
  certificato31?: string;

  @IsOptional()
  @IsUUID()
  certificatoDocumentoId?: string;

  @IsOptional()
  @IsString()
  lotto?: string;

  @IsOptional()
  @IsString()
  fornitore?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataCarico?: Date;
}
