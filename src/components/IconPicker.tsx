import { useState } from 'react';

const ICON_GROUPS: { label: string; icons: string[] }[] = [
  { label: 'Priority', icons: ['🔴', '🟠', '🟡', '🟢', '🔵', '⭐', '🔥', '⚡', '✅', '❌'] },
  { label: 'Ideas',    icons: ['💡', '🧠', '🎯', '💭', '🔍', '📝', '💬', '🏷️', '📌', '🗂️'] },
  { label: 'Tech',     icons: ['💻', '📱', '⚙️', '🔧', '🌐', '📊', '📈', '📉', '🔒', '🗄️'] },
  { label: 'Nature',   icons: ['🌿', '🌱', '🌸', '🍀', '🌊', '☀️', '🌙', '⛰️', '🌍', '🌈'] },
  { label: 'Objects',  icons: ['📁', '📂', '🏆', '🎨', '🎵', '📚', '🛠️', '🎮', '✈️', '🏠'] },
  { label: 'Smileys',  icons: ['😀', '😊', '🤔', '😎', '🥳', '🤩', '😢', '😡', '🤯', '🥰'] },
];

interface Props {
  value?: string;
  onChange: (icon: string | undefined) => void;
}

export default function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <div className="pm-panel-row" style={{ gap: 8 }}>
        <button
          className="pm-toolbar-btn"
          style={{ fontSize: 20, padding: '4px 10px', minWidth: 44 }}
          onClick={() => setOpen((o) => !o)}
          title="Vybrat ikonu"
        >
          {value ?? '➕'}
        </button>
        {value && (
          <button
            className="pm-toolbar-btn"
            style={{ fontSize: 12, color: 'var(--pm-danger)' }}
            onClick={() => onChange(undefined)}
            title="Odebrat ikonu"
          >
            ✕ Odebrat
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 200,
          background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
          borderRadius: 10, padding: 12, width: 240,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }}>
          {ICON_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--pm-text-muted)', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                {group.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {group.icons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => { onChange(icon); setOpen(false); }}
                    style={{
                      background: icon === value ? 'color-mix(in srgb, var(--pm-accent) 20%, transparent)' : 'var(--pm-bg)',
                      border: icon === value ? '1px solid var(--pm-accent)' : '1px solid transparent',
                      borderRadius: 6, padding: '4px 6px', cursor: 'pointer', fontSize: 18, lineHeight: 1,
                    }}
                    title={icon}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
