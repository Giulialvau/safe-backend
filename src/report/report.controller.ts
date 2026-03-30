import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportPdfService } from './report-pdf.service';
import { ReportService } from './report.service';

@Controller('report')
@UseGuards(JwtAuthGuard)
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly reportPdfService: ReportPdfService,
  ) {}

  private pdfResponse(bytes: Uint8Array, filename: string) {
    return new StreamableFile(Buffer.from(bytes), {
      type: 'application/pdf',
      disposition: `attachment; filename="${encodeURIComponent(filename)}"`,
    });
  }

  private requireCommessaId(commessaId: string | undefined): string {
    const id = commessaId?.trim();
    if (!id) {
      throw new BadRequestException('commessaId richiesto');
    }
    return id;
  }

  @Get('dashboard')
  getDashboard() {
    return this.reportService.dashboard();
  }

  /** PDF: report commessa completo — GET /report/commessa?commessaId= (prima di commessa/:id) */
  @Get('commessa')
  async commessaPdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.commessaCompletoPdf(id);
    return this.pdfResponse(bytes, `report-commessa-${id.slice(0, 8)}.pdf`);
  }

  @Get('commessa/:id')
  getCommessaReport(@Param('id') id: string) {
    return this.reportService.commessaReport(id);
  }

  @Get('materiali/fornitori')
  getMaterialiPerFornitore() {
    return this.reportService.materialiPerFornitore();
  }

  @Get('dop')
  async dopPdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.dopPdf(id);
    return this.pdfResponse(bytes, `dop-${id.slice(0, 8)}.pdf`);
  }

  @Get('ce')
  async cePdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.cePdf(id);
    return this.pdfResponse(bytes, `marcatura-ce-${id.slice(0, 8)}.pdf`);
  }

  @Get('fascicolo-tecnico')
  async fascicoloTecnicoPdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.fascicoloTecnicoPdf(id);
    return this.pdfResponse(bytes, `fascicolo-tecnico-${id.slice(0, 8)}.pdf`);
  }

  @Get('materiali')
  async materialiPdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.materialiPdf(id);
    return this.pdfResponse(bytes, `report-materiali-${id.slice(0, 8)}.pdf`);
  }

  @Get('tracciabilita')
  async tracciabilitaPdf(@Query('commessaId') commessaId: string) {
    const id = this.requireCommessaId(commessaId);
    const bytes = await this.reportPdfService.tracciabilitaPdf(id);
    return this.pdfResponse(bytes, `report-tracciabilita-${id.slice(0, 8)}.pdf`);
  }
}
