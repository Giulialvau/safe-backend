import { PianoControlloEsito } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ControlloRichiestoDto } from './controllo-richiesto.dto';

export class CreatePianoControlloDto {
  @IsUUID()
  commessaId!: string;

  @IsString()
  fase!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ControlloRichiestoDto)
  controlliRichiesti!: ControlloRichiestoDto[];

  @IsEnum(PianoControlloEsito)
  esito!: PianoControlloEsito;
}
