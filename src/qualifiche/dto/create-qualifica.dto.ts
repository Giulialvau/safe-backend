import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateQualificaDto {
  @IsString()
  @MaxLength(255)
  nome!: string;

  @IsString()
  @MaxLength(128)
  ruolo!: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scadenza?: Date;

  @IsOptional()
  @IsString()
  documento?: string;
}
