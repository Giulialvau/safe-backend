import { Module } from '@nestjs/common';
import { ReportController } from './report.controller';
import { ReportPdfService } from './report-pdf.service';
import { ReportService } from './report.service';

@Module({
  controllers: [ReportController],
  providers: [ReportService, ReportPdfService],
})
export class ReportModule {}
