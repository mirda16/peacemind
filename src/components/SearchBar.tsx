import { useEffect, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { useMindMapStore } from '../store/useMindMapStore';
import { useT } from '../i18n';

interface Props {
  onClose: () => void;
}

export default function SearchBar({ onClose }: Props) {
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setCenter, getZoom } = useReactFlow();

  const searchQuery    = useMindMapStore((s) => s.searchQuery);
  const searchResultIds = useMindMapStore((s) => s.searchResultIds);
  const setSearchQuery = useMindMapStore((s) => s.setSearchQuery);
  const nodes          = useMindMapStore((s) => s.nodes);

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setCurrentIdx(0);
  }, [searchResultIds]);

  useEffect(() => {
    if (searchResultIds.length === 0) return;
    const id = searchResultIds[currentIdx];
    const node = nodes.find((n) => n.id === id);
    if (node) {
      const x = node.position.x + (node.measured?.width ?? 160) / 2;
      const y = node.position.y + (node.measured?.height ?? 48) / 2;
      setCenter(x, y, { duration: 300, zoom: Math.max(getZoom(), 0.75) });
    }
  }, [currentIdx, searchResultIds, nodes, setCenter, getZoom]);

  const navigate = (dir: 1 | -1) => {
    if (searchResultIds.length === 0) return;
    setCurrentIdx((i) => (i + dir + searchResultIds.length) % searchResultIds.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'Enter') { navigate(e.shiftKey ? -1 : 1); }
  };

  const total = searchResultIds.length;
  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, display: 'flex', alignItems: 'center', gap: 4,
      background: 'var(--pm-surface)', border: '1px solid var(--pm-border)',
      borderRadius: 10, padding: '4px 8px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    }}>
      <input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.search.placeholder}
        style={{
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: 13, color: 'var(--pm-text)', width: 200,
        }}
      />
      {hasQuery && (
        <span style={{ fontSize: 11, color: 'var(--pm-text-muted)', whiteSpace: 'nowrap' }}>
          {total === 0
            ? t.search.noResults
            : `${currentIdx + 1} ${t.search.resultOf} ${total}`}
        </span>
      )}
      <button className="pm-toolbar-btn" style={{ padding: '2px 4px' }} onClick={() => navigate(-1)} disabled={total === 0}>
        <ChevronUp size={14} />
      </button>
      <button className="pm-toolbar-btn" style={{ padding: '2px 4px' }} onClick={() => navigate(1)} disabled={total === 0}>
        <ChevronDown size={14} />
      </button>
      <button className="pm-toolbar-btn" style={{ padding: '2px 4px' }} onClick={onClose}>
        <X size={14} />
      </button>
    </div>
  );
}
