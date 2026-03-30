import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttrezzaturaDto {
  @IsString()
  @MaxLength(255)
  nome!: string;

  @IsString()
  @MaxLength(128)
  matricola!: string;

  @IsString()
  @MaxLength(128)
  tipo!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataManutenzione?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataTaratura?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scadenza?: Date;
}
