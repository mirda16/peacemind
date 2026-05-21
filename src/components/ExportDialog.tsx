import { useState } from 'react';
import { FileImage, FileType2, File, X } from 'lucide-react';
import { useExport } from '../hooks/useExport';
import { useT } from '../i18n';

interface Props {
  onClose: () => void;
}

export default function ExportDialog({ onClose }: Props) {
  const t = useT();
  const { exportPng, exportSvg, exportPdf } = useExport();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<boolean | undefined>) => {
    setLoading(label);
    setMessage(null);
    const ok = await fn();
    setLoading(null);
    const tpl = ok ? t.exportDialog.exportDone : t.exportDialog.exportFailed;
    setMessage(tpl.replace('{{fmt}}', label));
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
        borderRadius: 12, padding: 24, width: 340,
        boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>{t.exportDialog.title}</h2>
          <button className="pm-toolbar-btn" onClick={onClose} style={{ padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ExportOption
            icon={<FileImage size={20} />}
            title={t.exportDialog.pngTitle}
            desc={t.exportDialog.pngDesc}
            loading={loading === 'PNG'}
            onClick={() => run('PNG', exportPng)}
          />
          <ExportOption
            icon={<FileType2 size={20} />}
            title={t.exportDialog.svgTitle}
            desc={t.exportDialog.svgDesc}
            loading={loading === 'SVG'}
            onClick={() => run('SVG', exportSvg)}
          />
          <ExportOption
            icon={<File size={20} />}
            title={t.exportDialog.pdfTitle}
            desc={t.exportDialog.pdfDesc}
            loading={loading === 'PDF'}
            onClick={() => run('PDF', exportPdf)}
          />
        </div>

        {message && (
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: message.startsWith('✓') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            color: message.startsWith('✓') ? '#16a34a' : '#dc2626',
            fontSize: 13,
          }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

function ExportOption({ icon, title, desc, loading, onClick }: {
  icon: React.ReactNode; title: string; desc: string; loading: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '12px 16px', borderRadius: 8,
        border: '1px solid var(--pm-border)', background: 'var(--pm-bg)',
        cursor: loading ? 'wait' : 'pointer', textAlign: 'left',
        transition: 'border-color 0.1s ease', color: 'var(--pm-text)',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ color: 'var(--pm-accent)', flexShrink: 0 }}>
        {loading ? '⏳' : icon}
      </span>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--pm-text-muted)', marginTop: 2 }}>{desc}</div>
      </div>
    </button>
  );
}
