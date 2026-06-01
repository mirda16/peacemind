export type NodeShape = 'rectangle' | 'rounded' | 'ellipse' | 'circle' | 'pill';
export type EdgeType = 'smoothstep' | 'bezier' | 'straight' | 'step' | 'bus';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface MindMapNodeData {
  label: string;
  shape: NodeShape;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth: number;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  isRoot?: boolean;
  notes?: string;
  noteVisible?: boolean;
  url?: string;
  icon?: string;
  imageData?: string;
  collapsed?: boolean;
  checklist?: ChecklistItem[];
  [key: string]: unknown;
}

export interface MindMapEdgeData {
  edgeType: EdgeType;
  color: string;
  width: number;
  animated: boolean;
  variableWidth: boolean;
  tapered: boolean;
  [key: string]: unknown;
}


export interface PeaceMindFile {
  version: '1.0';
  title: string;
  nodes: import('@xyflow/react').Node<MindMapNodeData>[];
  edges: import('@xyflow/react').Edge<MindMapEdgeData>[];
  viewport: { x: number; y: number; zoom: number };
  theme: 'light' | 'dark';
  styleId?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_NODE_DATA: Omit<MindMapNodeData, 'label' | 'isRoot'> = {
  shape: 'rounded',
  backgroundColor: '#f1f5f9',
  textColor: '#1e293b',
  borderColor: '#cbd5e1',
  borderWidth: 2,
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
};

export const DEFAULT_ROOT_DATA: Omit<MindMapNodeData, 'label'> = {
  shape: 'rounded',
  backgroundColor: '#6366f1',
  textColor: '#ffffff',
  borderColor: '#4f46e5',
  borderWidth: 2,
  fontSize: 16,
  fontWeight: 'bold',
  fontStyle: 'normal',
  isRoot: true,
};

export interface GroupNodeData {
  label: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  fontSize: number;
  [key: string]: unknown;
}

export type FreeShapeType = 'rectangle' | 'rounded-rectangle' | 'ellipse';

export interface FreeShapeNodeData {
  shapeType: FreeShapeType;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  label?: string;
  textColor: string;
  fontSize: number;
  [key: string]: unknown;
}

export interface FreeTextNodeData {
  text: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  [key: string]: unknown;
}

export const DEFAULT_EDGE_DATA: MindMapEdgeData = {
  edgeType: 'smoothstep',
  color: '#94a3b8',
  width: 2,
  animated: false,
  variableWidth: false,
  tapered: false,
};
