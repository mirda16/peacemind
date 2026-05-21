import { MindMapNodeData, EdgeType } from './mindmap';

export interface MapStylePreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  rootNode: Partial<MindMapNodeData>;
  childNode: Partial<MindMapNodeData>;
  edge: {
    edgeType: EdgeType;
    color: string;
    width: number;
    animated: boolean;
    variableWidth: boolean;
    tapered: boolean;
  };
  // Colors per depth level (depth 0 = root, 1 = first children, 2 = ...)
  levelColors: string[] | null;
  // Level-specific edge colors (null = use single edge.color)
  levelEdgeColors: string[] | null;
}

export const MAP_STYLE_PRESETS: MapStylePreset[] = [
  {
    id: 'klasicky',
    name: 'Klasický',
    icon: '🔷',
    description: 'Zaoblené uzly, plynulé čáry',
    rootNode: {
      shape: 'rounded',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      borderColor: '#4f46e5',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    childNode: {
      shape: 'rounded',
      backgroundColor: '#f1f5f9',
      textColor: '#1e293b',
      borderColor: '#cbd5e1',
      borderWidth: 2,
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    edge: { edgeType: 'bezier', color: '#94a3b8', width: 2, animated: false, variableWidth: false, tapered: false },
    levelColors: null,
    levelEdgeColors: null,
  },

  {
    id: 'organicky',
    name: 'Organický',
    icon: '🌿',
    description: 'Větve silnější u kořene, tenčí u listů',
    rootNode: {
      shape: 'rounded',
      backgroundColor: '#14532d',
      textColor: '#dcfce7',
      borderColor: '#166534',
      borderWidth: 2,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    childNode: {
      shape: 'rounded',
      backgroundColor: '#f0fdf4',
      textColor: '#14532d',
      borderColor: '#86efac',
      borderWidth: 2,
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    edge: { edgeType: 'bezier', color: '#4ade80', width: 5, animated: false, variableWidth: true, tapered: true },
    levelColors: ['#14532d', '#16a34a', '#4ade80', '#86efac', '#bbf7d0'],
    levelEdgeColors: ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'],
  },

  {
    id: 'profesionalni',
    name: 'Profesionální',
    icon: '📐',
    description: 'Hranaté uzly, pravoúhlé čáry',
    rootNode: {
      shape: 'rectangle',
      backgroundColor: '#1e3a5f',
      textColor: '#e0f2fe',
      borderColor: '#1e40af',
      borderWidth: 2,
      fontSize: 15,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    childNode: {
      shape: 'rectangle',
      backgroundColor: '#f8fafc',
      textColor: '#1e293b',
      borderColor: '#94a3b8',
      borderWidth: 1,
      fontSize: 13,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    edge: { edgeType: 'step', color: '#64748b', width: 1.5, animated: false, variableWidth: false, tapered: false },
    levelColors: ['#1e3a5f', '#1e40af', '#3b82f6', '#93c5fd', '#dbeafe'],
    levelEdgeColors: null,
  },

  {
    id: 'bublinovy',
    name: 'Bublinový',
    icon: '🫧',
    description: 'Elipsy, duhové barvy dle větve',
    rootNode: {
      shape: 'ellipse',
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      borderColor: '#6d28d9',
      borderWidth: 3,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    childNode: {
      shape: 'ellipse',
      backgroundColor: '#faf5ff',
      textColor: '#4c1d95',
      borderColor: '#c4b5fd',
      borderWidth: 2,
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    edge: { edgeType: 'bezier', color: '#a78bfa', width: 4, animated: false, variableWidth: false, tapered: false },
    levelColors: ['#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'],
    levelEdgeColors: ['#a78bfa', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#22d3ee'],
  },

  {
    id: 'minimalista',
    name: 'Minimalistický',
    icon: '◽',
    description: 'Čisté linie, bez rámečků, pastelové',
    rootNode: {
      shape: 'rounded',
      backgroundColor: '#334155',
      textColor: '#f8fafc',
      borderColor: 'transparent',
      borderWidth: 0,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    childNode: {
      shape: 'rounded',
      backgroundColor: 'transparent',
      textColor: '#475569',
      borderColor: 'transparent',
      borderWidth: 0,
      fontSize: 14,
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    edge: { edgeType: 'smoothstep', color: '#cbd5e1', width: 1.5, animated: false, variableWidth: false, tapered: false },
    levelColors: null,
    levelEdgeColors: null,
  },
];
