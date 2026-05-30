import type { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { MindMapNodeData, MindMapEdgeData, DEFAULT_NODE_DATA, DEFAULT_ROOT_DATA, DEFAULT_EDGE_DATA } from './mindmap';

type MindNode = Node<MindMapNodeData>;
type MindEdge = Edge<MindMapEdgeData>;

function n(label: string, x: number, y: number, isRoot = false, colorOverrides?: Partial<MindMapNodeData>): MindNode {
  return {
    id: uuidv4(),
    type: 'mindMapNode',
    position: { x, y },
    data: {
      ...(isRoot ? DEFAULT_ROOT_DATA : DEFAULT_NODE_DATA),
      label,
      ...colorOverrides,
    } as MindMapNodeData,
  };
}

function e(source: string, target: string): MindEdge {
  return {
    id: uuidv4(),
    source,
    target,
    type: 'mindMapEdge',
    data: { ...DEFAULT_EDGE_DATA } as MindMapEdgeData,
    style: {},
    animated: false,
  };
}

export interface MapTemplate {
  id: string;
  icon: string;
  nameCs: string;
  nameEn: string;
  descCs: string;
  descEn: string;
  generate: () => { nodes: MindNode[]; edges: MindEdge[]; title: string };
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'brainstorming',
    icon: '🧠',
    nameCs: 'Brainstorming',
    nameEn: 'Brainstorming',
    descCs: 'Centrální téma s 6 prázdnými větvemi',
    descEn: 'Central topic with 6 empty branches',
    generate: () => {
      const root = n('Téma', 0, 0, true);
      const angles = [-90, -30, 30, 90, 150, 210];
      const children = angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return n('', Math.round(Math.cos(rad) * 240), Math.round(Math.sin(rad) * 220));
      });
      return {
        nodes: [root, ...children],
        edges: children.map((c) => e(root.id, c.id)),
        title: 'Brainstorming',
      };
    },
  },

  {
    id: 'swot',
    icon: '📊',
    nameCs: 'SWOT analýza',
    nameEn: 'SWOT Analysis',
    descCs: 'Silné stránky, Slabiny, Příležitosti, Hrozby',
    descEn: 'Strengths, Weaknesses, Opportunities, Threats',
    generate: () => {
      const root = n('SWOT', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: '💪 Silné stránky', x: 280, y: -160, color: '#16a34a' },
        { label: '⚠️ Slabiny',       x: 280, y:  160, color: '#dc2626' },
        { label: '🚀 Příležitosti',  x:-280, y: -160, color: '#2563eb' },
        { label: '🛡️ Hrozby',       x:-280, y:  160, color: '#d97706' },
      ];

      branches.forEach(({ label, x, y, color }) => {
        const branch = n(label, x, y, false, { backgroundColor: color, textColor: '#ffffff', borderColor: color });
        nodes.push(branch);
        edges.push(e(root.id, branch.id));
        for (let i = 0; i < 3; i++) {
          const sub = n('', x > 0 ? x + 260 : x - 260, y + (i - 1) * 70);
          nodes.push(sub);
          edges.push(e(branch.id, sub.id));
        }
      });

      return { nodes, edges, title: 'SWOT Analýza' };
    },
  },

  {
    id: 'projekt',
    icon: '📋',
    nameCs: 'Plán projektu',
    nameEn: 'Project Plan',
    descCs: 'Cíl, Úkoly, Zdroje, Rizika, Harmonogram',
    descEn: 'Goal, Tasks, Resources, Risks, Timeline',
    generate: () => {
      const root = n('Projekt', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: '🎯 Cíl',          y: -200, subs: 2 },
        { label: '📋 Úkoly',        y: -100, subs: 3 },
        { label: '👥 Zdroje',       y:    0, subs: 2 },
        { label: '⚠️ Rizika',      y:  100, subs: 2 },
        { label: '📅 Harmonogram', y:  200, subs: 2 },
      ];

      branches.forEach(({ label, y, subs }) => {
        const branch = n(label, 280, y);
        nodes.push(branch);
        edges.push(e(root.id, branch.id));
        const startY = y - ((subs - 1) * 65) / 2;
        for (let i = 0; i < subs; i++) {
          const sub = n('', 560, startY + i * 65);
          nodes.push(sub);
          edges.push(e(branch.id, sub.id));
        }
      });

      return { nodes, edges, title: 'Plán projektu' };
    },
  },

  {
    id: 'meeting',
    icon: '🗓️',
    nameCs: 'Poznámky z meetingu',
    nameEn: 'Meeting Notes',
    descCs: 'Agenda, Rozhodnutí, Akční body, Další kroky',
    descEn: 'Agenda, Decisions, Action Items, Next Steps',
    generate: () => {
      const root = n('Meeting', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: '📋 Agenda',       x: -280, y: -140 },
        { label: '✅ Rozhodnutí',   x:  280, y: -140 },
        { label: '📌 Akční body',   x:  280, y:  140 },
        { label: '➡️ Další kroky', x: -280, y:  140 },
      ];

      branches.forEach(({ label, x, y }) => {
        const branch = n(label, x, y);
        nodes.push(branch);
        edges.push(e(root.id, branch.id));
        const startY = y - 65;
        for (let i = 0; i < 3; i++) {
          const sub = n('', x > 0 ? x + 260 : x - 260, startY + i * 65);
          nodes.push(sub);
          edges.push(e(branch.id, sub.id));
        }
      });

      return { nodes, edges, title: 'Meeting' };
    },
  },

  {
    id: 'tydenni',
    icon: '📅',
    nameCs: 'Týdenní review',
    nameEn: 'Weekly Review',
    descCs: 'Hotovo, Probíhá, Příští týden, Bloky',
    descEn: 'Done, In Progress, Next Week, Blockers',
    generate: () => {
      const root = n('Týden', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: '✅ Hotovo',         x: -280, y: -140, color: '#16a34a' },
        { label: '🔄 Probíhá',        x:  280, y: -140, color: '#2563eb' },
        { label: '📅 Příští týden',   x:  280, y:  140, color: '#7c3aed' },
        { label: '🚧 Bloky',          x: -280, y:  140, color: '#dc2626' },
      ];

      branches.forEach(({ label, x, y, color }) => {
        const branch = n(label, x, y, false, { backgroundColor: color, textColor: '#ffffff', borderColor: color });
        nodes.push(branch);
        edges.push(e(root.id, branch.id));
        const startY = y - 65;
        for (let i = 0; i < 3; i++) {
          const sub = n('', x > 0 ? x + 260 : x - 260, startY + i * 65);
          nodes.push(sub);
          edges.push(e(branch.id, sub.id));
        }
      });

      return { nodes, edges, title: 'Týdenní review' };
    },
  },
];
