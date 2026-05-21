import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { useMindMapStore } from '../store/useMindMapStore';
import { GroupNodeData } from '../types/mindmap';

function GroupNode({ id, data, selected }: NodeProps) {
  const d = data as GroupNodeData;
  const updateNodeData = useMindMapStore((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(d.label);
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
    }
  }, [editing, d.label]);

  const commit = useCallback(() => {
    updateNodeData(id, { label: draft.trim() || d.label });
    setEditing(false);
  }, [draft, d.label, id, updateNodeData]);

  return (
    <>
      <NodeResizer
        color="var(--pm-accent)"
        isVisible={selected}
        minWidth={160}
        minHeight={120}
        lineStyle={{ borderWidth: 1 }}
        handleStyle={{ width: 10, height: 10, borderRadius: 3, background: 'var(--pm-accent)' }}
      />
      <div
        className="pm-group-node"
        style={{
          width: '100%',
          height: '100%',
          background: d.backgroundColor + '15',
          border: `${d.borderWidth}px dashed ${d.borderColor}`,
          borderRadius: 12,
        }}
      >
        {/* Label bar at top */}
        <div
          className="pm-group-label"
          style={{
            color: d.textColor,
            fontSize: d.fontSize,
            background: d.borderColor + '25',
            borderBottom: `1px dashed ${d.borderColor}`,
            borderRadius: '10px 10px 0 0',
            padding: '4px 10px',
          }}
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: d.textColor,
                fontSize: d.fontSize,
                fontWeight: 600,
                width: '100%',
              }}
            />
          ) : (
            <span style={{ fontWeight: 600, userSelect: 'none' }}>{d.label}</span>
          )}
        </div>
      </div>
    </>
  );
}

export default memo(GroupNode);
