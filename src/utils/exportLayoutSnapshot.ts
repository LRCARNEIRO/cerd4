function roundPx(value: number) {
  return `${Math.max(1, Math.round(value))}px`;
}

function setElementBoxSize(source: Element, clone: Element) {
  const rect = source.getBoundingClientRect();
  if (!(clone instanceof HTMLElement || clone instanceof SVGElement)) return;
  if (rect.width <= 0 && rect.height <= 0) return;

  const style = clone.style;
  style.boxSizing = 'border-box';

  if (rect.width > 0) {
    style.width = roundPx(rect.width);
    style.maxWidth = roundPx(rect.width);
  }

  const shouldLockHeight =
    source instanceof SVGElement ||
    source instanceof HTMLCanvasElement ||
    source instanceof HTMLImageElement ||
    (source instanceof HTMLElement && (
      source.classList.contains('recharts-wrapper') ||
      source.classList.contains('recharts-responsive-container') ||
      source.classList.contains('chart-container') ||
      source.tagName === 'TABLE'
    ));

  if (shouldLockHeight && rect.height > 0) {
    style.height = roundPx(rect.height);
    style.minHeight = roundPx(rect.height);
  }

  if (clone instanceof SVGElement) {
    if (rect.width > 0) clone.setAttribute('width', String(Math.round(rect.width)));
    if (rect.height > 0) clone.setAttribute('height', String(Math.round(rect.height)));
    clone.setAttribute('preserveAspectRatio', clone.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
  }

  if (clone instanceof HTMLImageElement && rect.width > 0) {
    clone.width = Math.round(rect.width);
    if (rect.height > 0) clone.height = Math.round(rect.height);
    clone.decoding = 'sync';
    clone.loading = 'eager';
  }

  if (clone instanceof HTMLTableElement && rect.width > 0) {
    style.tableLayout = 'fixed';
  }
}

function pairAndFreeze(sourceRoot: HTMLElement, cloneRoot: HTMLElement, selector: string) {
  const sourceEls = Array.from(sourceRoot.querySelectorAll(selector));
  const cloneEls = Array.from(cloneRoot.querySelectorAll(selector));

  sourceEls.forEach((sourceEl, index) => {
    const cloneEl = cloneEls[index];
    if (!cloneEl) return;
    setElementBoxSize(sourceEl, cloneEl);
  });
}

function replaceClonedCanvases(sourceRoot: HTMLElement, cloneRoot: HTMLElement) {
  const sourceCanvases = Array.from(sourceRoot.querySelectorAll('canvas'));
  const cloneCanvases = Array.from(cloneRoot.querySelectorAll('canvas'));

  sourceCanvases.forEach((sourceCanvas, index) => {
    const cloneCanvas = cloneCanvases[index];
    if (!cloneCanvas) return;

    const rect = sourceCanvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || sourceCanvas.width || 640));
    const height = Math.max(1, Math.round(rect.height || sourceCanvas.height || 320));
    const image = document.createElement('img');

    try {
      image.src = sourceCanvas.toDataURL('image/png');
    } catch {
      return;
    }

    image.alt = sourceCanvas.getAttribute('aria-label') || 'Gráfico exportado';
    image.width = width;
    image.height = height;
    image.style.width = roundPx(width);
    image.style.maxWidth = roundPx(width);
    image.style.height = roundPx(height);
    image.style.objectFit = 'contain';
    image.style.display = 'block';
    cloneCanvas.replaceWith(image);
  });
}

export function createExportClone(sourceRoot: HTMLElement) {
  const cloneRoot = sourceRoot.cloneNode(true) as HTMLElement;

  cloneRoot.querySelectorAll('[data-export-ignore="true"]').forEach((node) => node.remove());
  cloneRoot.querySelectorAll('.export-toolbar, .print-instructions').forEach((node) => node.remove());

  setElementBoxSize(sourceRoot, cloneRoot);
  replaceClonedCanvases(sourceRoot, cloneRoot);

  const selectors = [
    'svg',
    'img',
    'table',
    '.recharts-wrapper',
    '.recharts-responsive-container',
    '.chart-container',
    '[class*="recharts-surface"]',
  ];

  selectors.forEach((selector) => pairAndFreeze(sourceRoot, cloneRoot, selector));
  return cloneRoot;
}