import { Module } from '@nestjs/common';
import { TracciabilitaController } from './tracciabilita.controller';
import { TracciabilitaService } from './tracciabilita.service';

@Module({
  controllers: [TracciabilitaController],
  providers: [TracciabilitaService],
  exports: [TracciabilitaService],
})
export class TracciabilitaModule {}
