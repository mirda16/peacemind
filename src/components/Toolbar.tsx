import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  FilePlus, FolderOpen, Save, Download, Undo2, Redo2,
  Sun, Moon, ZoomIn, ZoomOut, Maximize2, BoxSelect, Type, Square, Circle, StickyNote,
  LayoutDashboard, LayoutTemplate,
} from 'lucide-react';
import { useMindMapStore } from '../store/useMindMapStore';
import { useFileOps } from '../hooks/useFileOps';
import { useT } from '../i18n';
import { TRANSLATIONS } from '../i18n/translations';
import { LayoutDirection } from '../utils/autoLayout';
import KeyboardHelp from './KeyboardHelp';
import RecentFilesMenu from './RecentFilesMenu';

interface Props {
  onShowExport: () => void;
  onShowTemplates: () => void;
}

export default function Toolbar({ onShowExport, onShowTemplates }: Props) {
  const t = useT();
  const mapTitle = useMindMapStore((s) => s.mapTitle);
  const isDirty = useMindMapStore((s) => s.isDirty);
  const theme = useMindMapStore((s) => s.theme);
  const language = useMindMapStore((s) => s.language);
  const setMapTitle = useMindMapStore((s) => s.setMapTitle);
  const toggleTheme = useMindMapStore((s) => s.toggleTheme);
  const setLanguage = useMindMapStore((s) => s.setLanguage);
  const undo = useMindMapStore((s) => s.undo);
  const redo = useMindMapStore((s) => s.redo);
  const canUndo = useMindMapStore((s) => s.canUndo());
  const canRedo = useMindMapStore((s) => s.canRedo());
  const openNewTab = useMindMapStore((s) => s.openNewTab);

  const addGroup       = useMindMapStore((s) => s.addGroup);
  const addFreeText    = useMindMapStore((s) => s.addFreeText);
  const addFreeShape   = useMindMapStore((s) => s.addFreeShape);
  const showNotes      = useMindMapStore((s) => s.showNotes);
  const toggleShowNotes = useMindMapStore((s) => s.toggleShowNotes);
  const autoLayout     = useMindMapStore((s) => s.autoLayout);

  const [layoutOpen, setLayoutOpen] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layoutOpen) return;
    const handler = (e: MouseEvent) => {
      if (layoutRef.current && !layoutRef.current.contains(e.target as Node)) setLayoutOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [layoutOpen]);

  const applyLayout = (dir: LayoutDirection) => {
    autoLayout(dir);
    setLayoutOpen(false);
    setTimeout(() => fitView({ duration: 400, padding: 0.3 }), 50);
  };

  const { saveMap, openMap } = useFileOps();
  const { fitView, zoomIn, zoomOut, screenToFlowPosition } = useReactFlow();

  const insertCenter = () => screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    setTitleDraft(mapTitle);
    setEditingTitle(true);
    setTimeout(() => titleRef.current?.select(), 10);
  };

  const commitTitle = () => {
    const title = titleDraft.trim();
    if (title) setMapTitle(title);
    setEditingTitle(false);
  };

  const handleOpen = async () => {
    await openMap();
  };

  return (
    <div className="pm-toolbar">
      {/* Logo */}
      <div style={{ marginRight: 8, fontWeight: 700, fontSize: 16, color: 'var(--pm-accent)', flexShrink: 0 }}>
        ☯ PeaceMind
      </div>

      <div className="pm-toolbar-sep" />

      {/* File ops */}
      <button className="pm-toolbar-btn" onClick={() => openNewTab()} title={t.toolbar.newTooltip}>
        <FilePlus size={16} /> <span>{t.toolbar.new}</span>
      </button>
      <button className="pm-toolbar-btn" onClick={onShowTemplates} title={t.toolbar.templates}>
        <LayoutTemplate size={16} /> <span>{t.toolbar.templates}</span>
      </button>
      <button className="pm-toolbar-btn" onClick={handleOpen} title={t.toolbar.openTooltip}>
        <FolderOpen size={16} /> <span>{t.toolbar.open}</span>
      </button>
      <RecentFilesMenu />
      <button className="pm-toolbar-btn" onClick={() => saveMap()} title={t.toolbar.saveTooltip}>
        <Save size={16} /> <span>{t.toolbar.save}</span>
      </button>

      <div className="pm-toolbar-sep" />

      {/* Undo/Redo */}
      <button className="pm-toolbar-btn" onClick={undo} disabled={!canUndo} title="Ctrl+Z">
        <Undo2 size={16} />
      </button>
      <button className="pm-toolbar-btn" onClick={redo} disabled={!canRedo} title="Ctrl+Y">
        <Redo2 size={16} />
      </button>

      <div className="pm-toolbar-sep" />

      {/* Zoom */}
      <button className="pm-toolbar-btn" onClick={() => zoomIn({ duration: 200 })} title={t.toolbar.zoomIn}>
        <ZoomIn size={16} />
      </button>
      <button className="pm-toolbar-btn" onClick={() => zoomOut({ duration: 200 })} title={t.toolbar.zoomOut}>
        <ZoomOut size={16} />
      </button>
      <button className="pm-toolbar-btn" onClick={() => fitView({ duration: 300, padding: 0.3 })} title={t.toolbar.fitView}>
        <Maximize2 size={16} />
      </button>

      <div className="pm-toolbar-sep" />

      {/* Insert objects */}
      <button className="pm-toolbar-btn" onClick={() => addGroup(insertCenter())} title={t.toolbar.insertGroup}>
        <BoxSelect size={16} /> <span>{t.toolbar.insertGroup}</span>
      </button>
      <button className="pm-toolbar-btn" onClick={() => addFreeText(insertCenter())} title={t.toolbar.insertText}>
        <Type size={16} /> <span>{t.toolbar.insertText}</span>
      </button>
      <button className="pm-toolbar-btn" onClick={() => addFreeShape('rectangle', insertCenter())} title={t.toolbar.insertRect}>
        <Square size={16} />
      </button>
      <button className="pm-toolbar-btn" onClick={() => addFreeShape('rounded-rectangle', insertCenter())} title={t.toolbar.insertRoundedRect}>
        <Square size={16} style={{ borderRadius: 4 }} />
      </button>
      <button className="pm-toolbar-btn" onClick={() => addFreeShape('ellipse', insertCenter())} title={t.toolbar.insertEllipse}>
        <Circle size={16} />
      </button>

      <div className="pm-toolbar-sep" />

      {/* Notes global toggle */}
      <button
        className={`pm-toolbar-btn${showNotes ? ' active' : ''}`}
        onClick={toggleShowNotes}
        title={t.toolbar.toggleNotes}
      >
        <StickyNote size={16} />
      </button>

      <div className="pm-toolbar-sep" />

      {/* Auto layout */}
      <div ref={layoutRef} style={{ position: 'relative' }}>
        <button
          className={`pm-toolbar-btn${layoutOpen ? ' active' : ''}`}
          onClick={() => setLayoutOpen((o) => !o)}
          title={t.toolbar.layout}
        >
          <LayoutDashboard size={16} /> <span>{t.toolbar.layout}</span>
        </button>
        {layoutOpen && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, marginTop: 4,
            background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
            borderRadius: 8, padding: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            zIndex: 1000, minWidth: 170,
          }}>
            {([
              ['LR',     '→ ' + t.toolbar.layoutLR],
              ['RL',     '← ' + t.toolbar.layoutRL],
              ['TB',     '↓ ' + t.toolbar.layoutTB],
              ['BT',     '↑ ' + t.toolbar.layoutBT],
              ['radial', '⊕ ' + t.toolbar.layoutRadial],
            ] as [LayoutDirection, string][]).map(([dir, label]) => (
              <button
                key={dir}
                className="pm-context-item"
                style={{ width: '100%', textAlign: 'left', fontSize: 13 }}
                onClick={() => applyLayout(dir)}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="pm-toolbar-sep" />

      {/* Export */}
      <button className="pm-toolbar-btn" onClick={onShowExport} title={t.toolbar.export}>
        <Download size={16} /> <span>{t.toolbar.export}</span>
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {editingTitle ? (
          <input
            ref={titleRef}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitTitle();
              if (e.key === 'Escape') setEditingTitle(false);
            }}
            className="pm-input"
            style={{ width: 200, textAlign: 'center' }}
          />
        ) : (
          <button
            className="pm-toolbar-btn"
            onClick={handleTitleClick}
            style={{ fontWeight: 600, gap: 4 }}
            title={t.toolbar.renameHint}
          >
            {mapTitle}{isDirty && ' •'}
          </button>
        )}
      </div>

      <KeyboardHelp />

      {/* Language selector — auto-populated from TRANSLATIONS keys */}
      <select
        className="pm-toolbar-btn"
        value={language}
        onChange={(e) => setLanguage(e.target.value as typeof language)}
        style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', paddingInline: 6 }}
      >
        {(Object.keys(TRANSLATIONS) as (typeof language)[]).map((lang) => (
          <option key={lang} value={lang}>{lang.toUpperCase()}</option>
        ))}
      </select>

      {/* Theme toggle */}
      <button className="pm-toolbar-btn" onClick={toggleTheme} title={t.toolbar.toggleTheme}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
