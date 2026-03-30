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
import { CreatePianoControlloDto } from './dto/create-piano-controllo.dto';
import { UpdatePianoControlloDto } from './dto/update-piano-controllo.dto';
import { PianiControlloService } from './piani-controllo.service';

@Controller('piani-controllo')
@UseGuards(JwtAuthGuard)
export class PianiControlloController {
  constructor(private readonly pianiControlloService: PianiControlloService) {}

  @Post()
  create(@Body() dto: CreatePianoControlloDto) {
    return this.pianiControlloService.create(dto);
  }

  @Get()
  findAll() {
    return this.pianiControlloService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pianiControlloService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePianoControlloDto) {
    return this.pianiControlloService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pianiControlloService.remove(id);
  }
}
