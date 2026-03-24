'use client';

import { CanvasNode } from '../model/types';
import { EDGE_COLORS } from '../model/constants';

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

interface BezierEdgeProps {
  fromNode: CanvasNode;
  toNode: CanvasNode;
  color: string;
}

export function BezierEdge({ fromNode, toNode, color }: BezierEdgeProps) {
  const x1 = fromNode.x + fromNode.width;
  const y1 = fromNode.y + fromNode.height / 2;
  const x2 = toNode.x;
  const y2 = toNode.y + toNode.height / 2;
  return (
    <path
      d={bezierPath(x1, y1, x2, y2)}
      stroke={color}
      strokeWidth={1.8}
      fill="none"
      strokeLinecap="round"
      opacity={0.65}
    />
  );
}

interface EdgeLayerProps {
  edges: { from: string; to: string }[];
  nodes: CanvasNode[];
  isNodeHidden: (id: string) => boolean;
  width: number;
  height: number;
}

export function EdgeLayer({ edges, nodes, isNodeHidden, width, height }: EdgeLayerProps) {
  return (
    <svg
      width={width}
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      {edges.map((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        if (isNodeHidden(edge.from) || isNodeHidden(edge.to)) return null;
        const color = EDGE_COLORS[fromNode.type] ?? '#818CF8';
        return <BezierEdge key={`${edge.from}-${edge.to}`} fromNode={fromNode} toNode={toNode} color={color} />;
      })}
    </svg>
  );
}
