import { toPng, toSvg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { save } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';

export function useExport() {
  const exportPng = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { cacheBust: true, backgroundColor: 'transparent' });
      const path = await save({
        defaultPath: 'mapa.png',
        filters: [{ name: 'PNG obrázek', extensions: ['png'] }],
      });
      if (!path) return;
      // Convert data URL to base64 and write via Tauri
      const base64 = dataUrl.split(',')[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      await writeBytes(path, bytes);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const exportSvg = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;
    try {
      const svgStr = await toSvg(el, { cacheBust: true });
      const path = await save({
        defaultPath: 'mapa.svg',
        filters: [{ name: 'SVG vektorový obrázek', extensions: ['svg'] }],
      });
      if (!path) return;
      // SVG is text, remove data URL prefix
      const svgContent = decodeURIComponent(svgStr.replace('data:image/svg+xml;charset=utf-8,', ''));
      await invoke<void>('write_file', { path, content: svgContent });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const exportPdf = async () => {
    const el = document.querySelector('.react-flow') as HTMLElement | null;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { cacheBust: true, pixelRatio: 2 });
      const path = await save({
        defaultPath: 'mapa.pdf',
        filters: [{ name: 'PDF dokument', extensions: ['pdf'] }],
      });
      if (!path) return;
      const img = new Image();
      img.src = dataUrl;
      await new Promise((r) => (img.onload = r));
      const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height],
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
      const pdfBytes = pdf.output('arraybuffer');
      await writeBytes(path, new Uint8Array(pdfBytes));
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return { exportPng, exportSvg, exportPdf };
}

async function writeBytes(path: string, data: Uint8Array) {
  // Write via base64 encoded string in Tauri
  let binary = '';
  for (let i = 0; i < data.byteLength; i++) binary += String.fromCharCode(data[i]);
  const b64 = btoa(binary);
  await invoke('write_file_bytes', { path, data: b64 }).catch(async () => {
    // Fallback: write via plugin-fs writeFile
    const { writeFile } = await import('@tauri-apps/plugin-fs');
    await writeFile(path, data);
  });
}
