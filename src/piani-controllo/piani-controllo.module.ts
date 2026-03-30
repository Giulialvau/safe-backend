import { Module } from '@nestjs/common';
import { PianiControlloController } from './piani-controllo.controller';
import { PianiControlloService } from './piani-controllo.service';

@Module({
  controllers: [PianiControlloController],
  providers: [PianiControlloService],
  exports: [PianiControlloService],
})
export class PianiControlloModule {}
