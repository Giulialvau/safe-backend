import { Injectable, NotFoundException } from '@nestjs/common';
import { NcStato, type Checklist, type Commessa } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  applyTemplate,
  escapeHtml,
  formatDateIt,
  formatDateTimeIt,
  loadHtmlTemplate,
  renderHtmlToPdf,
  type RenderPdfOptions,
} from './report-pdf.renderer';

@Injectable()
export class ReportPdfService {
  constructor(private readonly prisma: PrismaService) {}

  private async commessaOrThrow(id: string): Promise<Commessa> {
    const c = await this.prisma.commessa.findUnique({ where: { id } });
    if (!c) {
      throw new NotFoundException(`Commessa ${id} non trovata`);
    }
    return c;
  }

  private commessaVars(c: Commessa): Record<string, string> {
    return {
      COMMESSA_CODICE: escapeHtml(c.codice),
      COMMESSA_CLIENTE: escapeHtml(c.cliente),
      COMMESSA_TITOLO: escapeHtml(c.titolo ?? '—'),
      COMMESSA_DESCRIZIONE: escapeHtml(c.descrizione ?? '—'),
      COMMESSA_RESPONSABILE: escapeHtml(c.responsabile ?? '—'),
      COMMESSA_LUOGO: escapeHtml(c.luogo ?? '—'),
      COMMESSA_DATA_INIZIO: formatDateIt(c.dataInizio),
      COMMESSA_DATA_FINE: formatDateIt(c.dataFine),
      COMMESSA_STATO: escapeHtml(String(c.stato)),
      GENERATO_IL: formatDateTimeIt(new Date()),
    };
  }

  private async renderTemplate(
    filename: string,
    vars: Record<string, string>,
    pdfOptions?: RenderPdfOptions,
  ): Promise<Uint8Array> {
    const raw = loadHtmlTemplate(filename);
    const html = applyTemplate(raw, vars);
    return renderHtmlToPdf(html, pdfOptions);
  }

  async dopPdf(commessaId: string): Promise<Uint8Array> {
    const c = await this.commessaOrThrow(commessaId);
    const DOP_TESTO = escapeHtml(
      'Il presente documento è generato automaticamente dai dati registrati nel sistema. ' +
        'Verificare la conformità alla normativa vigente e completare i campi legali ove richiesto.',
    );
    return this.renderTemplate('dop.html', {
      ...this.commessaVars(c),
      DOC_TITLE: 'Dichiarazione di Prestazione (DoP)',
      DOP_TESTO,
    });
  }

  async cePdf(commessaId: string): Promise<Uint8Array> {
    const c = await this.commessaOrThrow(commessaId);
    const CE_TESTO = escapeHtml(
      'Il fascicolo tecnico e la tracciabilità devono essere coerenti con la marcatura CE applicata in officina. ' +
        'Adattare alle procedure aziendali di marcatura e controllo.',
    );
    return this.renderTemplate('ce.html', {
      ...this.commessaVars(c),
      DOC_TITLE: 'Marcatura CE',
      CE_TESTO,
    });
  }

  /**
   * Fascicolo Tecnico EN 1090 unico: copertina + DoP + CE + materiali + tracciabilità +
   * checklist + NC + audit + qualifiche + WPS/WPQR + riepilogo (HTML concatenato, un PDF).
   */
  async fascicoloTecnicoPdf(commessaId: string): Promise<Uint8Array> {
    const data = await this.prisma.commessa.findUnique({
      where: { id: commessaId },
      include: {
        materiali: {
          orderBy: { codice: 'asc' },
          include: {
            certificatoDocumento: { select: { nome: true, tipo: true } },
          },
        },
        tracciabilita: {
          orderBy: { posizione: 'asc' },
          include: {
            materiale: { select: { codice: true, lotto: true } },
          },
        },
        checklists: { orderBy: { titolo: 'asc' } },
        nonConformita: { orderBy: { dataApertura: 'desc' } },
        audits: { orderBy: { data: 'desc' } },
        wps: {
          orderBy: { codice: 'asc' },
          include: { materiale: { select: { descrizione: true } } },
        },
        wpqr: {
          orderBy: { codice: 'asc' },
          include: {
            wps: { select: { codice: true } },
            qualifica: {
              select: {
                id: true,
                nome: true,
                ruolo: true,
                scadenza: true,
                documento: true,
              },
            },
          },
        },
        _count: {
          select: {
            materiali: true,
            documenti: true,
            tracciabilita: true,
            checklists: true,
            nonConformita: true,
            audits: true,
            wps: true,
            wpqr: true,
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }

    const base = this.commessaVars(data);
    const DOP_TESTO = escapeHtml(
      'Il presente documento è generato automaticamente dai dati registrati nel sistema. ' +
        'Verificare la conformità alla normativa vigente e completare i campi legali ove richiesto.',
    );
    const CE_TESTO = escapeHtml(
      'Il fascicolo tecnico e la tracciabilità devono essere coerenti con la marcatura CE applicata in officina. ' +
        'Adattare alle procedure aziendali di marcatura e controllo.',
    );
    const RIEPILOGO_NOTA = escapeHtml(
      'Per il dettaglio operativo utilizzare i singoli moduli EN 1090 del gestionale. ' +
        'Questo fascicolo costituisce una sintesi ai fini della documentazione di costruzione.',
    );

    const MATERIALI_ROWS = this.buildMaterialiRows(data.materiali);
    const TRACCIABILITA_ROWS = this.buildTracciabilitaRows(
      data.tracciabilita,
      data.codice,
    );
    const CHECKLIST_CONTENT = this.fascicoloChecklistSectionsHtml(data.checklists);
    const NC_ROWS = this.buildNcRows(data.nonConformita);
    const AUDIT_ROWS = this.buildAuditRows(data.audits);
    const WPS_ROWS = this.buildWpsRows(data.wps);
    const WPQR_ROWS = this.buildWpqrRows(data.wpqr);
    const QUALIFICHE_ROWS = this.buildQualificheDistinctRows(data.wpqr);

    const cnt = data._count;
    const riepilogoVars = {
      ...base,
      COUNT_MATERIALI: String(cnt.materiali),
      COUNT_DOCUMENTI: String(cnt.documenti),
      COUNT_TRACCIABILITA: String(cnt.tracciabilita),
      COUNT_CHECKLIST: String(cnt.checklists),
      COUNT_NC: String(cnt.nonConformita),
      COUNT_AUDIT: String(cnt.audits),
      COUNT_WPS: String(cnt.wps),
      COUNT_WPQR: String(cnt.wpqr),
      RIEPILOGO_NOTA,
    };

    const sectionFiles = [
      'fascicolo/01-cover.html',
      'fascicolo/02-dop.html',
      'fascicolo/03-ce.html',
      'fascicolo/04-materiali.html',
      'fascicolo/05-tracciabilita.html',
      'fascicolo/06-checklist.html',
      'fascicolo/07-nc.html',
      'fascicolo/08-audit.html',
      'fascicolo/09-qualifiche.html',
      'fascicolo/10-wps-wpqr.html',
      'fascicolo/11-riepilogo.html',
    ] as const;

    const sectionVars: Record<string, string>[] = [
      { ...base },
      { ...base, DOP_TESTO },
      { ...base, CE_TESTO },
      {
        ...base,
        TOTAL_MATERIALI: String(data.materiali.length),
        MATERIALI_ROWS,
      },
      {
        ...base,
        TOTAL_RECORDS: String(data.tracciabilita.length),
        TRACCIABILITA_ROWS,
      },
      { ...base, CHECKLIST_CONTENT },
      { ...base, NC_ROWS },
      { ...base, AUDIT_ROWS },
      { ...base, QUALIFICHE_ROWS },
      { ...base, WPS_ROWS, WPQR_ROWS },
      riepilogoVars,
    ];

    const bodyParts = sectionFiles.map((file, i) =>
      applyTemplate(loadHtmlTemplate(file), sectionVars[i]!),
    );
    const body = bodyParts.join('\n');

    const html = applyTemplate(loadHtmlTemplate('fascicolo-tecnico-shell.html'), {
      ...base,
      BODY: body,
    });
    return renderHtmlToPdf(html, {
      footerNote: `Generato il ${formatDateTimeIt(new Date())}`,
    });
  }

  private buildMaterialiRows(
    materiali: Array<{
      codice: string;
      descrizione: string;
      lotto: string | null;
      fornitore: string | null;
      norma: string | null;
      certificato31: string | null;
      certificatoDocumento: { nome: string; tipo: string } | null;
    }>,
  ): string {
    if (materiali.length === 0) {
      return '<tr><td colspan="7">Nessun materiale registrato.</td></tr>';
    }
    return materiali
      .map((m) => {
        const certNome = m.certificatoDocumento?.nome;
        const cert =
          certNome != null
            ? `${escapeHtml(certNome)} (${escapeHtml(m.certificatoDocumento?.tipo ?? '')})`
            : '—';
        return `<tr><td>${escapeHtml(m.codice)}</td><td>${escapeHtml(m.descrizione)}</td><td>${escapeHtml(m.lotto ?? '—')}</td><td>${escapeHtml(m.fornitore ?? '—')}</td><td>${escapeHtml(m.norma ?? '—')}</td><td>${escapeHtml(m.certificato31 ?? '—')}</td><td>${cert}</td></tr>`;
      })
      .join('');
  }

  private buildTracciabilitaRows(
    rows: Array<{
      posizione: string;
      quantita: unknown;
      descrizioneComponente: string | null;
      riferimentoDisegno: string | null;
      materiale: { codice: string; lotto: string | null } | null;
    }>,
    commessaCodice: string,
  ): string {
    const code = escapeHtml(commessaCodice);
    if (rows.length === 0) {
      return '<tr><td colspan="7">Nessun record.</td></tr>';
    }
    return rows
      .map((r) => {
        const mc = r.materiale;
        return `<tr><td>${escapeHtml(mc?.codice ?? '—')}</td><td>${escapeHtml(mc?.lotto ?? '—')}</td><td>${escapeHtml(r.descrizioneComponente ?? '—')}</td><td>${escapeHtml(r.posizione)}</td><td>${escapeHtml(String(r.quantita))}</td><td>${code}</td><td>${escapeHtml(r.riferimentoDisegno ?? '—')}</td></tr>`;
      })
      .join('');
  }

  private elementiTableRows(elementi: unknown): string {
    if (!Array.isArray(elementi) || elementi.length === 0) {
      return '<tr><td colspan="5">Nessun punto controllo.</td></tr>';
    }
    return elementi
      .map((e, i) => {
        const o = e as Record<string, unknown>;
        return `<tr><td>${i + 1}</td><td>${escapeHtml(String(o.descrizione ?? ''))}</td><td>${o.completato ? 'Sì' : 'No'}</td><td>${escapeHtml(String(o.risposta ?? '—'))}</td><td>${escapeHtml(String(o.note ?? '—'))}</td></tr>`;
      })
      .join('');
  }

  private fascicoloChecklistSectionsHtml(checklists: Checklist[]): string {
    if (checklists.length === 0) {
      return '<p class="note">Nessuna checklist registrata per questa commessa.</p>';
    }
    return checklists
      .map((cl) => {
        const elRows = this.elementiTableRows(cl.elementi);
        const noteBlock = cl.note
          ? `<p class="note">${escapeHtml(cl.note)}</p>`
          : '';
        return `
      <h3 class="sub-sec">${escapeHtml(cl.titolo)}</h3>
      <p style="font-size:9pt;">Categoria: ${escapeHtml(cl.categoria)} | Fase: ${escapeHtml(cl.fase ?? '—')} | Stato: ${escapeHtml(String(cl.stato))} | Esito: ${cl.esito ? escapeHtml(String(cl.esito)) : '—'}</p>
      ${noteBlock}
      <table class="grid">
        <thead><tr><th>#</th><th>Punto controllo</th><th>Completato</th><th>Risposta</th><th>Note</th></tr></thead>
        <tbody>${elRows}</tbody>
      </table>`;
      })
      .join('');
  }

  private buildNcRows(
    rows: Array<{
      titolo: string;
      stato: unknown;
      gravita: unknown;
      dataApertura: Date;
      azioniCorrettive: string | null;
    }>,
  ): string {
    if (rows.length === 0) {
      return '<tr><td colspan="5">Nessuna NC.</td></tr>';
    }
    return rows
      .map(
        (n) =>
          `<tr><td>${escapeHtml(n.titolo)}</td><td>${escapeHtml(String(n.stato))}</td><td>${escapeHtml(String(n.gravita))}</td><td>${formatDateIt(n.dataApertura)}</td><td>${escapeHtml((n.azioniCorrettive ?? '—').slice(0, 240))}</td></tr>`,
      )
      .join('');
  }

  private buildAuditRows(
    rows: Array<{
      titolo: string;
      data: Date;
      auditor: string;
      esito: unknown;
      note: string | null;
    }>,
  ): string {
    if (rows.length === 0) {
      return '<tr><td colspan="5">Nessun audit.</td></tr>';
    }
    return rows
      .map(
        (a) =>
          `<tr><td>${escapeHtml(a.titolo)}</td><td>${formatDateIt(a.data)}</td><td>${escapeHtml(a.auditor)}</td><td>${escapeHtml(String(a.esito))}</td><td>${escapeHtml((a.note ?? '—').slice(0, 140))}</td></tr>`,
      )
      .join('');
  }

  private buildWpsRows(
    rows: Array<{
      codice: string;
      processo: string;
      materialeBase: string | null;
      scadenza: Date | null;
      materiale: { descrizione: string } | null;
    }>,
  ): string {
    if (rows.length === 0) {
      return '<tr><td colspan="4">Nessuna WPS.</td></tr>';
    }
    return rows
      .map(
        (w) =>
          `<tr><td>${escapeHtml(w.codice)}</td><td>${escapeHtml(w.processo)}</td><td>${escapeHtml(w.materialeBase ?? w.materiale?.descrizione ?? '—')}</td><td>${formatDateIt(w.scadenza)}</td></tr>`,
      )
      .join('');
  }

  private buildWpqrRows(
    rows: Array<{
      codice: string;
      saldatore: string;
      dataQualifica: Date;
      scadenza: Date | null;
      wps: { codice: string } | null;
      qualifica: { nome: string } | null;
    }>,
  ): string {
    if (rows.length === 0) {
      return '<tr><td colspan="6">Nessun WPQR.</td></tr>';
    }
    return rows
      .map((q) => {
        const wpsC = q.wps?.codice ?? '—';
        const qual = q.qualifica?.nome ?? '—';
        return `<tr><td>${escapeHtml(q.codice)}</td><td>${escapeHtml(q.saldatore)}</td><td>${escapeHtml(wpsC)}</td><td>${formatDateIt(q.dataQualifica)}</td><td>${formatDateIt(q.scadenza)}</td><td>${escapeHtml(qual)}</td></tr>`;
      })
      .join('');
  }

  private buildQualificheDistinctRows(
    wpqr: Array<{
      qualifica: {
        id: string;
        nome: string;
        ruolo: string;
        scadenza: Date | null;
        documento: string | null;
      } | null;
    }>,
  ): string {
    const map = new Map<
      string,
      { nome: string; ruolo: string; scadenza: Date | null; documento: string | null }
    >();
    for (const w of wpqr) {
      if (w.qualifica) {
        map.set(w.qualifica.id, {
          nome: w.qualifica.nome,
          ruolo: w.qualifica.ruolo,
          scadenza: w.qualifica.scadenza,
          documento: w.qualifica.documento,
        });
      }
    }
    if (map.size === 0) {
      return '<tr><td colspan="4">Nessuna qualifica anagrafica collegata ai WPQR.</td></tr>';
    }
    return [...map.values()]
      .map(
        (q) =>
          `<tr><td>${escapeHtml(q.nome)}</td><td>${escapeHtml(q.ruolo)}</td><td>${formatDateIt(q.scadenza)}</td><td>${escapeHtml(q.documento ?? '—')}</td></tr>`,
      )
      .join('');
  }

  async materialiPdf(commessaId: string): Promise<Uint8Array> {
    const c = await this.commessaOrThrow(commessaId);
    const materiali = await this.prisma.materiale.findMany({
      where: { commessaId },
      orderBy: { codice: 'asc' },
      include: {
        certificatoDocumento: {
          select: { nome: true, tipo: true },
        },
      },
    });
    const MATERIALI_ROWS =
      materiali.length === 0
        ? '<tr><td colspan="7">Nessun materiale registrato.</td></tr>'
        : materiali
            .map((m) => {
              const certNome = m.certificatoDocumento?.nome;
              const cert =
                certNome != null
                  ? `${escapeHtml(certNome)} (${escapeHtml(m.certificatoDocumento?.tipo ?? '')})`
                  : '—';
              return `<tr><td>${escapeHtml(m.codice)}</td><td>${escapeHtml(m.descrizione)}</td><td>${escapeHtml(m.lotto ?? '—')}</td><td>${escapeHtml(m.fornitore ?? '—')}</td><td>${escapeHtml(m.norma ?? '—')}</td><td>${escapeHtml(m.certificato31 ?? '—')}</td><td>${cert}</td></tr>`;
            })
            .join('');
    return this.renderTemplate('materiali.html', {
      ...this.commessaVars(c),
      DOC_TITLE: 'Report materiali',
      TOTAL_MATERIALI: String(materiali.length),
      MATERIALI_ROWS,
    });
  }

  async tracciabilitaPdf(commessaId: string): Promise<Uint8Array> {
    const c = await this.commessaOrThrow(commessaId);
    const rows = await this.prisma.tracciabilita.findMany({
      where: { commessaId },
      include: {
        materiale: { select: { codice: true, lotto: true } },
      },
      orderBy: { posizione: 'asc' },
    });
    const code = escapeHtml(c.codice);
    const TRACCIABILITA_ROWS =
      rows.length === 0
        ? '<tr><td colspan="7">Nessun record.</td></tr>'
        : rows
            .map((r) => {
              const mc = r.materiale;
              return `<tr><td>${escapeHtml(mc?.codice ?? '—')}</td><td>${escapeHtml(mc?.lotto ?? '—')}</td><td>${escapeHtml(r.descrizioneComponente ?? '—')}</td><td>${escapeHtml(r.posizione)}</td><td>${escapeHtml(String(r.quantita))}</td><td>${code}</td><td>${escapeHtml(r.riferimentoDisegno ?? '—')}</td></tr>`;
            })
            .join('');
    return this.renderTemplate('tracciabilita.html', {
      ...this.commessaVars(c),
      DOC_TITLE: 'Report tracciabilità',
      TOTAL_RECORDS: String(rows.length),
      TRACCIABILITA_ROWS,
    });
  }

  private checklistRowsHtml(checklists: Checklist[]): string {
    if (checklists.length === 0) {
      return '<tr><td colspan="5">Nessuna checklist.</td></tr>';
    }
    return checklists
      .map((cl) => {
        const sum = this.elementiSummary(cl.elementi);
        return `<tr><td>${escapeHtml(cl.titolo)}</td><td>${escapeHtml(String(cl.stato))}</td><td>${escapeHtml(cl.esito != null ? String(cl.esito) : '—')}</td><td>${escapeHtml(cl.note ?? '—')}</td><td>${sum}</td></tr>`;
      })
      .join('');
  }

  private elementiSummary(elementi: unknown): string {
    if (!Array.isArray(elementi)) return '—';
    const parts: string[] = [];
    for (let i = 0; i < Math.min(elementi.length, 6); i++) {
      const o = elementi[i] as Record<string, unknown>;
      parts.push(String(o.descrizione ?? ''));
    }
    const s = parts.filter(Boolean).join(' · ');
    const out = s.length > 280 ? `${s.slice(0, 280)}…` : s;
    return escapeHtml(out || '—');
  }

  /**
   * Report Commessa avanzato — GET /report/commessa?commessaId=
   * Workflow EN 1090, tabelle sintetiche, grafico a barre (SVG), footer con data.
   */
  async commessaCompletoPdf(commessaId: string): Promise<Uint8Array> {
    const data = await this.prisma.commessa.findUnique({
      where: { id: commessaId },
      include: {
        _count: {
          select: {
            materiali: true,
            documenti: true,
            nonConformita: true,
            checklists: true,
            audits: true,
            wps: true,
            wpqr: true,
            tracciabilita: true,
            pianiControllo: true,
          },
        },
        materiali: {
          take: 15,
          orderBy: { codice: 'asc' },
          include: {
            certificatoDocumento: { select: { nome: true, tipo: true } },
          },
        },
        tracciabilita: {
          take: 20,
          orderBy: { posizione: 'asc' },
          include: {
            materiale: { select: { codice: true, lotto: true } },
          },
        },
        checklists: { take: 12, orderBy: { titolo: 'asc' } },
        nonConformita: { take: 15, orderBy: { dataApertura: 'desc' } },
        audits: { take: 12, orderBy: { data: 'desc' } },
        wps: {
          orderBy: { codice: 'asc' },
          include: { materiale: { select: { descrizione: true } } },
        },
        wpqr: {
          orderBy: { codice: 'asc' },
          include: {
            wps: { select: { codice: true } },
            qualifica: {
              select: {
                id: true,
                nome: true,
                ruolo: true,
                scadenza: true,
                documento: true,
              },
            },
          },
        },
      },
    });
    if (!data) {
      throw new NotFoundException(`Commessa ${commessaId} non trovata`);
    }

    const [ncAperteDb, ncChiuseDb] = await Promise.all([
      this.prisma.nonConformita.count({
        where: { commessaId, stato: { not: NcStato.CHIUSA } },
      }),
      this.prisma.nonConformita.count({
        where: { commessaId, stato: NcStato.CHIUSA },
      }),
    ]);
    const ncTotalDb = ncAperteDb + ncChiuseDb;

    const cnt = data._count;
    const overview = Boolean(
      String(data.codice ?? '').trim() && String(data.cliente ?? '').trim(),
    );
    const workflowPhases: Array<{ label: string; ok: boolean; note: string }> =
      [
        {
          label: 'Anagrafica commessa',
          ok: overview,
          note: overview ? 'Codice e cliente valorizzati' : 'Completare dati obbligatori',
        },
        {
          label: 'Materiali',
          ok: cnt.materiali > 0,
          note: `${cnt.materiali} lotti registrati`,
        },
        {
          label: 'Documenti',
          ok: cnt.documenti > 0,
          note: `${cnt.documenti} documenti`,
        },
        {
          label: 'Checklist',
          ok: cnt.checklists > 0,
          note: `${cnt.checklists} checklist`,
        },
        {
          label: 'Tracciabilità',
          ok: cnt.tracciabilita > 0,
          note: `${cnt.tracciabilita} record`,
        },
        {
          label: 'Non conformità (nessuna aperta)',
          ok: ncAperteDb === 0,
          note:
            ncAperteDb === 0
              ? `Nessuna NC aperta (${ncChiuseDb} chiuse)`
              : `${ncAperteDb} NC aperte`,
        },
        {
          label: 'WPS / WPQR',
          ok: cnt.wps > 0 && cnt.wpqr > 0,
          note: `${cnt.wps} WPS, ${cnt.wpqr} WPQR`,
        },
        {
          label: 'Qualifiche saldatori (WPQR)',
          ok: cnt.wpqr > 0,
          note: `${cnt.wpqr} WPQR collegati`,
        },
        {
          label: 'Audit FPC',
          ok: cnt.audits > 0,
          note: `${cnt.audits} audit`,
        },
        {
          label: 'Piani di controllo',
          ok: cnt.pianiControllo > 0,
          note: `${cnt.pianiControllo} piani`,
        },
        {
          label: 'Report / fascicolo dati',
          ok: true,
          note: 'Dati commessa disponibili nel sistema',
        },
      ];

    const workflowDone = workflowPhases.filter((p) => p.ok).length;
    const workflowTotal = workflowPhases.length;
    const workflowPct = Math.round((workflowDone / workflowTotal) * 100);

    const WORKFLOW_ROWS = workflowPhases
      .map(
        (p) =>
          `<tr><td>${escapeHtml(p.label)}</td><td>${p.ok ? 'Sì' : 'No'}</td><td>${escapeHtml(p.note)}</td></tr>`,
      )
      .join('');
    const WORKFLOW_CHART_SVG = this.buildWorkflowBarChartSvg(
      workflowPhases.map(({ label, ok }) => ({ label, ok })),
    );

    const MATERIALI_ROWS = this.buildMaterialiRowsReport(data.materiali);
    const TRACCIABILITA_ROWS = this.buildTracciabilitaRowsShort(data.tracciabilita);
    const CHECKLIST_ROWS = this.checklistRowsReportShort(data.checklists);

    const NC_ROWS =
      data.nonConformita.length === 0
        ? '<tr><td colspan="4">Nessuna NC in elenco (estratti recenti).</td></tr>'
        : data.nonConformita
            .map(
              (n) =>
                `<tr><td>${escapeHtml(n.titolo)}</td><td>${escapeHtml(String(n.stato))}</td><td>${escapeHtml(String(n.gravita))}</td><td>${formatDateIt(n.dataApertura)}</td></tr>`,
            )
            .join('');

    const AUDIT_ROWS =
      data.audits.length === 0
        ? '<tr><td colspan="5">Nessun audit.</td></tr>'
        : data.audits
            .map(
              (a) =>
                `<tr><td>${escapeHtml(a.titolo)}</td><td>${formatDateIt(a.data)}</td><td>${escapeHtml(a.auditor)}</td><td>${escapeHtml(String(a.esito))}</td><td>${escapeHtml((a.note ?? '—').slice(0, 100))}</td></tr>`,
            )
            .join('');

    const WPS_ROWS = this.buildWpsRows(data.wps);
    const WPQR_ROWS = this.buildWpqrRows(data.wpqr);
    const QUALIFICHE_ROWS = this.buildQualificheDistinctRows(data.wpqr);

    const gen = formatDateTimeIt(new Date());
    return this.renderTemplate(
      'report-commessa.html',
      {
        ...this.commessaVars(data),
        GENERATO_IL: gen,
        WORKFLOW_ROWS,
        WORKFLOW_PCT: String(workflowPct),
        WORKFLOW_DONE: String(workflowDone),
        WORKFLOW_TOTAL: String(workflowTotal),
        WORKFLOW_CHART_SVG,
        MATERIALI_ROWS,
        TRACCIABILITA_ROWS,
        NC_APERTE: String(ncAperteDb),
        NC_CHIUSE: String(ncChiuseDb),
        NC_TOTAL: String(ncTotalDb),
        NC_ROWS,
        AUDIT_ROWS,
        CHECKLIST_ROWS,
        QUALIFICHE_ROWS,
        WPS_ROWS,
        WPQR_ROWS,
        COUNT_MATERIALI: String(cnt.materiali),
        COUNT_DOCUMENTI: String(cnt.documenti),
        COUNT_TRACCIABILITA: String(cnt.tracciabilita),
        COUNT_CHECKLIST: String(cnt.checklists),
        COUNT_NC: String(cnt.nonConformita),
        COUNT_AUDIT: String(cnt.audits),
        COUNT_WPS: String(cnt.wps),
        COUNT_WPQR: String(cnt.wpqr),
        COUNT_PIANI: String(cnt.pianiControllo),
        REPORT_FOOTER_NOTE: escapeHtml(
          'Le NC in tabella sono un estratto (max 15). I totali aperte/chiuse si riferiscono all’intera commessa.',
        ),
      },
      { footerNote: `Generato il ${gen}` },
    );
  }

  private buildWorkflowBarChartSvg(
    phases: Array<{ label: string; ok: boolean }>,
  ): string {
    const w = 480;
    const rowH = 22;
    const startY = 30;
    const h = startY + phases.length * rowH + 14;
    const parts: string[] = [
      `<text x="6" y="18" font-size="11" font-weight="bold" font-family="Arial,Helvetica,sans-serif">Avanzamento fasi EN 1090 (barre)</text>`,
    ];
    phases.forEach((p, i) => {
      const y = startY + i * rowH;
      const barW = p.ok ? 180 : 72;
      const fill = p.ok ? '#2d7a4e' : '#c5c5c5';
      const lab = p.label.length > 38 ? `${p.label.slice(0, 36)}…` : p.label;
      parts.push(
        `<text x="6" y="${y + 12}" font-size="8.5" font-family="Arial,Helvetica,sans-serif">${escapeHtml(lab)}</text>`,
      );
      parts.push(
        `<rect x="200" y="${y}" width="${barW}" height="14" fill="${fill}" rx="2"/>`,
      );
      parts.push(
        `<text x="392" y="${y + 12}" font-size="8.5" font-family="Arial,Helvetica,sans-serif">${p.ok ? 'OK' : '—'}</text>`,
      );
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${parts.join('')}</svg>`;
  }

  private buildMaterialiRowsReport(
    materiali: Array<{
      codice: string;
      descrizione: string;
      lotto: string | null;
      fornitore: string | null;
      norma: string | null;
      certificatoDocumento: { nome: string; tipo: string } | null;
    }>,
  ): string {
    if (materiali.length === 0) {
      return '<tr><td colspan="6">Nessun materiale.</td></tr>';
    }
    return materiali
      .map((m) => {
        const cert = m.certificatoDocumento?.nome
          ? escapeHtml(m.certificatoDocumento.nome)
          : '—';
        return `<tr><td>${escapeHtml(m.codice)}</td><td>${escapeHtml(m.descrizione)}</td><td>${escapeHtml(m.lotto ?? '—')}</td><td>${escapeHtml(m.fornitore ?? '—')}</td><td>${escapeHtml(m.norma ?? '—')}</td><td>${cert}</td></tr>`;
      })
      .join('');
  }

  private buildTracciabilitaRowsShort(
    rows: Array<{
      posizione: string;
      quantita: unknown;
      descrizioneComponente: string | null;
      materiale: { codice: string; lotto: string | null } | null;
    }>,
  ): string {
    if (rows.length === 0) {
      return '<tr><td colspan="5">Nessun record.</td></tr>';
    }
    return rows
      .map((r) => {
        const mc = r.materiale;
        return `<tr><td>${escapeHtml(mc?.codice ?? '—')}</td><td>${escapeHtml(mc?.lotto ?? '—')}</td><td>${escapeHtml(r.descrizioneComponente ?? '—')}</td><td>${escapeHtml(r.posizione)}</td><td>${escapeHtml(String(r.quantita))}</td></tr>`;
      })
      .join('');
  }

  private checklistRowsReportShort(checklists: Checklist[]): string {
    if (checklists.length === 0) {
      return '<tr><td colspan="5">Nessuna checklist.</td></tr>';
    }
    return checklists
      .map((cl) => {
        const cat = cl.fase
          ? `${escapeHtml(cl.categoria)} / ${escapeHtml(cl.fase)}`
          : escapeHtml(cl.categoria);
        return `<tr><td>${escapeHtml(cl.titolo)}</td><td>${escapeHtml(String(cl.stato))}</td><td>${escapeHtml(cl.esito != null ? String(cl.esito) : '—')}</td><td>${cat}</td><td>${escapeHtml((cl.note ?? '—').slice(0, 100))}</td></tr>`;
      })
      .join('');
  }
}
