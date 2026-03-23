/**
 * Generates editable .doc files using the Microsoft Word HTML format.
 * Unlike the image-based approach, this preserves text, tables, and formatting
 * as fully editable Word content. Charts/SVGs are converted to inline images.
 */

import { createExportClone } from '@/utils/exportLayoutSnapshot';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getSvgRenderSize(svg: SVGElement) {
  const rect = svg.getBoundingClientRect();
  const vb = svg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [];
  const vbWidth = Number.isFinite(vb[2]) ? vb[2] : 400;
  const vbHeight = Number.isFinite(vb[3]) ? vb[3] : 240;
  const parsedWidth = Number.parseFloat(svg.getAttribute('width') || '');
  const parsedHeight = Number.parseFloat(svg.getAttribute('height') || '');
  const width = Math.max(1, Math.round(rect.width || parsedWidth || vbWidth));
  const height = Math.max(1, Math.round(rect.height || parsedHeight || (width * vbHeight) / vbWidth));
  return { width, height };
}

function normalizeImages(container: HTMLElement): void {
  const images = Array.from(container.querySelectorAll('img'));
  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || img.naturalWidth || Number.parseFloat(img.getAttribute('width') || '') || 640));
    const height = Math.max(1, Math.round(rect.height || img.naturalHeight || Number.parseFloat(img.getAttribute('height') || '') || Math.round(width * 0.6)));
    img.setAttribute('width', String(Math.min(width, 680)));
    img.setAttribute('height', String(Math.round(Math.min(width, 680) * height / width)));
    img.style.width = `${Math.min(width, 680)}px`;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.pageBreakInside = 'avoid';
  });
}

/** Resolve CSS variables (e.g. hsl(var(--chart-1))) to computed color values */
function resolveCssVariablesInSvg(svg: SVGElement): void {
  const rootStyles = getComputedStyle(document.documentElement);
  
  // Resolve CSS variables in all elements' inline styles and attributes
  const allElements = Array.from(svg.querySelectorAll('*'));
  allElements.push(svg as unknown as Element);
  
  allElements.forEach((el) => {
    const computed = getComputedStyle(el);
    
    // Resolve color attributes
    const colorAttrs = ['fill', 'stroke', 'stop-color', 'flood-color', 'lighting-color'];
    colorAttrs.forEach((attr) => {
      const val = el.getAttribute(attr);
      if (val && (val.includes('var(') || val.includes('hsl(var'))) {
        const resolved = computed.getPropertyValue(attr === 'stop-color' ? 'stop-color' : attr).trim();
        if (resolved && resolved !== 'none' && resolved !== '') {
          el.setAttribute(attr, resolved);
        }
      }
    });

    // Resolve inline style properties that use CSS variables
    if (el instanceof HTMLElement || el instanceof SVGElement) {
      const style = (el as HTMLElement | SVGElement).style;
      if (style) {
        for (let i = 0; i < style.length; i++) {
          const prop = style[i];
          const value = style.getPropertyValue(prop);
          if (value && value.includes('var(')) {
            const computedValue = computed.getPropertyValue(prop).trim();
            if (computedValue) {
              style.setProperty(prop, computedValue);
            }
          }
        }
      }
    }
  });
  
  // Also resolve any hsl(var(...)) patterns in the SVG's raw markup as a fallback
  // by setting computed fill/stroke on elements that have them via CSS
  allElements.forEach((el) => {
    const computed = getComputedStyle(el);
    
    // If element has fill set via CSS class but not attribute, inline it
    const computedFill = computed.fill;
    const attrFill = el.getAttribute('fill');
    if (computedFill && computedFill !== 'none' && computedFill !== 'rgb(0, 0, 0)' && !attrFill) {
      el.setAttribute('fill', computedFill);
    }
    
    const computedStroke = computed.stroke;
    const attrStroke = el.getAttribute('stroke');
    if (computedStroke && computedStroke !== 'none' && !attrStroke) {
      el.setAttribute('stroke', computedStroke);
    }
  });
}

/** Convert all SVGs in a cloned DOM to inline PNG images */
async function convertSvgsToImages(container: HTMLElement): Promise<void> {
  const svgs = Array.from(container.querySelectorAll('svg'));
  for (const svg of svgs) {
    try {
      const { width: w, height: h } = getSvgRenderSize(svg);
      // Cap maximum dimensions to avoid oversized images in Word
      const maxW = Math.min(w, 700);
      const maxH = Math.round(maxW * h / w);
      const canvas = document.createElement('canvas');
      canvas.width = maxW * 2;
      canvas.height = maxH * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Resolve CSS variables to computed colors before serializing
        resolveCssVariablesInSvg(svg);
        
        // Ensure the SVG has explicit width/height for rendering
        const svgClone = svg.cloneNode(true) as SVGElement;
        svgClone.setAttribute('width', String(maxW));
        svgClone.setAttribute('height', String(maxH));
        if (!svgClone.getAttribute('xmlns')) {
          svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        }
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const img = new Image();
        const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Falha ao carregar SVG para exportação DOCX.'));
          img.src = svgUrl;
        });
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0, maxW, maxH);
        const imgEl = document.createElement('img');
        imgEl.src = canvas.toDataURL('image/png');
        imgEl.setAttribute('width', String(maxW));
        imgEl.setAttribute('height', String(maxH));
        imgEl.style.cssText = `display:block;width:${maxW}px;max-width:100%;height:auto;object-fit:contain;page-break-inside:avoid;`;
        svg.parentNode?.replaceChild(imgEl, svg);
      }
    } catch (e) {
      console.warn('SVG conversion error:', e);
    }
  }
}

/** Build an MS Word-compatible HTML document from an HTML string */
function buildWordHtml(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="CERD IV System">
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml>
<![endif]-->
<title>${title}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; max-width: none; padding: 0; }
  h1 { font-size: 18pt; color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 6px; }
  h2 { font-size: 15pt; color: #16213e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18pt; }
  h3 { font-size: 13pt; color: #0f3460; margin-top: 14pt; }
  h4 { font-size: 11pt; color: #333; margin-top: 10pt; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
  th { background: #0f3460; color: white; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { padding: 4px 7px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  img { display: block; max-width: 680px; height: auto; object-fit: contain; page-break-inside: avoid; }
  svg, canvas { max-width: 680px; height: auto; }
  .chart-container, .recharts-responsive-container, .recharts-wrapper, table { page-break-inside: avoid; break-inside: avoid; }
  .data-grid, .kpi-grid { display: block; }
  .data-card, .kpi { display: inline-block; width: 23%; margin: 4px; vertical-align: top; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8pt; font-weight: 600; }
  .source { font-size: 8pt; color: #94a3b8; font-style: italic; }
</style>
</head>
<body>${bodyHtml}</body></html>`;
}

/** Download editable .doc from a rendered DOM element */
export async function downloadElementAsEditableDoc(element: HTMLElement, fileName: string) {
  // Resolve CSS variables on original SVGs (they're still in the DOM) then convert on clone
  // We need the original SVGs for getComputedStyle, so resolve on originals first
  const originalSvgs = Array.from(element.querySelectorAll('svg'));
  originalSvgs.forEach((svg) => resolveCssVariablesInSvg(svg));

  const resolvedClone = createExportClone(element);
  
  // Convert SVGs to images
  await convertSvgsToImages(resolvedClone);
  normalizeImages(resolvedClone);
  
  const docContent = buildWordHtml(resolvedClone.innerHTML, fileName.replace(/-/g, ' '));
  
  const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(fileName)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Download editable .doc from an HTML string */
export async function downloadHtmlAsEditableDoc(html: string, fileName: string) {
  // Render in hidden iframe to get computed content and convert SVGs
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:1440px;height:9000px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error('Falha ao preparar o conteúdo do documento.');

    // Wait for fonts/images and chart animations
    if (iframeDoc.fonts?.ready) {
      try { await iframeDoc.fonts.ready; } catch { /* ignore */ }
    }
    // Wait longer for Recharts animations to complete
    await new Promise((r) => setTimeout(r, 2000));

    // Remove toolbars
    iframeDoc.querySelector('.export-toolbar')?.remove();
    iframeDoc.querySelector('.print-instructions')?.remove();

    const target = (iframeDoc.querySelector('.export-captured-content') || iframeDoc.querySelector('main') || iframeDoc.body) as HTMLElement;
    
    // Resolve CSS variables and convert SVGs
    const svgs = Array.from(target.querySelectorAll('svg'));
    svgs.forEach((svg) => resolveCssVariablesInSvg(svg));
    await convertSvgsToImages(target);
    normalizeImages(target);

    const docContent = buildWordHtml(target.innerHTML, fileName.replace(/-/g, ' '));
    
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFileName(fileName)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    iframe.remove();
  }
}
