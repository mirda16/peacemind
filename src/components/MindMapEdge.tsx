import { memo } from 'react';
import {
  EdgeProps,
  getBezierPath,
  getSmoothStepPath,
  getStraightPath,
  Position,
} from '@xyflow/react';
import { useMindMapStore } from '../store/useMindMapStore';
import { MindMapEdgeData } from '../types/mindmap';

const DEFAULT_W = 160;
const DEFAULT_H = 48;

// ---------- geometry helpers ----------

function getNodeDepth(nodeId: string, edges: { source: string; target: string }[]): number {
  let depth = 0;
  let current = nodeId;
  for (let i = 0; i < 30; i++) {
    const parent = edges.find((e) => e.target === current);
    if (!parent) break;
    current = parent.source;
    depth++;
  }
  return depth;
}

interface BorderPt { x: number; y: number; pos: Position }

function getBorderPoint(
  cx: number, cy: number, hw: number, hh: number,
  dx: number, dy: number
): BorderPt {
  const eps = 1e-6;
  let t = Infinity;
  if (Math.abs(dx) > eps) t = Math.min(t, hw / Math.abs(dx));
  if (Math.abs(dy) > eps) t = Math.min(t, hh / Math.abs(dy));
  const bx = cx + dx * t;
  const by = cy + dy * t;
  const pos: Position =
    Math.abs(dx) * hh > Math.abs(dy) * hw
      ? dx > 0 ? Position.Right : Position.Left
      : dy > 0 ? Position.Bottom : Position.Top;
  return { x: bx, y: by, pos };
}

// Border point for ellipse: solves (x/hw)^2 + (y/hh)^2 = 1 along direction (dx,dy)
function getEllipseBorderPoint(
  cx: number, cy: number, hw: number, hh: number,
  dx: number, dy: number
): BorderPt {
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ndx = dx / len;
  const ndy = dy / len;
  const denom = Math.sqrt((ndx / hw) ** 2 + (ndy / hh) ** 2) || 1e-6;
  const t = 1 / denom;
  const bx = cx + ndx * t;
  const by = cy + ndy * t;
  const pos: Position =
    Math.abs(dx) * hh > Math.abs(dy) * hw
      ? dx > 0 ? Position.Right : Position.Left
      : dy > 0 ? Position.Bottom : Position.Top;
  return { x: bx, y: by, pos };
}

interface SmartPts {
  sx: number; sy: number; srcPos: Position;
  tx: number; ty: number; tgtPos: Position;
}

type NodeForEdge = {
  id: string;
  position: { x: number; y: number };
  measured?: { width?: number; height?: number };
  parentId?: string;
  data?: { shape?: string };
};

function getAbsolutePos(nodeId: string, nodes: NodeForEdge[]): { x: number; y: number } {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return { x: 0, y: 0 };
  if (!node.parentId) return node.position;
  const parentAbs = getAbsolutePos(node.parentId, nodes);
  return { x: parentAbs.x + node.position.x, y: parentAbs.y + node.position.y };
}

function getSmartPoints(
  sourceId: string, targetId: string,
  fallbackSX: number, fallbackSY: number,
  fallbackTX: number, fallbackTY: number,
  nodes: NodeForEdge[]
): SmartPts {
  const sNode = nodes.find((n) => n.id === sourceId);
  const tNode = nodes.find((n) => n.id === targetId);

  if (!sNode || !tNode) {
    return { sx: fallbackSX, sy: fallbackSY, srcPos: Position.Right, tx: fallbackTX, ty: fallbackTY, tgtPos: Position.Left };
  }

  const sw = sNode.measured?.width ?? 120;
  const sh = sNode.measured?.height ?? 40;
  const tw = tNode.measured?.width ?? 120;
  const th = tNode.measured?.height ?? 40;

  const sAbsPos = getAbsolutePos(sourceId, nodes);
  const scx = sAbsPos.x + sw / 2;
  const scy = sAbsPos.y + sh / 2;
  const tAbsPos = getAbsolutePos(targetId, nodes);
  const tcx = tAbsPos.x + tw / 2;
  const tcy = tAbsPos.y + th / 2;

  const dx = tcx - scx;
  const dy = tcy - scy;

  const sShape = sNode.data?.shape;
  const tShape = tNode.data?.shape;
  const borderFn = (isEllipse: boolean) => isEllipse ? getEllipseBorderPoint : getBorderPoint;

  const sp = borderFn(sShape === 'ellipse')(scx, scy, sw / 2, sh / 2, dx, dy);
  const tp = borderFn(tShape === 'ellipse')(tcx, tcy, tw / 2, th / 2, -dx, -dy);

  // Inset both endpoints slightly inside their node so the edge hides under the node body
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const INSET = 10;
  const ndx = dx / dist;
  const ndy = dy / dist;

  return {
    sx: sp.x - ndx * INSET,
    sy: sp.y - ndy * INSET,
    srcPos: sp.pos,
    tx: tp.x + ndx * INSET,
    ty: tp.y + ndy * INSET,
    tgtPos: tp.pos,
  };
}

// ---------- bus / tree path ----------
// All edges from the same parent share a vertical "bus" at busOffset px from source.
// Creates the XMind-style branching look: H → V → H with rounded corners.
// Collision detection: iteratively pushes busX past any node bounding boxes that
// intersect the vertical segment, so edges never pass through unrelated nodes.

function getTreePath(
  sx: number, sy: number, tx: number, ty: number,
  sourceId: string, targetId: string,
  allNodes: NodeForEdge[],
): string {
  const r = 6;
  const PAD = 6; // padding around node bounding boxes

  if (Math.abs(ty - sy) < r * 2) {
    return `M ${sx} ${sy} H ${tx}`;
  }

  const hd = tx >= sx ? 1 : -1;
  const vd = ty > sy ? 1 : -1;
  const yMin = Math.min(sy, ty);
  const yMax = Math.max(sy, ty);

  let busX = sx + hd * 24;

  // Push busX past every node whose bounding box intersects the vertical segment.
  // Repeat until no more collisions (handles cascading — one node hidden behind another).
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of allNodes) {
      if (node.id === sourceId || node.id === targetId) continue;
      const pos = getAbsolutePos(node.id, allNodes);
      const nw = (node.measured?.width ?? 120) + PAD * 2;
      const nh = (node.measured?.height ?? 40) + PAD * 2;
      const nxMin = pos.x - PAD;
      const nxMax = pos.x + nw - PAD;
      const nyMin = pos.y - PAD;
      const nyMax = pos.y + nh - PAD;

      if (busX > nxMin && busX < nxMax && yMax > nyMin && yMin < nyMax) {
        const next = hd > 0 ? nxMax : nxMin;
        if ((hd > 0 && next > busX) || (hd < 0 && next < busX)) {
          busX = next;
          changed = true;
        }
      }
    }
  }

  // Never let bus go past the target node
  if (hd > 0) busX = Math.min(busX, tx - r * 2);
  else         busX = Math.max(busX, tx + r * 2);

  const rc = Math.min(r, Math.abs(ty - sy) / 2, Math.abs(busX - sx) / 2);

  return [
    `M ${sx} ${sy}`,
    `H ${busX - hd * rc}`,
    `Q ${busX} ${sy} ${busX} ${sy + vd * rc}`,
    `V ${ty - vd * rc}`,
    `Q ${busX} ${ty} ${busX + hd * rc} ${ty}`,
    `H ${tx}`,
  ].join(' ');
}

// ---------- tapered bezier (filled polygon) ----------

function cubicBezier(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

function cubicBezierDeriv(t: number, p0: number, p1: number, p2: number, p3: number) {
  const mt = 1 - t;
  return 3 * mt * mt * (p1 - p0) + 6 * mt * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

function getTaperedBezierPath(
  sx: number, sy: number,
  tx: number, ty: number,
  startW: number, endW: number,
  curvature = 0.5
): string {
  const cx1 = sx + (tx - sx) * curvature;
  const cy1 = sy;
  const cx2 = tx - (tx - sx) * curvature;
  const cy2 = ty;

  const N = 24;
  const top: [number, number][] = [];
  const bot: [number, number][] = [];

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const bx = cubicBezier(t, sx, cx1, cx2, tx);
    const by = cubicBezier(t, sy, cy1, cy2, ty);
    const dbx = cubicBezierDeriv(t, sx, cx1, cx2, tx);
    const dby = cubicBezierDeriv(t, sy, cy1, cy2, ty);
    const len = Math.sqrt(dbx * dbx + dby * dby) || 1;
    const nx = -dby / len;
    const ny = dbx / len;
    const hw = (startW + (endW - startW) * t) / 2;
    top.push([bx + nx * hw, by + ny * hw]);
    bot.push([bx - nx * hw, by - ny * hw]);
  }

  const pts = [...top, ...[...bot].reverse()];
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ') + ' Z';
}

// ---------- component ----------

function MindMapEdge({
  id, source, target,
  sourceX, sourceY, targetX, targetY,
  data, markerEnd, selected,
}: Omit<EdgeProps, 'sourcePosition' | 'targetPosition'> & { selected?: boolean }) {
  const d = data as MindMapEdgeData | undefined;
  const edgeType = d?.edgeType ?? 'bezier';
  const color = d?.color ?? '#94a3b8';
  const baseWidth = d?.width ?? 2;
  const animated = d?.animated ?? false;
  const variableWidth = d?.variableWidth ?? false;
  const tapered = d?.tapered ?? false;

  const edges = useMindMapStore((s) => s.edges);
  const nodes = useMindMapStore((s) => s.nodes);

  const depth = getNodeDepth(target, edges);
  const strokeWidth = variableWidth ? Math.max(0.8, baseWidth - depth * 0.8) : baseWidth;

  const { sx, sy: rawSY, srcPos, tx, ty, tgtPos } = getSmartPoints(
    source, target, sourceX, sourceY, targetX, targetY, nodes
  );

  // For bus edges: spread exit Y positions evenly across the source node height
  // so sibling edges don't all leave from the same point.
  let sy = rawSY;
  if (edgeType === 'bus') {
    const siblings = edges.filter((e) => e.source === source);
    if (siblings.length > 1) {
      const sNode = nodes.find((n) => n.id === source);
      const sPos = getAbsolutePos(source, nodes);
      const sh = sNode?.measured?.height ?? DEFAULT_H;
      const sw = sNode?.measured?.width ?? DEFAULT_W;

      // Sort siblings by target center Y so index matches visual top→bottom order
      const sorted = siblings
        .map((sib) => {
          const tNode = nodes.find((n) => n.id === sib.target);
          const tPos = getAbsolutePos(sib.target, nodes);
          return { edgeId: sib.id, cy: tPos.y + (tNode?.measured?.height ?? DEFAULT_H) / 2 };
        })
        .sort((a, b) => a.cy - b.cy);

      const myIdx = sorted.findIndex((s) => s.edgeId === id);
      if (myIdx >= 0) {
        const spread = sw / 2; // spread = half the node width
        const offset = siblings.length > 1
          ? (myIdx / (siblings.length - 1) - 0.5) * spread
          : 0;
        sy = sPos.y + sh / 2 + offset;
      }
    }
  }

  // Tapered organic mode
  if (tapered && edgeType === 'bezier') {
    const endW = Math.max(0.5, strokeWidth * 0.3);
    const curvature = Math.abs(sx - tx) < 40 ? 0.1 : 0.45;
    const pathD = getTaperedBezierPath(sx, sy, tx, ty, strokeWidth, endW, curvature);
    return (
      <g>
        <path
          id={id}
          d={pathD}
          fill={color}
          opacity={selected ? 1 : 0.85}
          stroke={selected ? 'var(--pm-accent)' : 'none'}
          strokeWidth={selected ? 1 : 0}
        />
      </g>
    );
  }

  // Standard stroke paths
  const pathProps = { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, sourcePosition: srcPos, targetPosition: tgtPos };
  let pathD = '';

  if (edgeType === 'bus') {
    pathD = getTreePath(sx, sy, tx, ty, source, target, nodes);
  } else if (edgeType === 'straight') {
    [pathD] = getStraightPath(pathProps);
  } else if (edgeType === 'step') {
    [pathD] = getSmoothStepPath({ ...pathProps, borderRadius: 0 });
  } else if (edgeType === 'smoothstep') {
    [pathD] = getSmoothStepPath({ ...pathProps, borderRadius: 10 });
  } else {
    [pathD] = getBezierPath(pathProps);
  }

  const dashArray = animated ? '6 4' : undefined;

  return (
    <g>
      {/* Wide transparent hit target */}
      <path d={pathD} stroke="transparent" strokeWidth={Math.max(strokeWidth + 12, 20)} fill="none" />
      {/* Selection glow */}
      {selected && (
        <path d={pathD} stroke="var(--pm-accent)" strokeWidth={strokeWidth + 3} fill="none" strokeLinecap="round" opacity={0.4} />
      )}
      {/* Main visible edge */}
      <path
        id={id}
        d={pathD}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={dashArray}
        markerEnd={markerEnd}
      />
    </g>
  );
}

export default memo(MindMapEdge);
