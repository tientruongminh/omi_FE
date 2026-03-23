// ─── InfiniteCanvas Constants ─────────────────────────────────

import { CanvasNode } from './types';

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

export const CANVAS_W = 3000;
export const CANVAS_H = 2400;
