import { PartialType } from '@nestjs/swagger';
import { CreateWpsDto } from './create-wps.dto';

export class UpdateWpsDto extends PartialType(CreateWpsDto) {}
