import { useCallback, useState } from 'react';
import { Bold, Italic, Minus, Plus, RefreshCw, Image, List, Trash2 } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { useMindMapStore } from '../store/useMindMapStore';
import { MindMapNodeData, NodeShape } from '../types/mindmap';
import { MAP_STYLE_PRESETS } from '../types/styles';
import { COLOR_PALETTES } from '../types/palettes';
import { useT } from '../i18n';
import IconPicker from './IconPicker';

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b', '#1e293b', '#f8fafc',
];

function ColorSwatch({ color, value, onChange }: { color: string; value: string; onChange: (c: string) => void }) {
  return (
    <button
      onClick={() => onChange(color)}
      style={{
        width: 22, height: 22, borderRadius: 4, background: color,
        border: color === value ? '2px solid var(--pm-accent)' : '1px solid var(--pm-border)',
        cursor: 'pointer', flexShrink: 0,
      }}
      title={color}
    />
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="pm-panel-label">{children}</div>;
}

function StylePresetsSection() {
  const t = useT();
  const currentStyleId = useMindMapStore((s) => s.currentStyleId);
  const applyStylePreset = useMindMapStore((s) => s.applyStylePreset);
  const [applyColors, setApplyColors] = useState(true);

  return (
    <div className="pm-panel-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>{t.panel.mapStyle}</SectionLabel>
        <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', color: 'var(--pm-text-muted)' }}>
          <input type="checkbox" checked={applyColors} onChange={(e) => setApplyColors(e.target.checked)} />
          {t.panel.applyColors}
        </label>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {MAP_STYLE_PRESETS.map((preset) => {
          const pt = t.presets[preset.id] ?? { name: preset.name ?? preset.id, description: '' };
          return (
            <button
              key={preset.id}
              onClick={() => applyStylePreset(preset.id, applyColors)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                border: currentStyleId === preset.id
                  ? '2px solid var(--pm-accent)'
                  : '1px solid var(--pm-border)',
                background: currentStyleId === preset.id
                  ? 'color-mix(in srgb, var(--pm-accent) 10%, var(--pm-bg))'
                  : 'var(--pm-bg)',
                cursor: 'pointer', textAlign: 'left',
                color: 'var(--pm-text)', transition: 'all 0.15s ease',
              }}
            >
              <span style={{ fontSize: 18 }}>{preset.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{pt.name}</span>
                  {preset.id === 'klasicky' && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'var(--pm-accent)', color: '#fff', opacity: 0.8 }}>
                      {t.panel.defaultBadge}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--pm-text-muted)' }}>{pt.description}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorPaletteSection() {
  const t = useT();
  const applyColorPalette = useMindMapStore((s) => s.applyColorPalette);

  return (
    <div className="pm-panel-section">
      <SectionLabel>{t.panel.colorPalette}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {COLOR_PALETTES.map((palette) => {
          const name = t.palettes[palette.id]?.name ?? palette.name;
          return (
            <button
              key={palette.id}
              onClick={() => applyColorPalette(palette.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                border: '1px solid var(--pm-border)', background: 'var(--pm-bg)',
                cursor: 'pointer', textAlign: 'left', color: 'var(--pm-text)',
              }}
              title={name}
            >
              <div style={{ display: 'flex', flexShrink: 0 }}>
                {palette.colors.map((c, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: c, marginLeft: i === 0 ? 0 : -4,
                    border: '1px solid var(--pm-surface)',
                  }} />
                ))}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GlobalEdgeSection() {
  const t = useT();
  const defaultEdgeData = useMindMapStore((s) => s.defaultEdgeData);
  const applyEdgeStyleToAll = useMindMapStore((s) => s.applyEdgeStyleToAll);
  const setDefaultEdgeData = useMindMapStore((s) => s.setDefaultEdgeData);

  const applyAll = useCallback((data: Parameters<typeof applyEdgeStyleToAll>[0]) => {
    applyEdgeStyleToAll(data);
    setDefaultEdgeData(data);
  }, [applyEdgeStyleToAll, setDefaultEdgeData]);

  return (
    <div className="pm-panel-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <SectionLabel>{t.panel.edgesAll}</SectionLabel>
        <button
          className="pm-toolbar-btn"
          style={{ padding: '2px 8px', fontSize: 11 }}
          onClick={() => applyAll({ color: defaultEdgeData.color, width: defaultEdgeData.width, animated: defaultEdgeData.animated, variableWidth: defaultEdgeData.variableWidth, tapered: defaultEdgeData.tapered })}
          title={t.panel.applyAllTooltip}
        >
          <RefreshCw size={12} /> {t.panel.applyAll}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {PRESET_COLORS.map((c) => (
          <ColorSwatch key={c} color={c} value={defaultEdgeData.color}
            onChange={(col) => applyAll({ color: col })} />
        ))}
        <div className="pm-color-btn" title={t.panel.customColor}>
          <div style={{ width: 22, height: 22, background: defaultEdgeData.color, borderRadius: 4 }} />
          <input type="color" value={defaultEdgeData.color}
            onChange={(e) => applyAll({ color: e.target.value })} />
        </div>
      </div>

      <div className="pm-panel-row">
        <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 72 }}>{t.panel.thickness}</span>
        <input className="pm-range" type="range" min={0.5} max={10} step={0.5}
          value={defaultEdgeData.width}
          onChange={(e) => applyAll({ width: Number(e.target.value) })} />
        <span style={{ fontSize: 12, width: 24, textAlign: 'right' }}>{defaultEdgeData.width}</span>
      </div>

      <div className="pm-panel-row" style={{ gap: 12 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={defaultEdgeData.animated}
            onChange={(e) => applyAll({ animated: e.target.checked })} />
          {t.panel.animated}
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={defaultEdgeData.variableWidth}
            onChange={(e) => applyAll({ variableWidth: e.target.checked })} />
          {t.panel.variableWidth}
        </label>
      </div>

      <div className="pm-panel-row">
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <input type="checkbox" checked={defaultEdgeData.tapered}
            onChange={(e) => applyAll({ tapered: e.target.checked, edgeType: 'bezier' })} />
          {t.panel.tapered}
        </label>
      </div>

      <div className="pm-panel-row">
        <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 72 }}>{t.panel.lineType}</span>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {(['bezier', 'smoothstep', 'step', 'straight', 'bus'] as const).map((type) => (
            <button
              key={type}
              className={`pm-shape-btn${defaultEdgeData.edgeType === type ? ' active' : ''}`}
              onClick={() => applyAll({ edgeType: type })}
              style={{ fontSize: 10 }}
              title={type === 'bus' ? 'Bus / Tree' : undefined}
            >
              {type === 'bezier' ? '〜' : type === 'smoothstep' ? '⌒' : type === 'step' ? '⌐' : type === 'straight' ? '—' : '├'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NodeStyleSection() {
  const t = useT();
  const nodes = useMindMapStore((s) => s.nodes);
  const selectedNodeIds = useMindMapStore((s) => s.selectedNodeIds);
  const updateNodeData = useMindMapStore((s) => s.updateNodeData);
  const defaultEdgeData = useMindMapStore((s) => s.defaultEdgeData);
  const applyEdgeStyleToNodes = useMindMapStore((s) => s.applyEdgeStyleToNodes);

  const primaryId = selectedNodeIds[0];
  const primaryNode = nodes.find((n) => n.id === primaryId);
  const nodeData = primaryNode?.data as MindMapNodeData | undefined;

  const SHAPES: { id: NodeShape; label: string }[] = [
    { id: 'rounded',   label: t.shapes.rounded },
    { id: 'rectangle', label: t.shapes.rectangle },
    { id: 'ellipse',   label: t.shapes.ellipse },
    { id: 'circle',    label: t.shapes.circle },
    { id: 'pill',      label: t.shapes.pill },
  ];

  const update = useCallback(
    (field: Partial<MindMapNodeData>) => {
      selectedNodeIds.forEach((id) => updateNodeData(id, field));
    },
    [selectedNodeIds, updateNodeData]
  );

  const uploadImage = useCallback(async () => {
    const path = await open({
      filters: [{ name: t.panel.imageFilter, extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'] }],
    });
    if (!path || Array.isArray(path)) return;
    try {
      const dataUrl = await invoke<string>('read_image_as_data_url', { path });
      update({ imageData: dataUrl });
    } catch (e) {
      console.error(e);
    }
  }, [update, t]);

  const addChecklist = useCallback(() => {
    const current = nodeData?.checklist ?? [];
    update({ checklist: [...current, { id: crypto.randomUUID(), text: t.node.newItem, checked: false }] });
  }, [nodeData, update, t]);

  if (!nodeData) return null;

  return (
    <>
      <div className="pm-panel-section">
        <SectionLabel>{t.panel.shape}</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {SHAPES.map((s) => (
            <button key={s.id}
              className={`pm-shape-btn${nodeData.shape === s.id ? ' active' : ''}`}
              onClick={() => update({ shape: s.id })}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.fillColor}</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PRESET_COLORS.map((c) => (
            <ColorSwatch key={c} color={c} value={nodeData.backgroundColor}
              onChange={(col) => update({ backgroundColor: col })} />
          ))}
          <div className="pm-color-btn">
            <div style={{ width: 22, height: 22, background: nodeData.backgroundColor, borderRadius: 4 }} />
            <input type="color" value={nodeData.backgroundColor}
              onChange={(e) => update({ backgroundColor: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.textAndBorder}</SectionLabel>
        <div className="pm-panel-row">
          <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 50 }}>{t.panel.text}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {['#1e293b', '#f8fafc', '#6366f1', '#ef4444', '#22c55e', '#f97316'].map((c) => (
              <ColorSwatch key={c} color={c} value={nodeData.textColor}
                onChange={(col) => update({ textColor: col })} />
            ))}
            <div className="pm-color-btn">
              <div style={{ width: 22, height: 22, background: nodeData.textColor, borderRadius: 4 }} />
              <input type="color" value={nodeData.textColor}
                onChange={(e) => update({ textColor: e.target.value })} />
            </div>
          </div>
        </div>
        <div className="pm-panel-row">
          <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 50 }}>{t.panel.border}</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {PRESET_COLORS.slice(0, 6).map((c) => (
              <ColorSwatch key={c} color={c} value={nodeData.borderColor}
                onChange={(col) => update({ borderColor: col })} />
            ))}
            <div className="pm-color-btn">
              <div style={{ width: 22, height: 22, background: nodeData.borderColor, borderRadius: 4 }} />
              <input type="color" value={nodeData.borderColor}
                onChange={(e) => update({ borderColor: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.typography}</SectionLabel>
        <div className="pm-panel-row">
          <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 72 }}>{t.panel.size}</span>
          <button className="pm-toolbar-btn" style={{ padding: '3px 8px' }}
            onClick={() => update({ fontSize: Math.max(8, nodeData.fontSize - 1) })}>
            <Minus size={12} />
          </button>
          <span style={{ fontSize: 13, width: 28, textAlign: 'center' }}>{nodeData.fontSize}</span>
          <button className="pm-toolbar-btn" style={{ padding: '3px 8px' }}
            onClick={() => update({ fontSize: Math.min(48, nodeData.fontSize + 1) })}>
            <Plus size={12} />
          </button>
        </div>
        <div className="pm-panel-row">
          <button
            className={`pm-toolbar-btn${nodeData.fontWeight === 'bold' ? ' active' : ''}`}
            onClick={() => update({ fontWeight: nodeData.fontWeight === 'bold' ? 'normal' : 'bold' })}
            title={t.panel.boldTooltip}>
            <Bold size={15} />
          </button>
          <button
            className={`pm-toolbar-btn${nodeData.fontStyle === 'italic' ? ' active' : ''}`}
            onClick={() => update({ fontStyle: nodeData.fontStyle === 'italic' ? 'normal' : 'italic' })}
            title={t.panel.italicTooltip}>
            <Italic size={15} />
          </button>
        </div>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.borderThickness}</SectionLabel>
        <div className="pm-panel-row">
          <input className="pm-range" type="range" min={0} max={8} value={nodeData.borderWidth}
            onChange={(e) => update({ borderWidth: Number(e.target.value) })} />
          <span style={{ fontSize: 12, width: 20 }}>{nodeData.borderWidth}</span>
        </div>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.nodeIcon}</SectionLabel>
        <IconPicker value={nodeData.icon as string | undefined} onChange={(icon) => update({ icon })} />
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.nodeImage}</SectionLabel>
        {nodeData.imageData ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <img src={nodeData.imageData as string} style={{ maxWidth: '100%', maxHeight: 80, borderRadius: 6, objectFit: 'cover' }} alt="" />
            <div className="pm-panel-row">
              <button className="pm-toolbar-btn" style={{ flex: 1 }} onClick={uploadImage}>
                <Image size={14} /> {t.panel.changeImage}
              </button>
              <button className="pm-toolbar-btn" style={{ color: 'var(--pm-danger)' }} onClick={() => update({ imageData: undefined })}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ) : (
          <button className="pm-toolbar-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={uploadImage}>
            <Image size={14} /> {t.panel.insertImage}
          </button>
        )}
      </div>

      <div className="pm-panel-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <SectionLabel>{t.panel.checklist}</SectionLabel>
          {(nodeData.checklist?.length ?? 0) > 0 && (
            <button className="pm-toolbar-btn" style={{ fontSize: 11, color: 'var(--pm-danger)', padding: '2px 6px' }}
              onClick={() => update({ checklist: [] })}>
              <Trash2 size={11} /> {t.panel.clearChecklist}
            </button>
          )}
        </div>
        <button className="pm-toolbar-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={addChecklist}>
          <List size={14} /> {t.panel.addChecklistItem}
        </button>
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.node.noteLabel}</SectionLabel>
        <textarea
          className="pm-input"
          rows={3}
          value={(nodeData.notes as string) || ''}
          onChange={(e) => update({ notes: e.target.value })}
          placeholder={t.node.notePlaceholder}
          style={{ resize: 'vertical', fontSize: 12 }}
        />
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.node.urlLabel}</SectionLabel>
        <input
          className="pm-input"
          type="url"
          value={(nodeData.url as string) || ''}
          onChange={(e) => update({ url: e.target.value || undefined })}
          placeholder={t.node.urlPlaceholder}
          style={{ fontSize: 12 }}
        />
      </div>

      <div className="pm-panel-section">
        <SectionLabel>{t.panel.nodeEdges}</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PRESET_COLORS.map((c) => (
            <ColorSwatch key={c} color={c} value={defaultEdgeData.color}
              onChange={(col) => { applyEdgeStyleToNodes({ color: col }, selectedNodeIds); }} />
          ))}
        </div>
        <div className="pm-panel-row">
          <span style={{ fontSize: 12, color: 'var(--pm-text-muted)', width: 72 }}>{t.panel.thickness}</span>
          <input className="pm-range" type="range" min={0.5} max={10} step={0.5}
            value={defaultEdgeData.width}
            onChange={(e) => { applyEdgeStyleToNodes({ width: Number(e.target.value) }, selectedNodeIds); }} />
          <span style={{ fontSize: 12, width: 24, textAlign: 'right' }}>{defaultEdgeData.width}</span>
        </div>
      </div>
    </>
  );
}

export default function StylePanel() {
  const selectedNodeIds = useMindMapStore((s) => s.selectedNodeIds);

  return (
    <div className="pm-panel">
      <StylePresetsSection />
      <div style={{ height: 1, background: 'var(--pm-border)', margin: '4px 0' }} />
      <ColorPaletteSection />
      <div style={{ height: 1, background: 'var(--pm-border)', margin: '4px 0' }} />
      {selectedNodeIds.length > 0 ? <NodeStyleSection /> : <GlobalEdgeSection />}
    </div>
  );
}
