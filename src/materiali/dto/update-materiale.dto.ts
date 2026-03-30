import { PartialType } from '@nestjs/swagger';
import { CreateMaterialeDto } from './create-materiale.dto';

export class UpdateMaterialeDto extends PartialType(CreateMaterialeDto) {}
