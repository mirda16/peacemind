import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';
import { useMindMapStore } from '../store/useMindMapStore';
import { FreeTextNodeData } from '../types/mindmap';

function FreeTextNode({ id, data, selected }: NodeProps) {
  const d = data as FreeTextNodeData;
  const updateNodeData = useMindMapStore((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(d.text);
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(d.text);
      setTimeout(() => { textRef.current?.focus(); textRef.current?.select(); }, 10);
    }
  }, [editing, d.text]);

  const commit = useCallback(() => {
    updateNodeData(id, { text: draft || d.text });
    setEditing(false);
  }, [draft, d.text, id, updateNodeData]);

  return (
    <>
      <NodeResizer
        color="var(--pm-accent)"
        isVisible={selected}
        minWidth={80}
        minHeight={40}
        lineStyle={{ borderWidth: 1 }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2, background: 'var(--pm-accent)' }}
      />
      <div
        className="pm-free-text"
        style={{
          width: '100%',
          height: '100%',
          fontSize: d.fontSize,
          color: d.textColor,
          fontWeight: d.fontWeight,
          fontStyle: d.fontStyle,
          background: d.backgroundColor,
          border: d.borderWidth > 0 ? `${d.borderWidth}px solid ${d.borderColor}` : 'none',
          borderRadius: 6,
          padding: 8,
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
        onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      >
        {editing ? (
          <textarea
            ref={textRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Escape') setEditing(false);
            }}
            style={{
              width: '100%',
              height: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              resize: 'none',
              fontSize: d.fontSize,
              color: d.textColor,
              fontWeight: d.fontWeight,
              fontStyle: d.fontStyle,
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{d.text}</span>
        )}
      </div>
    </>
  );
}

export default memo(FreeTextNode);
