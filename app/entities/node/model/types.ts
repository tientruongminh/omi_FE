export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'child';
  expanded?: boolean;
}

export interface ContentCard {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  tags: Array<{ label: string; color: 'green' | 'coral' }>;
}

export interface RoadmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface RoadmapEdge {
  id: string;
  from: string;
  to: string;
}

// Canvas node entity types
export type CanvasNodeType = 'topic' | 'chapter' | 'document' | 'ai-chat' | 'ai-review' | 'note' | 'synthesis';

export interface CanvasNode {
  id: string;
  type: CanvasNodeType;
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
  customBg?: string;
  customBorder?: string;
  synthSourceIds?: string[];
}

export interface CanvasEdge {
  from: string;
  to: string;
}

// Node visual styles — AI hỏi đáp = green, AI ôn tập = coral/red
export const NODE_STYLES: Record<CanvasNodeType, { bg: string; border: string; textColor: string }> = {
  topic:         { bg: '#E8D5F5', border: '#A855F7', textColor: '#4C1D95' },
  chapter:       { bg: '#EDFAF4', border: '#3DBE7A', textColor: '#1A4731' },
  document:      { bg: '#FFFFFF', border: '#E5DDD5', textColor: '#2D2D2D' },
  'ai-chat':     { bg: '#D1FAE5', border: '#34D399', textColor: '#065F46' },
  'ai-review':   { bg: '#FEE2E2', border: '#F87171', textColor: '#991B1B' },
  note:          { bg: '#FFFDE7', border: '#F59E0B', textColor: '#92400E' },
  synthesis:     { bg: '#FFFFFF', border: '#A855F7', textColor: '#2D2D2D' },
};

export const EDGE_COLORS: Record<CanvasNodeType, string> = {
  topic:         '#A855F7',
  chapter:       '#3DBE7A',
  document:      '#818CF8',
  'ai-chat':     '#34D399',
  'ai-review':   '#F87171',
  note:          '#F59E0B',
  synthesis:     '#A855F7',
};
