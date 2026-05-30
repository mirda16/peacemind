import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useMindMapStore } from '../store/useMindMapStore';
import { MAP_TEMPLATES } from '../types/templates';
import { useT } from '../i18n';

interface Props {
  onClose: () => void;
  onConfirmDirty: () => boolean;
}

export default function TemplateModal({ onClose, onConfirmDirty }: Props) {
  const t = useT();
  const language = useMindMapStore((s) => s.language);
  const loadMap = useMindMapStore((s) => s.loadMap);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const apply = (templateId: string) => {
    if (!onConfirmDirty()) return;
    const tpl = MAP_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    const { nodes, edges, title } = tpl.generate(language);
    loadMap(nodes as never, edges as never, title);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.4)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div style={{
        background: 'var(--pm-surface)', borderRadius: 12,
        padding: 24, width: 560, maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
        border: '1px solid var(--pm-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{t.toolbar.templates}</h2>
          <button className="pm-toolbar-btn" onClick={onClose} style={{ padding: '4px 8px' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {MAP_TEMPLATES.map((tpl) => {
            const name = language === 'cs' ? tpl.nameCs : tpl.nameEn;
            const desc = language === 'cs' ? tpl.descCs : tpl.descEn;
            return (
              <button
                key={tpl.id}
                onClick={() => apply(tpl.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                  gap: 6, padding: '14px 16px', borderRadius: 10, textAlign: 'left',
                  border: '1px solid var(--pm-border)', background: 'var(--pm-bg)',
                  cursor: 'pointer', color: 'var(--pm-text)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--pm-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pm-border)')}
              >
                <span style={{ fontSize: 28 }}>{tpl.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{name}</span>
                <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', lineHeight: 1.4 }}>{desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
