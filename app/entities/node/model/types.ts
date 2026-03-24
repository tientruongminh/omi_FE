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
  customBg?: string;
  customBorder?: string;
  synthSourceIds?: string[];
}

export interface CanvasEdge {
  from: string;
  to: string;
}

// Node visual styles
export const NODE_STYLES: Record<CanvasNode['type'], { bg: string; border: string; textColor: string }> = {
  topic:         { bg: '#E8D5F5', border: '#A855F7', textColor: '#4C1D95' },
  chapter:       { bg: '#EDFAF4', border: '#3DBE7A', textColor: '#1A4731' },
  document:      { bg: '#FFFFFF', border: '#E5DDD5', textColor: '#2D2D2D' },
  'ai-response': { bg: '#EEF2FF', border: '#818CF8', textColor: '#3730A3' },
  note:          { bg: '#FFFDE7', border: '#F59E0B', textColor: '#92400E' },
  synthesis:     { bg: '#FFFFFF', border: '#A855F7', textColor: '#2D2D2D' },
};

export const EDGE_COLORS: Record<CanvasNode['type'], string> = {
  topic:         '#A855F7',
  chapter:       '#3DBE7A',
  document:      '#818CF8',
  'ai-response': '#818CF8',
  note:          '#F59E0B',
  synthesis:     '#A855F7',
};
