import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { useMindMapStore } from '../store/useMindMapStore';
import { FreeShapeNodeData } from '../types/mindmap';

function FreeShapeNode({ id, data, selected }: NodeProps) {
  const d = data as FreeShapeNodeData;
  const updateNodeData = useMindMapStore((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.label ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(d.label ?? '');
      setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select(); }, 10);
    }
  }, [editing, d.label]);

  const commit = useCallback(() => {
    updateNodeData(id, { label: draft });
    setEditing(false);
  }, [draft, id, updateNodeData]);

  const borderRadius =
    d.shapeType === 'ellipse' ? '50%' :
    d.shapeType === 'rounded-rectangle' ? 14 : 4;

  return (
    <>
      <NodeResizer
        color="var(--pm-accent)"
        isVisible={selected}
        minWidth={40}
        minHeight={40}
        lineStyle={{ borderWidth: 1 }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2, background: 'var(--pm-accent)' }}
      />
      <div
        className="pm-free-shape"
        style={{
          width: '100%',
          height: '100%',
          background: d.backgroundColor,
          border: `${d.borderWidth}px solid ${d.borderColor}`,
          borderRadius,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
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
              fontFamily: 'inherit',
              textAlign: 'center',
              width: '90%',
            }}
          />
        ) : (
          d.label && (
            <span style={{
              color: d.textColor,
              fontSize: d.fontSize,
              textAlign: 'center',
              padding: 4,
              wordBreak: 'break-word',
            }}>
              {d.label}
            </span>
          )
        )}
      </div>
    </>
  );
}

export default memo(FreeShapeNode);
