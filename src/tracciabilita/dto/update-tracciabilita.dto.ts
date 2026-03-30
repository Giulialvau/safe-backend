import { PartialType } from '@nestjs/swagger';
import { CreateTracciabilitaDto } from './create-tracciabilita.dto';

export class UpdateTracciabilitaDto extends PartialType(CreateTracciabilitaDto) {}
