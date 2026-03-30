import { PartialType } from '@nestjs/swagger';
import { CreatePianoControlloDto } from './create-piano-controllo.dto';

export class UpdatePianoControlloDto extends PartialType(CreatePianoControlloDto) {}
