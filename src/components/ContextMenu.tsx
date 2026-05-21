import { useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, GitBranch, Copy, Scissors } from 'lucide-react';
import { useMindMapStore } from '../store/useMindMapStore';
import { MindMapNodeData } from '../types/mindmap';
import { useT } from '../i18n';

interface Props {
  x: number;
  y: number;
  nodeId?: string;
  onClose: () => void;
}

export default function ContextMenu({ x, y, nodeId, onClose }: Props) {
  const t = useT();
  const menuRef = useRef<HTMLDivElement>(null);
  const nodes = useMindMapStore((s) => s.nodes);
  const edges = useMindMapStore((s) => s.edges);
  const addChildNode = useMindMapStore((s) => s.addChildNode);
  const addSiblingNode = useMindMapStore((s) => s.addSiblingNode);
  const deleteNode = useMindMapStore((s) => s.deleteNode);
  const setEditingNodeId = useMindMapStore((s) => s.setEditingNodeId);
  const setSelectedNodeIds = useMindMapStore((s) => s.setSelectedNodeIds);
  const detachFromParent = useMindMapStore((s) => s.detachFromParent);
  const copyNode = useMindMapStore((s) => s.copyNode);

  const node = nodes.find((n) => n.id === nodeId);
  const isRoot = node && (node.data as MindMapNodeData).isRoot;
  const isMindMapNode = node?.type === 'mindMapNode';
  const hasParent = !!nodeId && edges.some((e) => e.target === nodeId);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  const act = (fn: () => void) => { fn(); onClose(); };

  const menuStyle: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 200),
    top: Math.min(y, window.innerHeight - 300),
  };

  return (
    <div ref={menuRef} className="pm-context-menu" style={menuStyle}>
      {nodeId ? (
        <>
          {isMindMapNode && (
            <>
              <div className="pm-context-item" onClick={() => act(() => {
                const newId = addChildNode(nodeId);
                if (newId) { setSelectedNodeIds([newId]); setTimeout(() => setEditingNodeId(newId), 60); }
              })}>
                <Plus size={15} /> {t.contextMenu.addChild}
              </div>
              {!isRoot && (
                <div className="pm-context-item" onClick={() => act(() => {
                  const newId = addSiblingNode(nodeId);
                  if (newId) { setSelectedNodeIds([newId]); setTimeout(() => setEditingNodeId(newId), 60); }
                })}>
                  <GitBranch size={15} /> {t.contextMenu.addSibling}
                </div>
              )}
            </>
          )}

          <div className="pm-context-item" onClick={() => act(() => setEditingNodeId(nodeId))}>
            <Edit2 size={15} /> {t.contextMenu.editText}
          </div>

          {isMindMapNode && (
            <>
              <div className="pm-context-sep" />
              <div className="pm-context-item" onClick={() => act(() => {
                const newId = copyNode(nodeId, false);
                if (newId) setSelectedNodeIds([newId]);
              })}>
                <Copy size={15} /> {t.contextMenu.copyNode}
              </div>
              <div className="pm-context-item" onClick={() => act(() => {
                const newId = copyNode(nodeId, true);
                if (newId) setSelectedNodeIds([newId]);
              })}>
                <Copy size={15} /> {t.contextMenu.copyWithSubtree}
              </div>
            </>
          )}

          {isMindMapNode && hasParent && !isRoot && (
            <div className="pm-context-item" onClick={() => act(() => detachFromParent(nodeId))}>
              <Scissors size={15} /> {t.contextMenu.detachFromParent}
            </div>
          )}

          {!isRoot && (
            <>
              <div className="pm-context-sep" />
              <div className="pm-context-item danger" onClick={() => act(() => deleteNode(nodeId))}>
                <Trash2 size={15} /> {t.contextMenu.deleteNode}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="pm-context-item" style={{ color: 'var(--pm-text-muted)', cursor: 'default' }}>
          {t.contextMenu.noNodeHint}
        </div>
      )}
    </div>
  );
}
