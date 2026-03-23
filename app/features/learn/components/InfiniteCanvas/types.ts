// ─── InfiniteCanvas Types ────────────────────────────────────

export interface CanvasNode {
  id: string;
  type: 'topic' | 'chapter' | 'document' | 'ai-response' | 'note' | 'synthesis';
  title: string;
  content?: string;
  summary?: string;
  docType?: 'text' | 'video';
  docId?: string;
  nodeId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  color?: string;
  synthSourceIds?: string[];
}

export interface CanvasEdge {
  from: string;
  to: string;
}

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
