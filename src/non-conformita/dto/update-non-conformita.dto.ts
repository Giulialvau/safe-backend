import { PartialType } from '@nestjs/swagger';
import { CreateNonConformitaDto } from './create-non-conformita.dto';

export class UpdateNonConformitaDto extends PartialType(CreateNonConformitaDto) {}
