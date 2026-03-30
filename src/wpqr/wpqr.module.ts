import { Module } from '@nestjs/common';
import { WpqrController } from './wpqr.controller';
import { WpqrService } from './wpqr.service';

@Module({
  controllers: [WpqrController],
  providers: [WpqrService],
  exports: [WpqrService],
})
export class WpqrModule {}
