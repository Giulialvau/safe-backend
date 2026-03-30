import { PartialType } from '@nestjs/swagger';
import { CreateAttrezzaturaDto } from './create-attrezzatura.dto';

export class UpdateAttrezzaturaDto extends PartialType(CreateAttrezzaturaDto) {}
