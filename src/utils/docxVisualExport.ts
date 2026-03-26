import { toCanvas } from 'html-to-image';
import {
  Document as DocxDocument,
  Footer,
  ImageRun,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  TextRun,
  AlignmentType,
} from 'docx';

const A4_PAGE = {
  width: 11906,
  height: 16838,
  margin: 720,
};

const CONTENT_WIDTH_TWIPS = A4_PAGE.width - A4_PAGE.margin * 2;
const CONTENT_HEIGHT_TWIPS = A4_PAGE.height - A4_PAGE.margin * 2;
const CONTENT_WIDTH_PX = Math.floor(CONTENT_WIDTH_TWIPS / 15);
const CONTENT_HEIGHT_PX = Math.floor(CONTENT_HEIGHT_TWIPS / 15);

interface CanvasSlice {
  blob: Blob;
  width: number;
  height: number;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getBackgroundColor(doc: Document) {
  const bodyStyle = doc.defaultView?.getComputedStyle(doc.body);
  const bg = bodyStyle?.backgroundColor;
  return bg && bg !== 'rgba(0, 0, 0, 0)' ? bg : '#ffffff';
}

async function waitForAssets(doc: Document) {
  if ('fonts' in doc && doc.fonts?.ready) {
    try {
      await doc.fonts.ready;
    } catch {
      // ignore font readiness failures
    }
  }

  const images = Array.from(doc.images);
  await Promise.all(
    images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise<void>((resolve) => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      });
    }),
  );
}

async function blobFromCanvas(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Falha ao converter visualização em imagem PNG.');
  return blob;
}

async function captureNodeAsCanvas(node: HTMLElement) {
  const width = Math.max(node.scrollWidth, node.clientWidth, node.getBoundingClientRect().width || 0);
  const height = Math.max(node.scrollHeight, node.clientHeight, node.getBoundingClientRect().height || 0);
  const backgroundColor = getBackgroundColor(node.ownerDocument);

  return toCanvas(node, {
    cacheBust: true,
    backgroundColor,
    pixelRatio: 2,
    width: Math.ceil(width),
    height: Math.ceil(height),
    filter: (domNode) => !(domNode instanceof Element && domNode.getAttribute('data-export-ignore') === 'true'),
  });
}

async function splitCanvasIntoPages(canvas: HTMLCanvasElement): Promise<CanvasSlice[]> {
  const sliceHeight = Math.max(1, Math.floor((CONTENT_HEIGHT_PX * canvas.width) / CONTENT_WIDTH_PX));
  const pages: CanvasSlice[] = [];

  for (let offset = 0; offset < canvas.height; offset += sliceHeight) {
    const currentHeight = Math.min(sliceHeight, canvas.height - offset);
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = currentHeight;

    const ctx = pageCanvas.getContext('2d');
    if (!ctx) throw new Error('Falha ao preparar página do DOCX.');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    ctx.drawImage(canvas, 0, offset, canvas.width, currentHeight, 0, 0, canvas.width, currentHeight);

    pages.push({
      blob: await blobFromCanvas(pageCanvas),
      width: pageCanvas.width,
      height: pageCanvas.height,
    });
  }

  return pages;
}

async function buildDocxFromSlices(slices: CanvasSlice[], fileName: string) {
  const children: Paragraph[] = [];

  for (const [index, slice] of slices.entries()) {
    const data = new Uint8Array(await slice.blob.arrayBuffer());
    const width = CONTENT_WIDTH_PX;
    const height = Math.max(1, Math.round((slice.height / slice.width) * CONTENT_WIDTH_PX));

    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: 'png',
            data,
            transformation: { width, height },
            altText: {
              title: fileName,
              description: `Página ${index + 1}`,
              name: `${fileName}-${index + 1}`,
            },
          }),
        ],
      }),
    );

    if (index < slices.length - 1) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  }

  const doc = new DocxDocument({
    sections: [
      {
        properties: {
          page: {
            size: { width: A4_PAGE.width, height: A4_PAGE.height },
            margin: {
              top: A4_PAGE.margin,
              right: A4_PAGE.margin,
              bottom: A4_PAGE.margin,
              left: A4_PAGE.margin,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ children: [PageNumber.CURRENT], font: 'Calibri', size: 18, color: '888888' }),
                  new TextRun({ text: ' / ', font: 'Calibri', size: 18, color: '888888' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Calibri', size: 18, color: '888888' }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(fileName)}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadElementAsDocx(element: HTMLElement, fileName: string) {
  await waitForAssets(element.ownerDocument);
  const canvas = await captureNodeAsCanvas(element);
  const slices = await splitCanvasIntoPages(canvas);
  await buildDocxFromSlices(slices, fileName);
}

export async function downloadHtmlVisualAsDocx(html: string, fileName: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-20000px';
  iframe.style.top = '0';
  iframe.style.width = '1440px';
  iframe.style.height = '9000px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error('Falha ao preparar o conteúdo do DOCX.');

    await waitForAssets(iframeDoc);
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    iframeDoc.querySelector('.export-toolbar')?.remove();
    iframeDoc.querySelector('.print-instructions')?.remove();

    const target = (iframeDoc.querySelector('.export-captured-content') || iframeDoc.querySelector('main') || iframeDoc.body) as HTMLElement;
    const canvas = await captureNodeAsCanvas(target);
    const slices = await splitCanvasIntoPages(canvas);
    await buildDocxFromSlices(slices, fileName);
  } finally {
    iframe.remove();
  }
}