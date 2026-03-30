import { Module } from '@nestjs/common';
import { WpsController } from './wps.controller';
import { WpsService } from './wps.service';

@Module({
  controllers: [WpsController],
  providers: [WpsService],
  exports: [WpsService],
})
export class WpsModule {}
