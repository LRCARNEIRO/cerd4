/**
 * Generates editable .doc files using the Microsoft Word HTML format.
 * Unlike the image-based approach, this preserves text, tables, and formatting
 * as fully editable Word content. Charts/SVGs are converted to inline images.
 */

import { createExportClone } from '@/utils/exportLayoutSnapshot';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/** Resolve CSS variables (e.g. hsl(var(--chart-1))) to computed color values */
function resolveCssVariablesInSvg(svg: SVGElement): void {
  const allElements = Array.from(svg.querySelectorAll('*'));
  allElements.push(svg as unknown as Element);

  allElements.forEach((el) => {
    try {
      const computed = getComputedStyle(el);

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

      // Inline CSS-only fills/strokes
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
    } catch { /* skip elements that can't be computed */ }
  });
}

/** Get SVG dimensions from the original element (before cloning) */
function getSvgDimensions(svg: SVGElement): { width: number; height: number } {
  // Try getBoundingClientRect first (works on elements in the DOM)
  const rect = svg.getBoundingClientRect();
  if (rect.width > 1 && rect.height > 1) {
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }

  // Try explicit attributes
  const attrW = Number.parseFloat(svg.getAttribute('width') || '');
  const attrH = Number.parseFloat(svg.getAttribute('height') || '');
  if (attrW > 1 && attrH > 1) {
    return { width: Math.round(attrW), height: Math.round(attrH) };
  }

  // Try style dimensions
  const styleW = Number.parseFloat(svg.style.width || '');
  const styleH = Number.parseFloat(svg.style.height || '');
  if (styleW > 1 && styleH > 1) {
    return { width: Math.round(styleW), height: Math.round(styleH) };
  }

  // Fall back to viewBox
  const vb = svg.getAttribute('viewBox')?.split(/[\s,]+/).map(Number) || [];
  const vbW = Number.isFinite(vb[2]) ? vb[2] : 400;
  const vbH = Number.isFinite(vb[3]) ? vb[3] : 240;

  if (attrW > 1) {
    return { width: Math.round(attrW), height: Math.round(attrW * vbH / vbW) };
  }

  return { width: Math.round(vbW), height: Math.round(vbH) };
}

/** Convert SVG element to a PNG data URL using canvas */
async function svgToDataUrl(svg: SVGElement, maxW: number, maxH: number): Promise<string> {
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = maxW * scale;
  canvas.height = maxH * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No canvas context');

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
    img.onerror = () => reject(new Error('SVG load failed'));
    img.src = svgUrl;
  });

  ctx.scale(scale, scale);
  ctx.drawImage(img, 0, 0, maxW, maxH);
  return canvas.toDataURL('image/png');
}

/**
 * Convert all SVGs to images.
 * IMPORTANT: We collect dimensions from ORIGINAL (in-DOM) SVGs,
 * then replace the CLONED SVGs with images using those dimensions.
 */
async function convertSvgsToImages(
  originalContainer: HTMLElement,
  clonedContainer: HTMLElement
): Promise<void> {
  const originalSvgs = Array.from(originalContainer.querySelectorAll('svg'));
  const clonedSvgs = Array.from(clonedContainer.querySelectorAll('svg'));

  for (let i = 0; i < clonedSvgs.length; i++) {
    const clonedSvg = clonedSvgs[i];
    // Use original SVG for dimensions if available, otherwise fall back to clone
    const sourceSvg = i < originalSvgs.length ? originalSvgs[i] : clonedSvg;

    try {
      const { width: w, height: h } = getSvgDimensions(sourceSvg);
      const maxW = Math.min(w, 660);
      const maxH = Math.round(maxW * h / Math.max(w, 1));

      // Resolve CSS variables on the original SVG (in DOM) before serialization
      if (i < originalSvgs.length) {
        resolveCssVariablesInSvg(originalSvgs[i]);
      }

      // Use the resolved original for rendering (it has computed colors)
      const svgToRender = i < originalSvgs.length ? originalSvgs[i] : clonedSvg;
      const dataUrl = await svgToDataUrl(svgToRender, maxW, maxH);

      const imgEl = document.createElement('img');
      imgEl.src = dataUrl;
      imgEl.setAttribute('width', String(maxW));
      imgEl.setAttribute('height', String(maxH));
      imgEl.style.cssText = `display:block;width:${maxW}px;height:${maxH}px;max-width:100%;object-fit:contain;page-break-inside:avoid;`;
      clonedSvg.parentNode?.replaceChild(imgEl, clonedSvg);
    } catch (e) {
      console.warn('SVG conversion error:', e);
    }
  }
}

/** Normalize image dimensions for Word compatibility */
function normalizeImages(container: HTMLElement): void {
  const images = Array.from(container.querySelectorAll('img'));
  images.forEach((img) => {
    const w = Number.parseFloat(img.getAttribute('width') || '') || Number.parseFloat(img.style.width || '') || 640;
    const h = Number.parseFloat(img.getAttribute('height') || '') || Number.parseFloat(img.style.height || '') || Math.round(w * 0.6);
    const finalW = Math.min(Math.round(w), 660);
    const finalH = Math.round(finalW * h / Math.max(w, 1));
    img.setAttribute('width', String(finalW));
    img.setAttribute('height', String(finalH));
    img.style.width = `${finalW}px`;
    img.style.height = `${finalH}px`;
    img.style.maxWidth = '100%';
    img.style.objectFit = 'contain';
    img.style.pageBreakInside = 'avoid';
    img.style.display = 'block';
  });
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
  img { display: block; max-width: 660px; height: auto; object-fit: contain; page-break-inside: avoid; }
  svg, canvas { max-width: 660px; height: auto; }
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
  // Step 1: Resolve CSS variables on ORIGINAL SVGs while they're still in the live DOM
  const originalSvgs = Array.from(element.querySelectorAll('svg'));
  originalSvgs.forEach((svg) => resolveCssVariablesInSvg(svg));

  // Step 2: Create clone with frozen dimensions
  const resolvedClone = createExportClone(element);

  // Step 3: Convert SVGs to images using original element for dimensions
  await convertSvgsToImages(element, resolvedClone);
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

    if (iframeDoc.fonts?.ready) {
      try { await iframeDoc.fonts.ready; } catch { /* ignore */ }
    }
    await new Promise((r) => setTimeout(r, 2500));

    iframeDoc.querySelector('.export-toolbar')?.remove();
    iframeDoc.querySelector('.print-instructions')?.remove();

    const target = (iframeDoc.querySelector('.export-captured-content') || iframeDoc.querySelector('main') || iframeDoc.body) as HTMLElement;

    // In iframe context, SVGs ARE in the DOM so getBoundingClientRect works
    const svgs = Array.from(target.querySelectorAll('svg'));
    svgs.forEach((svg) => resolveCssVariablesInSvg(svg));

    // Convert using same container for both source and clone (iframe SVGs are live)
    await convertSvgsToImages(target, target);
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
