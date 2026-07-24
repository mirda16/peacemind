import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  Viewport,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import {
  MindMapNodeData,
  MindMapEdgeData,
  GroupNodeData,
  FreeTextNodeData,
  FreeShapeNodeData,
  FreeShapeType,
  DEFAULT_NODE_DATA,
  DEFAULT_ROOT_DATA,
  DEFAULT_EDGE_DATA,
} from '../types/mindmap';
import { getT, type Lang } from '../i18n';
import { MAP_STYLE_PRESETS } from '../types/styles';
import { COLOR_PALETTES } from '../types/palettes';
import { computeLayout, LayoutDirection } from '../utils/autoLayout';

type MindNode = Node<MindMapNodeData>;
type MindEdge = Edge<MindMapEdgeData>;

interface HistoryEntry {
  nodes: MindNode[];
  edges: MindEdge[];
}

interface MindMapState {
  nodes: MindNode[];
  edges: MindEdge[];
  selectedNodeIds: string[];
  editingNodeId: string | null;
  viewport: Viewport;
  theme: 'light' | 'dark';
  language: Lang;
  isDirty: boolean;
  currentFilePath: string | null;
  mapTitle: string;
  history: HistoryEntry[];
  historyIndex: number;
  defaultEdgeData: MindMapEdgeData;
  currentStyleId: string;
  showNotes: boolean;
  sketchMode: boolean;
  searchQuery: string;
  searchResultIds: string[];

  // Flow callbacks
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  setViewport: (viewport: Viewport) => void;

  // Node operations
  addChildNode: (parentId: string) => string | null;
  addSiblingNode: (nodeId: string) => string | null;
  updateNodeData: (id: string, data: Record<string, unknown>) => void;
  updateNodeLabel: (id: string, label: string) => void;
  deleteNode: (id: string) => void;
  toggleCollapse: (id: string) => void;

  // Selection & editing
  setSelectedNodeIds: (ids: string[]) => void;
  setEditingNodeId: (id: string | null) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // File
  setMapTitle: (title: string) => void;
  setCurrentFilePath: (path: string | null) => void;
  setIsDirty: (dirty: boolean) => void;
  loadMap: (nodes: MindNode[], edges: MindEdge[], title: string, theme?: 'light' | 'dark') => void;
  newMap: () => void;

  // Theme & language
  toggleTheme: () => void;
  setLanguage: (lang: Lang) => void;

  // Notes
  toggleShowNotes: () => void;

  // Search
  setSearchQuery: (query: string) => void;

  // Edge defaults
  setDefaultEdgeData: (data: Partial<MindMapEdgeData>) => void;
  // Update edges for selected nodes OR all edges if nodeIds empty
  applyEdgeStyleToNodes: (data: Partial<MindMapEdgeData>, nodeIds: string[]) => void;
  applyEdgeStyleToAll: (data: Partial<MindMapEdgeData>) => void;

  // Style presets
  applyStylePreset: (styleId: string, applyColors?: boolean) => void;
  applyColorPalette: (paletteId: string) => void;

  // Free objects & groups
  addGroup: (position?: { x: number; y: number }) => string;
  addFreeText: (position?: { x: number; y: number }) => string;
  addFreeShape: (shapeType: FreeShapeType, position?: { x: number; y: number }) => string;

  // Copy & detach
  detachFromParent: (nodeId: string) => void;
  copyNode: (nodeId: string, withSubtree: boolean) => string | null;

  // Auto layout
  autoLayout: (direction: LayoutDirection) => void;
}

// ---------- helpers ----------

function getNodeDepth(nodeId: string, edges: MindEdge[]): number {
  let depth = 0, current = nodeId;
  for (let i = 0; i < 30; i++) {
    const parent = edges.find((e) => e.target === current);
    if (!parent) break;
    current = parent.source;
    depth++;
  }
  return depth;
}

// Walks up from nodeId to find the direct child of rootId it descends from
// (i.e. which main branch it belongs to). Returns null for the root itself.
function getBranchAncestorId(nodeId: string, rootId: string, edges: MindEdge[]): string | null {
  if (nodeId === rootId) return null;
  let current = nodeId;
  for (let i = 0; i < 30; i++) {
    const parentEdge = edges.find((e) => e.target === current);
    if (!parentEdge) return current;
    if (parentEdge.source === rootId) return current;
    current = parentEdge.source;
  }
  return current;
}

function contrastTextColor(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length !== 6) return '#1e293b';
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1e293b' : '#ffffff';
}

function getChildPosition(
  parentNode: MindNode,
  existingChildren: MindNode[],
  horizontalGap = 250,
  verticalGap = 72
): { x: number; y: number } {
  if (existingChildren.length === 0) {
    return { x: parentNode.position.x + horizontalGap, y: parentNode.position.y };
  }
  const maxY = Math.max(...existingChildren.map((c) => c.position.y));
  return { x: parentNode.position.x + horizontalGap, y: maxY + verticalGap };
}

function createEdge(sourceId: string, targetId: string, edgeData: MindMapEdgeData): MindEdge {
  return {
    id: uuidv4(),
    source: sourceId,
    target: targetId,
    type: 'mindMapEdge',
    data: { ...edgeData },
    style: {},
    animated: edgeData.animated,
  };
}

function createRootNode(styleId = 'klasicky', lang: Lang = 'en'): MindNode {
  const preset = MAP_STYLE_PRESETS.find((s) => s.id === styleId) ?? MAP_STYLE_PRESETS[0];
  return {
    id: uuidv4(),
    type: 'mindMapNode',
    position: { x: 0, y: 0 },
    data: { ...DEFAULT_ROOT_DATA, ...preset.rootNode, label: getT(lang).defaults.rootLabel, isRoot: true } as MindMapNodeData,
  };
}

// ---------- store ----------

const initialRoot = createRootNode();

export const useMindMapStore = create<MindMapState>()(
  immer((set, get) => ({
    nodes: [initialRoot],
    edges: [],
    selectedNodeIds: [],
    editingNodeId: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    theme: 'light',
    language: 'en' as Lang,
    isDirty: false,
    currentFilePath: null,
    mapTitle: getT('en').defaults.mapTitle,
    history: [{ nodes: [initialRoot], edges: [] }],
    historyIndex: 0,
    defaultEdgeData: { ...DEFAULT_EDGE_DATA },
    currentStyleId: 'klasicky',
    showNotes: false,
    sketchMode: false,
    searchQuery: '',
    searchResultIds: [],

    onNodesChange: (changes) => {
      set((state) => {
        state.nodes = applyNodeChanges(changes, state.nodes) as MindNode[];
      });
      const posChanges = changes.filter((c) => c.type === 'position' && c.dragging === false);
      if (posChanges.length > 0) {
        get().pushHistory();
        set((state) => { state.isDirty = true; });
      }
    },

    onEdgesChange: (changes) => {
      set((state) => {
        state.edges = applyEdgeChanges(changes, state.edges) as MindEdge[];
      });
    },

    onConnect: (connection) => {
      const edgeData = get().defaultEdgeData;
      set((state) => {
        state.edges = addEdge(
          { ...connection, id: uuidv4(), type: 'mindMapEdge', data: { ...edgeData }, animated: edgeData.animated },
          state.edges
        ) as MindEdge[];
        state.isDirty = true;
      });
      get().pushHistory();
    },

    setViewport: (viewport) => set((state) => { state.viewport = viewport; }),

    addChildNode: (parentId) => {
      const { nodes, edges, defaultEdgeData } = get();
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return null;

      const childIds = edges.filter((e) => e.source === parentId).map((e) => e.target);
      const existingChildren = nodes.filter((n) => childIds.includes(n.id));
      const position = getChildPosition(parent, existingChildren);

      const newId = uuidv4();
      const preset = MAP_STYLE_PRESETS.find((s) => s.id === get().currentStyleId);
      const parentData = parent.data as MindMapNodeData;

      // Use preset's childNode style if available; inherit only typography and shape from parent
      const nodeData: MindMapNodeData = {
        ...DEFAULT_NODE_DATA,
        ...(preset?.childNode ?? {}),
        label: getT(get().language).defaults.newNode,
        fontSize: parentData.fontSize,
        fontWeight: parentData.fontWeight,
        fontStyle: parentData.fontStyle,
        shape: parentData.shape,
      } as MindMapNodeData;

      // Edge color per level (from preset if available)
      const depth = getNodeDepth(parentId, edges) + 1;
      let edgeColorData = { ...defaultEdgeData };
      if (preset?.levelEdgeColors) {
        const ec = preset.levelEdgeColors[Math.min(depth - 1, preset.levelEdgeColors.length - 1)];
        edgeColorData = { ...edgeColorData, color: ec };
      }

      const newNode: MindNode = { id: newId, type: 'mindMapNode', position, data: nodeData };
      const newEdge = createEdge(parentId, newId, edgeColorData);

      set((state) => {
        state.nodes.push(newNode);
        state.edges.push(newEdge);
        state.isDirty = true;
      });
      get().pushHistory();
      return newId;
    },

    addSiblingNode: (nodeId) => {
      const { edges } = get();
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (!parentEdge) {
        // Root node — add below at same level
        const { nodes } = get();
        const currentNode = nodes.find((n) => n.id === nodeId);
        if (!currentNode) return null;
        const newId = uuidv4();
        const newNode: MindNode = {
          id: newId, type: 'mindMapNode',
          position: { x: currentNode.position.x, y: currentNode.position.y + 80 },
          data: { ...DEFAULT_NODE_DATA, label: getT(get().language).defaults.newNode } as MindMapNodeData,
        };
        set((state) => { state.nodes.push(newNode); state.isDirty = true; });
        get().pushHistory();
        return newId;
      }
      return get().addChildNode(parentEdge.source);
    },

    updateNodeData: (id, data) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) { Object.assign(node.data, data); state.isDirty = true; }
      });
      get().pushHistory();
    },

    updateNodeLabel: (id, label) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (node) { node.data.label = label; state.isDirty = true; }
      });
    },

    deleteNode: (id) => {
      set((state) => {
        const toDelete = new Set<string>();
        const collect = (nId: string) => {
          toDelete.add(nId);
          state.edges.filter((e) => e.source === nId).forEach((e) => collect(e.target));
        };
        collect(id);
        state.nodes = state.nodes.filter((n) => !toDelete.has(n.id));
        state.edges = state.edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target));
        state.selectedNodeIds = state.selectedNodeIds.filter((i) => !toDelete.has(i));
        state.isDirty = true;
      });
      get().pushHistory();
    },

    toggleCollapse: (id) => {
      set((state) => {
        const node = state.nodes.find((n) => n.id === id);
        if (!node) return;
        const data = node.data as MindMapNodeData;
        const newCollapsed = !data.collapsed;
        data.collapsed = newCollapsed;

        const descendants = new Set<string>();
        const collect = (nId: string) => {
          state.edges.filter((e) => e.source === nId).forEach((e) => {
            descendants.add(e.target);
            collect(e.target);
          });
        };
        collect(id);

        state.nodes.forEach((n) => { if (descendants.has(n.id)) n.hidden = newCollapsed; });
        // Hide edges going INTO a descendant (covers X→child and child→grandchild)
        state.edges.forEach((e) => { if (descendants.has(e.target)) e.hidden = newCollapsed; });
        state.isDirty = true;
      });
      get().pushHistory();
    },

    setSelectedNodeIds: (ids) => set((state) => {
      state.selectedNodeIds = ids;
      state.nodes.forEach((n) => { n.selected = ids.includes(n.id); });
    }),
    setEditingNodeId: (id) => set((state) => { state.editingNodeId = id; }),

    pushHistory: () => {
      const { nodes, edges, history, historyIndex } = get();
      const snap = { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) };
      const newHistory = [...history.slice(0, historyIndex + 1), snap].slice(-100);
      set((state) => { state.history = newHistory; state.historyIndex = newHistory.length - 1; });
    },

    undo: () => {
      const { historyIndex, history } = get();
      if (historyIndex <= 0) return;
      const prev = history[historyIndex - 1];
      set((state) => {
        state.nodes = JSON.parse(JSON.stringify(prev.nodes));
        state.edges = JSON.parse(JSON.stringify(prev.edges));
        state.historyIndex = historyIndex - 1;
        state.isDirty = true;
      });
    },

    redo: () => {
      const { historyIndex, history } = get();
      if (historyIndex >= history.length - 1) return;
      const next = history[historyIndex + 1];
      set((state) => {
        state.nodes = JSON.parse(JSON.stringify(next.nodes));
        state.edges = JSON.parse(JSON.stringify(next.edges));
        state.historyIndex = historyIndex + 1;
        state.isDirty = true;
      });
    },

    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    setMapTitle: (title) => set((state) => { state.mapTitle = title; state.isDirty = true; }),
    setCurrentFilePath: (path) => set((state) => { state.currentFilePath = path; }),
    setIsDirty: (dirty) => set((state) => { state.isDirty = dirty; }),

    loadMap: (nodes, edges, title, theme = 'light') => {
      set((state) => {
        state.nodes = nodes; state.edges = edges; state.mapTitle = title; state.theme = theme;
        state.isDirty = false; state.selectedNodeIds = []; state.editingNodeId = null;
        state.currentStyleId = 'klasicky'; // reset to default; overridden by applyStylePreset if file has styleId
        state.history = [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }];
        state.historyIndex = 0;
      });
    },

    newMap: () => {
      const root = createRootNode(get().currentStyleId, get().language);
      set((state) => {
        state.nodes = [root]; state.edges = []; state.mapTitle = getT(get().language).defaults.mapTitle;
        state.isDirty = false; state.currentFilePath = null;
        state.selectedNodeIds = []; state.editingNodeId = null;
        state.history = [{ nodes: [root], edges: [] }]; state.historyIndex = 0;
      });
    },

    toggleTheme: () => set((state) => { state.theme = state.theme === 'light' ? 'dark' : 'light'; }),
    setLanguage: (lang) => set((state) => { state.language = lang; }),
    toggleShowNotes: () => set((state) => { state.showNotes = !state.showNotes; }),

    setSearchQuery: (query) => set((state) => {
      state.searchQuery = query;
      if (!query.trim()) {
        state.searchResultIds = [];
        return;
      }
      const q = query.toLowerCase();
      state.searchResultIds = state.nodes
        .filter((n) => {
          const label = String((n.data as Record<string, unknown>).label ?? '').toLowerCase();
          const notes = String((n.data as Record<string, unknown>).notes ?? '').toLowerCase();
          return label.includes(q) || notes.includes(q);
        })
        .map((n) => n.id);
    }),

    setDefaultEdgeData: (data) => {
      set((state) => { Object.assign(state.defaultEdgeData, data); });
    },

    applyEdgeStyleToNodes: (data, nodeIds) => {
      set((state) => {
        state.edges.forEach((edge) => {
          if (nodeIds.includes(edge.source) || nodeIds.includes(edge.target)) {
            if (edge.data) Object.assign(edge.data, data);
            if (data.animated !== undefined) edge.animated = data.animated;
          }
        });
        state.isDirty = true;
      });
    },

    applyEdgeStyleToAll: (data) => {
      set((state) => {
        state.edges.forEach((edge) => {
          if (edge.data) Object.assign(edge.data, data);
          if (data.animated !== undefined) edge.animated = data.animated;
        });
        Object.assign(state.defaultEdgeData, data);
        state.isDirty = true;
      });
      get().pushHistory();
    },

    applyStylePreset: (styleId, applyColors = true) => {
      const preset = MAP_STYLE_PRESETS.find((s) => s.id === styleId);
      if (!preset) return;

      set((state) => {
        state.currentStyleId = styleId;
        state.sketchMode = preset.sketchMode ?? false;

        // Update default edge data (skip color if applyColors is false)
        const { color: _ec, ...edgeWithoutColor } = preset.edge;
        Object.assign(state.defaultEdgeData, applyColors ? preset.edge : edgeWithoutColor);

        // Update all edges
        state.edges.forEach((edge) => {
          if (edge.data) Object.assign(edge.data, applyColors ? preset.edge : edgeWithoutColor);
          edge.animated = preset.edge.animated;
          if (applyColors && preset.levelEdgeColors) {
            const depth = getNodeDepth(edge.target, state.edges);
            const ec = preset.levelEdgeColors[Math.min(Math.max(depth - 1, 0), preset.levelEdgeColors.length - 1)];
            if (edge.data) (edge.data as MindMapEdgeData).color = ec;
          }
        });

        // Update all nodes
        state.nodes.forEach((node) => {
          const depth = getNodeDepth(node.id, state.edges);
          const isRoot = (node.data as MindMapNodeData).isRoot;
          const baseStyle = isRoot ? preset.rootNode : preset.childNode;

          if (applyColors) {
            Object.assign(node.data, baseStyle);
          } else {
            const { backgroundColor: _bg, textColor: _tc, borderColor: _bc, ...styleWithoutColors } = baseStyle;
            Object.assign(node.data, styleWithoutColors);
          }

          // Apply level colors only when applyColors is true
          if (applyColors && preset.levelColors) {
            const color = preset.levelColors[Math.min(depth, preset.levelColors.length - 1)];
            (node.data as MindMapNodeData).backgroundColor = color;
            (node.data as MindMapNodeData).textColor = depth <= 1 ? '#ffffff' : (node.data as MindMapNodeData).textColor;
          }
        });

        state.isDirty = true;
      });
      get().pushHistory();
    },

    applyColorPalette: (paletteId) => {
      const palette = COLOR_PALETTES.find((p) => p.id === paletteId);
      if (!palette) return;

      set((state) => {
        const root = state.nodes.find((n) => (n.data as MindMapNodeData).isRoot);
        if (!root) return;

        const directChildIds = state.edges
          .filter((e) => e.source === root.id)
          .map((e) => e.target);

        const branchColors = new Map<string, string>();
        directChildIds.forEach((id, i) => {
          branchColors.set(id, palette.colors[i % palette.colors.length]);
        });

        state.nodes.forEach((node) => {
          if (node.id === root.id) return;
          const branchId = getBranchAncestorId(node.id, root.id, state.edges);
          const color = branchId ? branchColors.get(branchId) : undefined;
          if (!color) return;
          const data = node.data as MindMapNodeData;
          data.backgroundColor = color;
          data.textColor = contrastTextColor(color);
          data.borderColor = `color-mix(in srgb, ${color} 70%, black)`;
        });

        state.edges.forEach((edge) => {
          const branchId = getBranchAncestorId(edge.target, root.id, state.edges);
          const color = branchId ? branchColors.get(branchId) : undefined;
          if (!color || !edge.data) return;
          (edge.data as MindMapEdgeData).color = color;
        });

        state.isDirty = true;
      });
      get().pushHistory();
    },

    addGroup: (position = { x: 100, y: 100 }) => {
      const id = uuidv4();
      const groupData: GroupNodeData = {
        label: getT(get().language).defaults.group,
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
        borderWidth: 2,
        textColor: '#ffffff',
        fontSize: 13,
      };
      set((state) => {
        state.nodes.push({
          id, type: 'groupNode', position,
          data: groupData as unknown as MindMapNodeData,
          style: { width: 320, height: 220 },
          zIndex: -1,
        } as MindNode);
        state.isDirty = true;
      });
      get().pushHistory();
      return id;
    },

    addFreeText: (position = { x: 100, y: 100 }) => {
      const id = uuidv4();
      const textData: FreeTextNodeData = {
        text: getT(get().language).defaults.freeText,
        fontSize: 14,
        textColor: '#1e293b',
        backgroundColor: '#fffbeb',
        borderColor: '#fbbf24',
        borderWidth: 1,
        fontWeight: 'normal',
        fontStyle: 'normal',
      };
      set((state) => {
        state.nodes.push({
          id, type: 'freeTextNode', position,
          data: textData as unknown as MindMapNodeData,
          style: { width: 180, height: 80 },
        } as MindNode);
        state.isDirty = true;
      });
      get().pushHistory();
      return id;
    },

    addFreeShape: (shapeType, position = { x: 100, y: 100 }) => {
      const id = uuidv4();
      const shapeData: FreeShapeNodeData = {
        shapeType,
        backgroundColor: '#e0f2fe',
        borderColor: '#0284c7',
        borderWidth: 2,
        label: '',
        textColor: '#0c4a6e',
        fontSize: 13,
      };
      set((state) => {
        state.nodes.push({
          id, type: 'freeShapeNode', position,
          data: shapeData as unknown as MindMapNodeData,
          style: { width: 120, height: 80 },
        } as MindNode);
        state.isDirty = true;
      });
      get().pushHistory();
      return id;
    },

    detachFromParent: (nodeId) => {
      set((state) => {
        state.edges = state.edges.filter((e) => e.target !== nodeId);
        state.isDirty = true;
      });
      get().pushHistory();
    },

    copyNode: (nodeId, withSubtree) => {
      const { nodes, edges, defaultEdgeData } = get();
      const idMap = new Map<string, string>();

      const collectIds = (id: string) => {
        idMap.set(id, uuidv4());
        if (withSubtree) {
          edges.filter((e) => e.source === id).forEach((e) => collectIds(e.target));
        }
      };
      collectIds(nodeId);

      const newNodes: MindNode[] = [];
      const newEdges: MindEdge[] = [];

      idMap.forEach((newId, oldId) => {
        const original = nodes.find((n) => n.id === oldId);
        if (!original) return;
        newNodes.push({
          ...original,
          id: newId,
          position: oldId === nodeId
            ? { x: original.position.x + 40, y: original.position.y + 40 }
            : { ...original.position },
          data: { ...original.data, isRoot: false },
          selected: false,
        } as MindNode);
      });

      // Internal edges within copied subtree
      if (withSubtree) {
        edges.forEach((e) => {
          const ns = idMap.get(e.source);
          const nt = idMap.get(e.target);
          if (ns && nt) newEdges.push(createEdge(ns, nt, e.data ?? defaultEdgeData));
        });
      }

      // Connect copy to same parent as original
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (parentEdge) {
        newEdges.push(createEdge(parentEdge.source, idMap.get(nodeId)!, parentEdge.data ?? defaultEdgeData));
      }

      set((state) => {
        state.nodes.push(...newNodes);
        state.edges.push(...newEdges);
        state.isDirty = true;
      });
      get().pushHistory();
      return idMap.get(nodeId) ?? null;
    },

    autoLayout: (direction) => {
      const { nodes, edges } = get();
      const laid = computeLayout(nodes, edges, direction);
      set((state) => {
        state.nodes = laid as MindNode[];
        state.isDirty = true;
      });
      get().pushHistory();
    },
  }))
);
