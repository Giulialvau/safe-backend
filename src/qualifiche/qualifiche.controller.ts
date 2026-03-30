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
import { CreateQualificaDto } from './dto/create-qualifica.dto';
import { UpdateQualificaDto } from './dto/update-qualifica.dto';
import { QualificheService } from './qualifiche.service';

@Controller('qualifiche')
@UseGuards(JwtAuthGuard)
export class QualificheController {
  constructor(private readonly qualificheService: QualificheService) {}

  @Post()
  create(@Body() dto: CreateQualificaDto) {
    return this.qualificheService.create(dto);
  }

  @Get()
  findAll() {
    return this.qualificheService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.qualificheService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateQualificaDto) {
    return this.qualificheService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.qualificheService.remove(id);
  }
}
