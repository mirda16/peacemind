import dagre from '@dagrejs/dagre';
import { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'RL' | 'TB' | 'BT' | 'radial';

const DEFAULT_W = 160;
const DEFAULT_H = 48;
const RING_RADIUS = 220;

export function computeLayout(nodes: Node[], edges: Edge[], direction: LayoutDirection): Node[] {
  if (nodes.length === 0) return nodes;
  if (direction === 'radial') return computeRadialLayout(nodes, edges);
  return computeDagreLayout(nodes, edges, direction);
}

function nodeSize(node: Node): { w: number; h: number } {
  return {
    w: node.measured?.width ?? DEFAULT_W,
    h: node.measured?.height ?? DEFAULT_H,
  };
}

function computeDagreLayout(nodes: Node[], edges: Edge[], rankdir: 'LR' | 'RL' | 'TB' | 'BT'): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir, nodesep: 40, ranksep: 80, marginx: 40, marginy: 40 });

  nodes.forEach((node) => {
    const { w, h } = nodeSize(node);
    g.setNode(node.id, { width: w, height: h });
  });

  edges.forEach((edge) => {
    if (g.hasNode(edge.source) && g.hasNode(edge.target)) {
      g.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(g);

  // Dagre may reorder siblings within a rank. Restore creation order:
  // collect children per parent (in edge-array order = creation order),
  // then redistribute the dagre-assigned axis values in that same order.
  const axis = (rankdir === 'LR' || rankdir === 'RL') ? 'y' : 'x';
  const childrenByParent = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!childrenByParent.has(edge.source)) childrenByParent.set(edge.source, []);
    childrenByParent.get(edge.source)!.push(edge.target);
  });
  childrenByParent.forEach((children) => {
    if (children.length < 2) return;
    const values = children.map((id) => g.node(id)?.[axis] ?? 0);
    const sorted = [...values].sort((a, b) => a - b);
    children.forEach((id, i) => {
      const n = g.node(id);
      if (n) n[axis] = sorted[i];
    });
  });

  return nodes.map((node) => {
    const n = g.node(node.id);
    if (!n) return node;
    const { w, h } = nodeSize(node);
    return { ...node, position: { x: n.x - w / 2, y: n.y - h / 2 } };
  });
}

function computeRadialLayout(nodes: Node[], edges: Edge[]): Node[] {
  const targets = new Set(edges.map((e) => e.target));
  const root = nodes.find((n) => !targets.has(n.id)) ?? nodes[0];

  const children: Record<string, string[]> = {};
  nodes.forEach((n) => { children[n.id] = []; });
  edges.forEach((e) => { children[e.source]?.push(e.target); });

  const positions: Record<string, { x: number; y: number }> = {};
  positions[root.id] = { x: 0, y: 0 };

  // outwardAngle: direction from parent toward this node (null = root)
  function place(id: string, outwardAngle: number | null) {
    const kids = children[id] ?? [];
    if (kids.length === 0) return;

    const parentPos = positions[id];
    const isRoot = outwardAngle === null;

    const CHILD_ARC = (130 * Math.PI) / 180;

    const radius = isRoot ? RING_RADIUS : 200;

    kids.forEach((kid, i) => {
      let angle: number;
      if (isRoot) {
        // Evenly around full circle, starting from top
        angle = -Math.PI / 2 + (i / kids.length) * 2 * Math.PI;
      } else if (kids.length === 1) {
        // Single child goes straight outward
        angle = outwardAngle!;
      } else {
        // Spread evenly across 130° centered on outward direction
        angle = (outwardAngle! - CHILD_ARC / 2) + (i / (kids.length - 1)) * CHILD_ARC;
      }

      positions[kid] = {
        x: parentPos.x + Math.cos(angle) * radius,
        y: parentPos.y + Math.sin(angle) * radius,
      };

      place(kid, angle);
    });
  }

  place(root.id, null);

  return nodes.map((node) => {
    const pos = positions[node.id];
    if (!pos) return node;
    const { w, h } = nodeSize(node);
    return { ...node, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}
