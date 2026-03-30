import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateTracciabilitaDto } from './dto/create-tracciabilita.dto';
import { UpdateTracciabilitaDto } from './dto/update-tracciabilita.dto';
import { TracciabilitaService } from './tracciabilita.service';

@Controller('tracciabilita')
@UseGuards(JwtAuthGuard)
export class TracciabilitaController {
  constructor(private readonly tracciabilitaService: TracciabilitaService) {}

  @Post()
  create(@Body() dto: CreateTracciabilitaDto) {
    return this.tracciabilitaService.create(dto);
  }

  @Get()
  findAll() {
    return this.tracciabilitaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tracciabilitaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTracciabilitaDto) {
    return this.tracciabilitaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tracciabilitaService.remove(id);
  }
}
