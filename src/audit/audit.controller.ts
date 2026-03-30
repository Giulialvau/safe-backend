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
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/create-audit.dto';
import { UpdateAuditDto } from './dto/update-audit.dto';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  create(@Body() dto: CreateAuditDto) {
    return this.auditService.create(dto);
  }

  @Get()
  findAll() {
    return this.auditService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuditDto) {
    return this.auditService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditService.remove(id);
  }
}
