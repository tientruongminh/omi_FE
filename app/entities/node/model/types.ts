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
