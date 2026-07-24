import { Node, Edge } from '@xyflow/react';

export type LayoutDirection = 'LR' | 'RL' | 'TB' | 'BT' | 'radial';

const DEFAULT_W = 160;
const DEFAULT_H = 48;

export function computeLayout(nodes: Node[], edges: Edge[], direction: LayoutDirection): Node[] {
  if (nodes.length === 0) return nodes;
  if (direction === 'radial') return computeRadialLayout(nodes, edges);
  return computeTreeLayout(nodes, edges, direction);
}

function nodeSize(node: Node): { w: number; h: number } {
  return {
    w: node.measured?.width ?? DEFAULT_W,
    h: node.measured?.height ?? DEFAULT_H,
  };
}

// Gap between sibling subtree blocks along the cross axis (perpendicular to layout direction).
const CROSS_GAP = 40;
// Gap between depth ranks along the primary axis (direction of layout flow).
const RANK_GAP = 80;

// A mind map is a tree (single parent per node), so — unlike a general DAG layout —
// we can position it with a plain recursive "tidy tree" pass: each node's subtree gets
// a contiguous, non-overlapping block along the cross axis, laid out in creation order.
// This guarantees zero tree-edge crossings and that one parent's children never end up
// interleaved with another parent's, which a generic crossing-minimizer (e.g. dagre) does
// not guarantee — it may reorder siblings across parents to reduce crossings elsewhere.
function computeTreeLayout(nodes: Node[], edges: Edge[], rankdir: 'LR' | 'RL' | 'TB' | 'BT'): Node[] {
  const targets = new Set(edges.map((e) => e.target));
  const root = nodes.find((n) => !targets.has(n.id)) ?? nodes[0];

  const children: Record<string, string[]> = {};
  nodes.forEach((n) => { children[n.id] = []; });
  edges.forEach((e) => { children[e.source]?.push(e.target); });

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const horizontal = rankdir === 'LR' || rankdir === 'RL';
  const crossSize = (n: Node) => { const { w, h } = nodeSize(n); return horizontal ? h : w; };
  const primarySize = (n: Node) => { const { w, h } = nodeSize(n); return horizontal ? w : h; };

  // Depth (rank) per node via BFS from root; nodes unreachable from root stay undefined.
  const depth: Record<string, number> = { [root.id]: 0 };
  const bfsOrder: string[] = [root.id];
  for (let i = 0; i < bfsOrder.length; i++) {
    const id = bfsOrder[i];
    (children[id] ?? []).forEach((c) => {
      if (depth[c] === undefined) { depth[c] = depth[id] + 1; bfsOrder.push(c); }
    });
  }

  // Pass 1 (post-order): cross-axis extent each subtree needs, so sibling subtrees
  // never overlap regardless of how differently sized their nodes are.
  const extent: Record<string, number> = {};
  function computeExtent(id: string): number {
    const node = nodeById.get(id);
    const own = node ? crossSize(node) : 0;
    const kids = children[id] ?? [];
    if (kids.length === 0) return (extent[id] = own);
    const kidsTotal = kids.reduce((sum, k) => sum + computeExtent(k), 0) + CROSS_GAP * (kids.length - 1);
    return (extent[id] = Math.max(own, kidsTotal));
  }
  computeExtent(root.id);

  // Pass 2 (pre-order): place each subtree's block along the cross axis in creation
  // order — a parent's children are always contiguous, never interleaved with another
  // parent's, and the parent itself is centered over its children's block.
  const crossCenter: Record<string, number> = {};
  function place(id: string, start: number) {
    const kids = children[id] ?? [];
    crossCenter[id] = start + extent[id] / 2;
    if (kids.length === 0) return;
    const kidsTotal = kids.reduce((sum, k) => sum + extent[k], 0) + CROSS_GAP * (kids.length - 1);
    let cursor = start + (extent[id] - kidsTotal) / 2;
    kids.forEach((k) => {
      place(k, cursor);
      cursor += extent[k] + CROSS_GAP;
    });
  }
  place(root.id, 0);

  // Primary axis: rank centerline per depth, from cumulative max node size per rank + gap.
  const maxDepth = Math.max(0, ...Object.values(depth));
  const rankSize: number[] = [];
  for (let d = 0; d <= maxDepth; d++) {
    rankSize[d] = Math.max(0, ...nodes.filter((n) => depth[n.id] === d).map((n) => primarySize(n)));
  }
  const rankCenter: number[] = [];
  let cursor = 0;
  for (let d = 0; d <= maxDepth; d++) {
    rankCenter[d] = cursor + rankSize[d] / 2;
    cursor += rankSize[d] + RANK_GAP;
  }

  // RL/BT flow the opposite way along the primary axis — root stays near 0, deeper
  // ranks go negative (left for RL, up for BT) instead of positive.
  const negate = rankdir === 'RL' || rankdir === 'BT';

  return nodes.map((node) => {
    const d = depth[node.id];
    if (d === undefined) return node; // not reachable from root — leave its position untouched
    const { w, h } = nodeSize(node);
    const cross = crossCenter[node.id];
    const primary = negate ? -rankCenter[d] : rankCenter[d];

    return horizontal
      ? { ...node, position: { x: primary - w / 2, y: cross - h / 2 } }
      : { ...node, position: { x: cross - w / 2, y: primary - h / 2 } };
  });
}

// Radial gap between adjacent rings (depth levels), added on top of the nodes' own bounding radii.
const RADIAL_GAP = 60;
// Minimum tangential gap between neighboring nodes' bounding circles on the same ring.
const TANGENTIAL_GAP = 30;

function computeRadialLayout(nodes: Node[], edges: Edge[]): Node[] {
  const targets = new Set(edges.map((e) => e.target));
  const root = nodes.find((n) => !targets.has(n.id)) ?? nodes[0];

  const children: Record<string, string[]> = {};
  nodes.forEach((n) => { children[n.id] = []; });
  edges.forEach((e) => { children[e.source]?.push(e.target); });

  // Bounding-circle radius per node — used for both radial (ring-to-ring) and
  // tangential (sibling-to-sibling) clearance, independent of the exit angle.
  const boundingRadius: Record<string, number> = {};
  nodes.forEach((n) => {
    const { w, h } = nodeSize(n);
    boundingRadius[n.id] = Math.sqrt((w / 2) ** 2 + (h / 2) ** 2);
  });

  // Weight = number of leaves in the subtree. Each node's angular slice is split
  // among its children in proportion to weight, so a branch with many descendants
  // gets more of the circle and sibling subtrees never run into each other.
  const weight: Record<string, number> = {};
  function computeWeight(id: string): number {
    const kids = children[id] ?? [];
    const w = kids.length === 0 ? 1 : kids.reduce((sum, k) => sum + computeWeight(k), 0);
    weight[id] = w;
    return w;
  }
  computeWeight(root.id);

  const angleOf: Record<string, number> = { [root.id]: 0 };
  const angleSpan: Record<string, number> = { [root.id]: 2 * Math.PI };
  const depth: Record<string, number> = { [root.id]: 0 };

  function assignAngles(id: string, rangeStart: number, rangeEnd: number) {
    const kids = children[id] ?? [];
    if (kids.length === 0) return;
    const total = weight[id];
    let cursor = rangeStart;
    kids.forEach((kidId) => {
      const span = ((rangeEnd - rangeStart) * weight[kidId]) / total;
      const kidStart = cursor;
      const kidEnd = cursor + span;
      angleOf[kidId] = (kidStart + kidEnd) / 2;
      angleSpan[kidId] = span;
      depth[kidId] = depth[id] + 1;
      cursor = kidEnd;
      assignAngles(kidId, kidStart, kidEnd);
    });
  }
  assignAngles(root.id, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI);

  // Ring radius per depth: large enough to clear the previous ring's nodes, and
  // large enough that every node's angular slice can fit its bounding circle plus gap.
  const maxDepth = Math.max(0, ...Object.values(depth));
  const ringRadius: number[] = [0];
  for (let d = 1; d <= maxDepth; d++) {
    const nodesAtDepth = nodes.filter((n) => depth[n.id] === d);
    const prevMaxBounding = Math.max(0, ...nodes.filter((n) => depth[n.id] === d - 1).map((n) => boundingRadius[n.id]));
    const ownMaxBounding = Math.max(0, ...nodesAtDepth.map((n) => boundingRadius[n.id]));

    let r = ringRadius[d - 1] + prevMaxBounding + ownMaxBounding + RADIAL_GAP;

    nodesAtDepth.forEach((n) => {
      const span = angleSpan[n.id];
      if (span > 0) {
        const needed = (2 * boundingRadius[n.id] + TANGENTIAL_GAP) / span;
        if (needed > r) r = needed;
      }
    });

    ringRadius[d] = r;
  }

  const positions: Record<string, { x: number; y: number }> = { [root.id]: { x: 0, y: 0 } };
  nodes.forEach((n) => {
    if (n.id === root.id) return;
    const d = depth[n.id];
    if (d === undefined) return; // not reachable from root — leave its position untouched
    const r = ringRadius[d];
    const a = angleOf[n.id];
    positions[n.id] = { x: Math.cos(a) * r, y: Math.sin(a) * r };
  });

  return nodes.map((node) => {
    const pos = positions[node.id];
    if (!pos) return node;
    const { w, h } = nodeSize(node);
    return { ...node, position: { x: pos.x - w / 2, y: pos.y - h / 2 } };
  });
}
