import { Module } from '@nestjs/common';
import { ChecklistModule } from '../checklist/checklist.module';
import { MaterialiModule } from '../materiali/materiali.module';
import { TracciabilitaModule } from '../tracciabilita/tracciabilita.module';
import { WpsModule } from '../wps/wps.module';
import { WpqrModule } from '../wpqr/wpqr.module';
import { NonConformitaModule } from '../non-conformita/non-conformita.module';
import { AuditModule } from '../audit/audit.module';
import { PianiControlloModule } from '../piani-controllo/piani-controllo.module';
import { DocumentiModule } from '../documenti/documenti.module';
import { CommesseController } from './commesse.controller';
import { CommesseService } from './commesse.service';

@Module({
  imports: [
    MaterialiModule,
    ChecklistModule,
    TracciabilitaModule,
    WpsModule,
    WpqrModule,
    NonConformitaModule,
    AuditModule,
    PianiControlloModule,
    DocumentiModule,
  ],
  controllers: [CommesseController],
  providers: [CommesseService],
  exports: [CommesseService],
})
export class CommesseModule {}
