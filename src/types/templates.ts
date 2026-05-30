import type { Node, Edge } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { MindMapNodeData, MindMapEdgeData, DEFAULT_NODE_DATA, DEFAULT_ROOT_DATA, DEFAULT_EDGE_DATA } from './mindmap';
import type { Lang } from '../i18n/translations';

type MindNode = Node<MindMapNodeData>;
type MindEdge = Edge<MindMapEdgeData>;

function n(label: string, x: number, y: number, isRoot = false, colorOverrides?: Partial<MindMapNodeData>): MindNode {
  return {
    id: uuidv4(),
    type: 'mindMapNode',
    position: { x, y },
    data: { ...(isRoot ? DEFAULT_ROOT_DATA : DEFAULT_NODE_DATA), label, ...colorOverrides } as MindMapNodeData,
  };
}

function e(source: string, target: string): MindEdge {
  return {
    id: uuidv4(), source, target, type: 'mindMapEdge',
    data: { ...DEFAULT_EDGE_DATA } as MindMapEdgeData,
    style: {}, animated: false,
  };
}

// Calculates branch Y positions so sub-node groups never overlap.
function layoutBranches(
  root: MindNode,
  branches: { label: string; subs: number; color?: string }[],
  nodes: MindNode[],
  edges: MindEdge[],
  branchX = 280,
  subX = 560,
  subGap = 80,
  branchGap = 30,
) {
  const slotHeights = branches.map((b) => Math.max(b.subs, 1) * subGap);
  const totalH = slotHeights.reduce((a, b) => a + b, 0) + (branches.length - 1) * branchGap;
  let cumY = -totalH / 2;

  branches.forEach((b, i) => {
    const branchY = cumY + slotHeights[i] / 2;
    cumY += slotHeights[i] + branchGap;

    const overrides = b.color
      ? { backgroundColor: b.color, textColor: '#ffffff', borderColor: b.color }
      : undefined;
    const branch = n(b.label, branchX, branchY, false, overrides);
    nodes.push(branch);
    edges.push(e(root.id, branch.id));

    const startSubY = branchY - ((b.subs - 1) * subGap) / 2;
    for (let j = 0; j < b.subs; j++) {
      const sub = n('', subX, startSubY + j * subGap);
      nodes.push(sub);
      edges.push(e(branch.id, sub.id));
    }
  });
}

export interface MapTemplate {
  id: string;
  icon: string;
  nameCs: string;
  nameEn: string;
  descCs: string;
  descEn: string;
  generate: (lang: Lang) => { nodes: MindNode[]; edges: MindEdge[]; title: string };
}

export const MAP_TEMPLATES: MapTemplate[] = [
  {
    id: 'brainstorming',
    icon: '🧠',
    nameCs: 'Brainstorming',
    nameEn: 'Brainstorming',
    descCs: 'Centrální téma s 6 prázdnými větvemi',
    descEn: 'Central topic with 6 empty branches',
    generate: (lang) => {
      const rootLabel = lang === 'cs' ? 'Téma' : 'Topic';
      const root = n(rootLabel, 0, 0, true);
      const angles = [-90, -30, 30, 90, 150, 210];
      const children = angles.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return n('', Math.round(Math.cos(rad) * 240), Math.round(Math.sin(rad) * 220));
      });
      return { nodes: [root, ...children], edges: children.map((c) => e(root.id, c.id)), title: 'Brainstorming' };
    },
  },

  {
    id: 'swot',
    icon: '📊',
    nameCs: 'SWOT analýza',
    nameEn: 'SWOT Analysis',
    descCs: 'Silné stránky, Slabiny, Příležitosti, Hrozby',
    descEn: 'Strengths, Weaknesses, Opportunities, Threats',
    generate: (lang) => {
      const cs = lang === 'cs';
      const root = n('SWOT', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: cs ? '💪 Silné stránky' : '💪 Strengths',   x:  280, y: -160, color: '#16a34a' },
        { label: cs ? '⚠️ Slabiny'       : '⚠️ Weaknesses',  x:  280, y:  160, color: '#dc2626' },
        { label: cs ? '🚀 Příležitosti'  : '🚀 Opportunities',x: -280, y: -160, color: '#2563eb' },
        { label: cs ? '🛡️ Hrozby'       : '🛡️ Threats',     x: -280, y:  160, color: '#d97706' },
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

      return { nodes, edges, title: cs ? 'SWOT Analýza' : 'SWOT Analysis' };
    },
  },

  {
    id: 'projekt',
    icon: '📋',
    nameCs: 'Plán projektu',
    nameEn: 'Project Plan',
    descCs: 'Cíl, Úkoly, Zdroje, Rizika, Harmonogram',
    descEn: 'Goal, Tasks, Resources, Risks, Timeline',
    generate: (lang) => {
      const cs = lang === 'cs';
      const root = n(cs ? 'Projekt' : 'Project', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      layoutBranches(root, [
        { label: cs ? '🎯 Cíl'          : '🎯 Goal',     subs: 2 },
        { label: cs ? '📋 Úkoly'        : '📋 Tasks',    subs: 3 },
        { label: cs ? '👥 Zdroje'       : '👥 Resources',subs: 2 },
        { label: cs ? '⚠️ Rizika'      : '⚠️ Risks',    subs: 2 },
        { label: cs ? '📅 Harmonogram' : '📅 Timeline', subs: 2 },
      ], nodes, edges);

      return { nodes, edges, title: cs ? 'Plán projektu' : 'Project Plan' };
    },
  },

  {
    id: 'meeting',
    icon: '🗓️',
    nameCs: 'Poznámky z meetingu',
    nameEn: 'Meeting Notes',
    descCs: 'Agenda, Rozhodnutí, Akční body, Další kroky',
    descEn: 'Agenda, Decisions, Action Items, Next Steps',
    generate: (lang) => {
      const cs = lang === 'cs';
      const root = n('Meeting', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: '📋 Agenda',                              x: -280, y: -140 },
        { label: cs ? '✅ Rozhodnutí' : '✅ Decisions',   x:  280, y: -140 },
        { label: cs ? '📌 Akční body' : '📌 Action Items',x:  280, y:  140 },
        { label: cs ? '➡️ Další kroky': '➡️ Next Steps', x: -280, y:  140 },
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

      return { nodes, edges, title: cs ? 'Meeting' : 'Meeting Notes' };
    },
  },

  {
    id: 'tydenni',
    icon: '📅',
    nameCs: 'Týdenní review',
    nameEn: 'Weekly Review',
    descCs: 'Hotovo, Probíhá, Příští týden, Bloky',
    descEn: 'Done, In Progress, Next Week, Blockers',
    generate: (lang) => {
      const cs = lang === 'cs';
      const root = n(cs ? 'Týden' : 'Week', 0, 0, true);
      const nodes: MindNode[] = [root];
      const edges: MindEdge[] = [];

      const branches = [
        { label: cs ? '✅ Hotovo'       : '✅ Done',        x: -280, y: -140, color: '#16a34a' },
        { label: cs ? '🔄 Probíhá'      : '🔄 In Progress', x:  280, y: -140, color: '#2563eb' },
        { label: cs ? '📅 Příští týden' : '📅 Next Week',   x:  280, y:  140, color: '#7c3aed' },
        { label: cs ? '🚧 Bloky'        : '🚧 Blockers',    x: -280, y:  140, color: '#dc2626' },
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

      return { nodes, edges, title: cs ? 'Týdenní review' : 'Weekly Review' };
    },
  },
];
