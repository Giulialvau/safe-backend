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
import { CreateMaterialeDto } from './dto/create-materiale.dto';
import { UpdateMaterialeDto } from './dto/update-materiale.dto';
import { MaterialiService } from './materiali.service';

@Controller('materiali')
@UseGuards(JwtAuthGuard)
export class MaterialiController {
  constructor(private readonly materialiService: MaterialiService) {}

  @Post()
  create(@Body() dto: CreateMaterialeDto) {
    return this.materialiService.create(dto);
  }

  @Get()
  findAll() {
    return this.materialiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialiService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialeDto) {
    return this.materialiService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.materialiService.remove(id);
  }
}
