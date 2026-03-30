import { Module } from '@nestjs/common';
import { MaterialiController } from './materiali.controller';
import { MaterialiService } from './materiali.service';

@Module({
  controllers: [MaterialiController],
  providers: [MaterialiService],
  exports: [MaterialiService],
})
export class MaterialiModule {}
