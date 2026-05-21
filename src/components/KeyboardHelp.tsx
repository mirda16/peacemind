import { Keyboard, X } from 'lucide-react';
import { useState } from 'react';
import { useT } from '../i18n';

export default function KeyboardHelp() {
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="pm-toolbar-btn" onClick={() => setOpen(true)} title={t.toolbar.shortcuts}>
        <Keyboard size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div style={{
            background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
            borderRadius: 12, padding: 24, width: 440,
            maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{t.help.title}</h2>
              <button className="pm-toolbar-btn" onClick={() => setOpen(false)} style={{ padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {t.help.shortcuts.map((s) => (
                  <tr key={s.desc} style={{ borderBottom: '1px solid var(--pm-border)' }}>
                    <td style={{ padding: '8px 0', width: '40%' }}>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {s.keys.map((k) => (
                          <kbd key={k} style={{
                            padding: '2px 7px', borderRadius: 5,
                            background: 'var(--pm-bg)', border: '1px solid var(--pm-border)',
                            fontSize: 12, fontFamily: 'monospace',
                          }}>
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '8px 0 8px 12px', fontSize: 13, color: 'var(--pm-text-muted)' }}>
                      {s.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
