import { useEffect, useRef, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { PeaceMindFile } from '../types/mindmap';
import { useMindMapStore } from '../store/useMindMapStore';
import { getRecentFiles, removeRecentFile, RecentFile } from '../hooks/useRecentFiles';
import { pushRecentFile } from '../hooks/useRecentFiles';
import { useT } from '../i18n';

export default function RecentFilesMenu() {
  const t = useT();
  const store = useMindMapStore();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<RecentFile[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setFiles(getRecentFiles());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const openFile = async (file: RecentFile) => {
    setOpen(false);
    try {
      const raw = await invoke<string>('read_file', { path: file.path });
      const data: PeaceMindFile = JSON.parse(raw);
      store.loadMapInNewTab({
        nodes: data.nodes, edges: data.edges, title: data.title,
        theme: data.theme, viewport: data.viewport, filePath: file.path, styleId: data.styleId,
      });
      pushRecentFile({ path: file.path, title: data.title, savedAt: data.updatedAt });
    } catch {
      removeRecentFile(file.path);
      setFiles(getRecentFiles());
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className={`pm-toolbar-btn${open ? ' active' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title={t.toolbar.recent}
      >
        <Clock size={16} /> <span>{t.toolbar.recent}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
          borderRadius: 8, padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          zIndex: 1000, minWidth: 280,
        }}>
          {files.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--pm-text-muted)' }}>
              {t.toolbar.noRecent}
            </div>
          ) : files.map((f) => (
            <div
              key={f.path}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px' }}
            >
              <button
                className="pm-context-item"
                style={{ flex: 1, textAlign: 'left', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}
                onClick={() => openFile(f)}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.title}</span>
                <span style={{ fontSize: 10, color: 'var(--pm-text-muted)', wordBreak: 'break-all' }}>
                  {f.path} · {formatDate(f.savedAt)}
                </span>
              </button>
              <button
                className="pm-toolbar-btn"
                style={{ padding: '2px 4px', flexShrink: 0 }}
                onClick={() => { removeRecentFile(f.path); setFiles(getRecentFiles()); }}
                title={t.toolbar.removeRecent}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
