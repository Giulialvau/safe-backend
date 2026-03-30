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
import { ChecklistService } from './checklist.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Controller('checklist')
@UseGuards(JwtAuthGuard)
export class ChecklistController {
  constructor(private readonly checklistService: ChecklistService) {}

  @Post()
  create(@Body() dto: CreateChecklistDto) {
    return this.checklistService.create(dto);
  }

  @Get()
  findAll() {
    return this.checklistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checklistService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChecklistDto) {
    return this.checklistService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checklistService.remove(id);
  }
}
