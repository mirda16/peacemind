import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MindMapNodeData, NodeShape, ChecklistItem } from '../types/mindmap';
import { useMindMapStore } from '../store/useMindMapStore';
import { useT } from '../i18n';

// ---------- shape styles ----------

function getShapeStyle(shape: NodeShape, bg: string, borderColor: string, borderWidth: number, sketchMode = false): React.CSSProperties {
  const base: React.CSSProperties = { background: bg, border: `${borderWidth}px solid ${borderColor}`, boxSizing: 'border-box' };
  const sketchRadius = sketchMode ? { borderRadius: '255px 15px 225px 15px / 15px 225px 15px 255px' } : {};
  switch (shape) {
    case 'rectangle': return { ...base, borderRadius: 4, ...sketchRadius };
    case 'rounded':   return { ...base, borderRadius: 12, ...sketchRadius };
    case 'ellipse':   return { ...base, borderRadius: '50%', minWidth: 100, minHeight: 50 };
    case 'circle':    return { ...base, borderRadius: '50%', minWidth: 80, minHeight: 80, aspectRatio: '1 / 1' };
    case 'pill':      return { ...base, borderRadius: 9999, ...sketchRadius };
    default:          return { ...base, borderRadius: 12, ...sketchRadius };
  }
}

// ---------- checklist item ----------

interface ItemRowProps {
  item: ChecklistItem;
  nodeId: string;
  textColor: string;
}

function ChecklistItemRow({ item, nodeId, textColor }: ItemRowProps) {
  const t = useT();
  const updateNodeData = useMindMapStore((s) => s.updateNodeData);
  const nodes = useMindMapStore((s) => s.nodes);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const getData = () => (nodes.find((n) => n.id === nodeId)?.data as MindMapNodeData | undefined);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = getData();
    if (!data?.checklist) return;
    updateNodeData(nodeId, {
      checklist: data.checklist.map((ci) => ci.id === item.id ? { ...ci, checked: !ci.checked } : ci),
    });
  };

  const commitText = () => {
    const data = getData();
    if (!data?.checklist) return;
    const text = draft.trim() || item.text;
    updateNodeData(nodeId, {
      checklist: data.checklist.map((ci) => ci.id === item.id ? { ...ci, text } : ci),
    });
    setEditing(false);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = getData();
    if (!data?.checklist) return;
    updateNodeData(nodeId, { checklist: data.checklist.filter((ci) => ci.id !== item.id) });
  };

  useEffect(() => { if (editing) { setDraft(item.text); setTimeout(() => inputRef.current?.focus(), 10); } }, [editing, item.text]);

  return (
    <div className={`pm-checklist-item${item.checked ? ' checked' : ''}`} onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}>
      <input type="checkbox" checked={item.checked} onChange={() => {}} onClick={toggle} />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitText}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') commitText(); if (e.key === 'Escape') setEditing(false); }}
          style={{ fontSize: 12, background: 'transparent', border: 'none', outline: '1px solid var(--pm-accent)', borderRadius: 3, color: textColor, flex: 1, minWidth: 0 }}
        />
      ) : (
        <span style={{ color: textColor }}>{item.text}</span>
      )}
      <button className="pm-del-btn" onClick={remove} title={t.node.remove}>×</button>
    </div>
  );
}

// ---------- main node ----------

function MindMapNode({ id, data, selected, width }: NodeProps) {
  const t = useT();
  const d = data as MindMapNodeData;
  const {
    label, shape, backgroundColor, textColor, borderColor, borderWidth,
    fontSize, fontWeight, fontStyle, icon, imageData, collapsed, checklist,
    notes, noteVisible, url,
  } = d;

  const editingNodeId    = useMindMapStore((s) => s.editingNodeId);
  const searchResultIds  = useMindMapStore((s) => s.searchResultIds);
  const searchQuery      = useMindMapStore((s) => s.searchQuery);
  const isSearchMatch    = searchQuery.trim() !== '' && searchResultIds.includes(id);
  const setEditingNodeId = useMindMapStore((s) => s.setEditingNodeId);
  const updateNodeLabel  = useMindMapStore((s) => s.updateNodeLabel);
  const pushHistory      = useMindMapStore((s) => s.pushHistory);
  const addChildNode     = useMindMapStore((s) => s.addChildNode);
  const toggleCollapse   = useMindMapStore((s) => s.toggleCollapse);
  const updateNodeData   = useMindMapStore((s) => s.updateNodeData);
  const edges            = useMindMapStore((s) => s.edges);
  const showNotes        = useMindMapStore((s) => s.showNotes);
  const sketchMode       = useMindMapStore((s) => s.sketchMode);

  const isNoteShown = noteVisible ?? showNotes;
  const hasChildren = edges.some((e) => e.source === id);
  const isEditing = editingNodeId === id;

  const [editValue, setEditValue] = useState(label as string);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, []);

  useEffect(() => {
    if (isEditing) {
      setEditValue(label as string);
      setTimeout(() => {
        const el = inputRef.current;
        if (!el) return;
        el.focus();
        el.select();
        autoResizeTextarea(el);
      }, 10);
    }
  }, [isEditing, label, autoResizeTextarea]);

  const commitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    updateNodeLabel(id, trimmed || (label as string));
    pushHistory();
    setEditingNodeId(null);
  }, [editValue, id, label, updateNodeLabel, pushHistory, setEditingNodeId]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNodeId(id);
  }, [id, setEditingNodeId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); }
    if (e.key === 'Escape') { setEditValue(label as string); setEditingNodeId(null); }
  }, [commitEdit, label, setEditingNodeId]);

  const handleAddChild = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newId = addChildNode(id);
    if (newId) setTimeout(() => setEditingNodeId(newId), 50);
  }, [id, addChildNode, setEditingNodeId]);

  const handleCollapse = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapse(id);
  }, [id, toggleCollapse]);

  const handleOpenUrl = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    const href = /^https?:\/\//i.test(url as string) ? (url as string) : `https://${url}`;
    import('@tauri-apps/plugin-opener').then(({ openUrl }) => openUrl(href));
  }, [url]);

  const handleToggleNote = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    updateNodeData(id, { noteVisible: !isNoteShown });
  }, [id, isNoteShown, updateNodeData]);

  const handleNoteChange = useCallback((text: string) => {
    updateNodeData(id, { notes: text });
  }, [id, updateNodeData]);

  const addChecklistItem = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const current = d.checklist ?? [];
    updateNodeData(id, {
      checklist: [...current, { id: crypto.randomUUID(), text: 'Nová položka', checked: false }],
    });
  }, [id, d, updateNodeData]);

  const shapeStyle = getShapeStyle(shape as NodeShape, backgroundColor as string, borderColor as string, borderWidth as number, sketchMode);

  const textStyle: React.CSSProperties = {
    color: textColor as string,
    fontSize: fontSize as number,
    fontWeight: fontWeight as string,
    fontStyle: fontStyle as string,
  };

  const checkedCount = checklist?.filter((i) => i.checked).length ?? 0;
  const totalCount   = checklist?.length ?? 0;

  return (
    <div
      className={`pm-node${selected ? ' selected' : ''}${isSearchMatch ? ' search-match' : ''}`}
      style={shapeStyle}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left}   style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="target" position={Position.Top}    style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Right}  style={{ opacity: 0, pointerEvents: 'none' }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />

      {/* Image */}
      {imageData && (
        <img src={imageData as string} className="pm-node-image" alt="" draggable={false} />
      )}

      {/* Header: icon + label + note toggle */}
      <div className="pm-node-header">
        {icon && <span className="pm-node-icon">{icon as string}</span>}
        {isEditing ? (
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => { setEditValue(e.target.value); autoResizeTextarea(e.target); }}
            onKeyDown={handleKeyDown}
            onBlur={commitEdit}
            className="nodrag"
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            rows={1}
            style={{ fontSize: fontSize as number, fontWeight: fontWeight as string, fontStyle: fontStyle as string, color: textColor as string, width: width ? width - 28 : undefined, minWidth: 60, maxWidth: 200, overflow: 'hidden', resize: 'none' }}
          />
        ) : (
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: 200, display: 'block', ...textStyle }}>
            {label as string}
            {collapsed && hasChildren && (
              <span style={{ marginLeft: 6, fontSize: '0.75em', opacity: 0.6 }}>
                ▶ {edges.filter(e => e.source === id).length}
              </span>
            )}
          </span>
        )}
        {url && (
          <button
            className="pm-note-btn has-note"
            onClick={handleOpenUrl}
            title={t.node.openUrl}
          >
            🔗
          </button>
        )}
        <button
          className={`pm-note-btn${notes ? ' has-note' : ''}`}
          onClick={handleToggleNote}
          title={t.node.toggleNote}
        >
          📝
        </button>
      </div>

      {/* Note */}
      {isNoteShown && (
        <div className="pm-note" onClick={(e) => e.stopPropagation()}>
          <textarea
            className="pm-note-textarea"
            value={(notes as string) || ''}
            onChange={(e) => handleNoteChange(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={t.node.notePlaceholder}
            rows={3}
            style={{ color: textColor as string }}
          />
        </div>
      )}

      {/* Checklist */}
      {checklist && checklist.length > 0 && (
        <div className="pm-checklist" onClick={(e) => e.stopPropagation()}>
          {totalCount > 0 && (
            <div style={{ fontSize: 10, color: textColor as string, opacity: 0.6, marginBottom: 2 }}>
              {checkedCount}/{totalCount}
            </div>
          )}
          {(checklist as ChecklistItem[]).map((item) => (
            <ChecklistItemRow key={item.id} item={item} nodeId={id} textColor={textColor as string} />
          ))}
          <button className="pm-checklist-add" onClick={addChecklistItem} style={{ color: textColor as string }}>
            {t.node.addItem}
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      {hasChildren && (
        <button
          className="pm-node-collapse"
          onClick={handleCollapse}
          title={collapsed ? t.node.expand : t.node.collapse}
        >
          {collapsed ? '▶' : '▼'}
        </button>
      )}

      {/* Add child button */}
      <button
        className="pm-node-add-btn"
        onClick={handleAddChild}
        title={t.node.addChild}
      >
        +
      </button>
    </div>
  );
}

export default memo(MindMapNode);
