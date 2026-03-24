'use client';

import { CanvasNode } from '../model/types';
import ExpandedHeader from './ExpandedHeader';

interface Props {
  node: CanvasNode;
  onClose: () => void;
}

export default function ExpandedNoteContent({ node, onClose }: Props) {
  return (
    <div className="flex flex-col h-full bg-[#FFFDE7]">
      <ExpandedHeader icon="✎" title={node.title} onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="text-[14px] text-[#78350F] leading-[1.9] font-serif">
          {node.content ?? node.title}
        </p>
      </div>
    </div>
  );
}
