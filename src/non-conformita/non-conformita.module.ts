import { Module } from '@nestjs/common';
import { NonConformitaController } from './non-conformita.controller';
import { NonConformitaService } from './non-conformita.service';

@Module({
  controllers: [NonConformitaController],
  providers: [NonConformitaService],
  exports: [NonConformitaService],
})
export class NonConformitaModule {}
