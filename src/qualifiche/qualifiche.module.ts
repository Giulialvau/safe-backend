import { Module } from '@nestjs/common';
import { QualificheController } from './qualifiche.controller';
import { QualificheService } from './qualifiche.service';

@Module({
  controllers: [QualificheController],
  providers: [QualificheService],
  exports: [QualificheService],
})
export class QualificheModule {}
