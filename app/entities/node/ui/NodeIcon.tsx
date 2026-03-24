'use client';

import { CanvasNode } from '@/entities/node/model/types';

interface Props {
  type: CanvasNode['type'];
  docType?: 'text' | 'video';
}

export default function NodeIcon({ type, docType }: Props) {
  if (type === 'synthesis') return <span className="text-[11px] flex-shrink-0 leading-none font-bold text-purple-500">⬡</span>;
  if (type === 'document') return <span className="text-[11px] flex-shrink-0 leading-none font-bold opacity-60">{docType === 'video' ? '▶' : '◎'}</span>;
  if (type === 'ai-response') return <span className="text-[11px] flex-shrink-0 leading-none font-bold opacity-60">AI</span>;
  if (type === 'note') return <span className="text-[11px] flex-shrink-0 leading-none font-bold opacity-60">✎</span>;
  if (type === 'topic') return <span className="text-[11px] flex-shrink-0 leading-none font-bold opacity-60">◆</span>;
  return null;
}
