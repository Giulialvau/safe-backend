import { PartialType } from '@nestjs/swagger';
import { CreateQualificaDto } from './create-qualifica.dto';

export class UpdateQualificaDto extends PartialType(CreateQualificaDto) {}
