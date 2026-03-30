import { PartialType } from '@nestjs/swagger';
import { CreateCommessaDto } from './create-commessa.dto';

export class UpdateCommessaDto extends PartialType(CreateCommessaDto) {}
