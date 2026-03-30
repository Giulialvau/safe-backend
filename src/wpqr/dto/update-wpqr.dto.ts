import { PartialType } from '@nestjs/swagger';
import { CreateWpqrDto } from './create-wpqr.dto';

export class UpdateWpqrDto extends PartialType(CreateWpqrDto) {}
