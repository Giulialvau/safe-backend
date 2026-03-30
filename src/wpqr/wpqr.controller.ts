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
import { CreateWpqrDto } from './dto/create-wpqr.dto';
import { UpdateWpqrDto } from './dto/update-wpqr.dto';
import { WpqrService } from './wpqr.service';

@Controller('wpqr')
@UseGuards(JwtAuthGuard)
export class WpqrController {
  constructor(private readonly wpqrService: WpqrService) {}

  @Post()
  create(@Body() dto: CreateWpqrDto) {
    return this.wpqrService.create(dto);
  }

  @Get()
  findAll() {
    return this.wpqrService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wpqrService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWpqrDto) {
    return this.wpqrService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wpqrService.remove(id);
  }
}
