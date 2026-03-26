export function prepareHtmlPreview(title?: string) {
  const previewWindow = window.open('', '_blank', 'noopener,noreferrer');

  if (previewWindow && title) {
    previewWindow.document.title = title;
  }

  return previewWindow;
}

export function openHtmlPreview(html: string, title: string, previewWindow: Window | null = prepareHtmlPreview(title)) {

  if (!previewWindow) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.download = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(html);
  previewWindow.document.close();
}