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
import { AttrezzatureService } from './attrezzature.service';
import { CreateAttrezzaturaDto } from './dto/create-attrezzatura.dto';
import { UpdateAttrezzaturaDto } from './dto/update-attrezzatura.dto';

@Controller('attrezzature')
@UseGuards(JwtAuthGuard)
export class AttrezzatureController {
  constructor(private readonly attrezzatureService: AttrezzatureService) {}

  @Post()
  create(@Body() dto: CreateAttrezzaturaDto) {
    return this.attrezzatureService.create(dto);
  }

  @Get()
  findAll() {
    return this.attrezzatureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attrezzatureService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttrezzaturaDto) {
    return this.attrezzatureService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attrezzatureService.remove(id);
  }
}
