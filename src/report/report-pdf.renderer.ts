import { readFileSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

/** Carica template HTML da dist/report/templates (build) o src (dev ts-node) */
export function loadHtmlTemplate(filename: string): string {
  const candidates = [
    join(__dirname, 'templates', filename),
    join(process.cwd(), 'src', 'report', 'templates', filename),
  ];
  for (const p of candidates) {
    try {
      return readFileSync(p, 'utf-8');
    } catch {
      /* try next */
    }
  }
  throw new Error(`Template non trovato: ${filename}`);
}

export function escapeHtml(s: string | null | undefined): string {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatDateIt(
  d: Date | string | null | undefined,
): string {
  if (d == null) return '—';
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return x.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTimeIt(d: Date | string | null | undefined): string {
  if (d == null) return '—';
  const x = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) return '—';
  return x.toLocaleString('it-IT');
}

/**
 * Sostituisce {{CHIAVE}} nel template. Valori già HTML (es. righe tabella) non devono essere ri-escapati.
 */
export function applyTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.split(`{{${key}}}`).join(value);
  }
  return out;
}

const FOOTER_TMPL = `
<div style="width:100%;font-size:9px;text-align:center;color:#555;font-family:Arial,Helvetica,sans-serif;padding:6px 0 0;border-top:1px solid #ddd;">
  Pagina <span class="pageNumber"></span> / <span class="totalPages"></span>
</div>
`;

export type RenderPdfOptions = {
  /** Riga nel footer (es. data/ora generazione), prima dei numeri di pagina */
  footerNote?: string;
};

function buildFooterTemplate(options?: RenderPdfOptions): string {
  const note = options?.footerNote?.trim();
  if (!note) return FOOTER_TMPL;
  const safe = escapeHtml(note);
  return `
<div style="width:100%;font-size:8px;text-align:center;color:#555;font-family:Arial,Helvetica,sans-serif;padding:5px 0 0;border-top:1px solid #ddd;">
  <div style="margin-bottom:2px;">${safe}</div>
  <div>Pagina <span class="pageNumber"></span> / <span class="totalPages"></span></div>
</div>`;
}

export async function renderHtmlToPdf(
  html: string,
  options?: RenderPdfOptions,
): Promise<Uint8Array> {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: 'load',
      timeout: 120_000,
    });
    const buf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '22mm',
        left: '20mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: buildFooterTemplate(options),
    });
    return new Uint8Array(buf);
  } finally {
    await browser.close();
  }
}
