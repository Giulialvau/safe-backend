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
import { CreateNonConformitaDto } from './dto/create-non-conformita.dto';
import { UpdateNonConformitaDto } from './dto/update-non-conformita.dto';
import { NonConformitaService } from './non-conformita.service';

@Controller('non-conformita')
@UseGuards(JwtAuthGuard)
export class NonConformitaController {
  constructor(private readonly nonConformitaService: NonConformitaService) {}

  @Post()
  create(@Body() dto: CreateNonConformitaDto) {
    return this.nonConformitaService.create(dto);
  }

  @Get()
  findAll() {
    return this.nonConformitaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nonConformitaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNonConformitaDto) {
    return this.nonConformitaService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nonConformitaService.remove(id);
  }
}
