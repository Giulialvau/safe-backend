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
import { CreateWpsDto } from './dto/create-wps.dto';
import { UpdateWpsDto } from './dto/update-wps.dto';
import { WpsService } from './wps.service';

@Controller('wps')
@UseGuards(JwtAuthGuard)
export class WpsController {
  constructor(private readonly wpsService: WpsService) {}

  @Post()
  create(@Body() dto: CreateWpsDto) {
    return this.wpsService.create(dto);
  }

  @Get()
  findAll() {
    return this.wpsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wpsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWpsDto) {
    return this.wpsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wpsService.remove(id);
  }
}
