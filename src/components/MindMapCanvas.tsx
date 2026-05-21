import { useCallback, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  useReactFlow,
  OnSelectionChangeParams,
  NodeMouseHandler,
} from '@xyflow/react';
import { useMindMapStore } from '../store/useMindMapStore';
import { MindMapNodeData } from '../types/mindmap';
import MindMapNode from './MindMapNode';
import MindMapEdge from './MindMapEdge';
import GroupNode from './GroupNode';
import FreeTextNode from './FreeTextNode';
import FreeShapeNode from './FreeShapeNode';

const nodeTypes: NodeTypes = {
  mindMapNode:   MindMapNode   as NodeTypes['mindMapNode'],
  groupNode:     GroupNode     as NodeTypes['groupNode'],
  freeTextNode:  FreeTextNode  as NodeTypes['freeTextNode'],
  freeShapeNode: FreeShapeNode as NodeTypes['freeShapeNode'],
};
const edgeTypes: EdgeTypes = { mindMapEdge: MindMapEdge as EdgeTypes['mindMapEdge'] };

interface Props {
  onContextMenu: (e: React.MouseEvent, nodeId?: string) => void;
}

export default function MindMapCanvas({ onContextMenu }: Props) {
  const nodes = useMindMapStore((s) => s.nodes);
  const edges = useMindMapStore((s) => s.edges);
  const theme = useMindMapStore((s) => s.theme);
  const onNodesChange = useMindMapStore((s) => s.onNodesChange);
  const onEdgesChange = useMindMapStore((s) => s.onEdgesChange);
  const onConnect = useMindMapStore((s) => s.onConnect);
  const setViewport = useMindMapStore((s) => s.setViewport);
  const setSelectedNodeIds = useMindMapStore((s) => s.setSelectedNodeIds);
  const setEditingNodeId = useMindMapStore((s) => s.setEditingNodeId);
  const editingNodeId = useMindMapStore((s) => s.editingNodeId);
  const addChildNode = useMindMapStore((s) => s.addChildNode);
  const addSiblingNode = useMindMapStore((s) => s.addSiblingNode);
  const deleteNode = useMindMapStore((s) => s.deleteNode);
  const undo = useMindMapStore((s) => s.undo);
  const redo = useMindMapStore((s) => s.redo);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();

  // Refocus canvas after finishing node edit so keyboard shortcuts (Enter, Tab) work again
  useEffect(() => {
    if (editingNodeId === null && useMindMapStore.getState().selectedNodeIds.length > 0) {
      wrapperRef.current?.focus();
    }
  }, [editingNodeId]);

  const handleSelectionChange = useCallback(
    ({ nodes: sel }: OnSelectionChangeParams) => {
      setSelectedNodeIds(sel.map((n) => n.id));
    },
    [setSelectedNodeIds]
  );

  const handleNodeDoubleClick = useCallback<NodeMouseHandler>(
    (_e, node) => {
      setEditingNodeId(node.id);
    },
    [setEditingNodeId]
  );

  const handlePaneClick = useCallback(() => {
    if (editingNodeId) setEditingNodeId(null);
    setSelectedNodeIds([]);
  }, [editingNodeId, setEditingNodeId, setSelectedNodeIds]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (editingNodeId) return;
      const selectedIds = useMindMapStore.getState().selectedNodeIds;
      const primaryId = selectedIds[0];

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); return; }
        if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) { e.preventDefault(); redo(); return; }
        if (e.key === '0') { e.preventDefault(); fitView({ duration: 300 }); return; }
      }

      if (!primaryId) return;

      if (e.key === 'Tab') {
        e.preventDefault();
        const newId = addChildNode(primaryId);
        if (newId) {
          setSelectedNodeIds([newId]);
          setTimeout(() => setEditingNodeId(newId), 60);
        }
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const newId = addSiblingNode(primaryId);
        if (newId) {
          setSelectedNodeIds([newId]);
          setTimeout(() => setEditingNodeId(newId), 60);
        }
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        setEditingNodeId(primaryId);
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        const allNodes = useMindMapStore.getState().nodes;
        for (const sid of selectedIds) {
          const node = allNodes.find((n) => n.id === sid);
          if (node && !(node.data as MindMapNodeData).isRoot) {
            deleteNode(sid);
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        setSelectedNodeIds([]);
        return;
      }
    },
    [editingNodeId, addChildNode, addSiblingNode, deleteNode, setEditingNodeId, setSelectedNodeIds, undo, redo, fitView]
  );

  const handleNodeContextMenu = useCallback(
    (e: React.MouseEvent, node: { id: string }) => {
      e.preventDefault();
      onContextMenu(e, node.id);
    },
    [onContextMenu]
  );

  const handlePaneContextMenu = useCallback(
    (e: MouseEvent | React.MouseEvent) => {
      e.preventDefault();
      onContextMenu(e as React.MouseEvent);
    },
    [onContextMenu]
  );

  const bgColor = theme === 'dark' ? '#0f172a' : '#f8fafc';
  const dotColor = theme === 'dark' ? '#1e293b' : '#e2e8f0';

  return (
    <div
      ref={wrapperRef}
      style={{ flex: 1, outline: 'none', transform: 'translateZ(0)' }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        onNodeContextMenu={handleNodeContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        onMoveEnd={(_, viewport) => setViewport(viewport)}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.05}
        maxZoom={5}
        elevateNodesOnSelect={false}
        nodesFocusable={false}
        deleteKeyCode={null}
        multiSelectionKeyCode="Shift"
        panOnDrag={[1, 2]}
        zoomOnScroll
        zoomOnPinch
        panOnScroll={false}
        selectionOnDrag={true}
        style={{ background: bgColor }}
      >
        <Background variant={BackgroundVariant.Dots} color={dotColor} gap={24} size={1.5} />
        <Controls />
        <MiniMap
          nodeColor={(node) => (node.data as MindMapNodeData).backgroundColor ?? '#f1f5f9'}
          maskColor={theme === 'dark' ? 'rgba(15,23,42,0.7)' : 'rgba(248,250,252,0.7)'}
          style={{ bottom: 12, right: 12 }}
        />
      </ReactFlow>
    </div>
  );
}
