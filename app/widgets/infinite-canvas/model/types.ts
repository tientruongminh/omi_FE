// ─── InfiniteCanvas Widget Types ────────────────────────────────────
// Entity types re-exported for convenience
export type { CanvasNode, CanvasEdge } from '@/entities/node/model/types';
export { NODE_STYLES, EDGE_COLORS } from '@/entities/node/model/types';

// Widget-specific UI state types
export interface ContextMenuState {
  x: number;
  y: number;
  canvasX?: number;
  canvasY?: number;
  nodeId?: string;
  nodeType?: string;
  hasChildren?: boolean;
  isCollapsed?: boolean;
}

export interface SelectionToolbarState {
  x: number;
  y: number;
  text: string;
  sourceNodeId: string;
}

export interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
}
