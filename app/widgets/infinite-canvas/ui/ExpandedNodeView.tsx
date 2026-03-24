'use client';

import { motion } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import ExpandedDocContent from './ExpandedDocContent';
import ExpandedNoteContent from './ExpandedNoteContent';
import ExpandedAIContent from './ExpandedAIContent';
import ExpandedSynthesisContent from './ExpandedSynthesisContent';

interface Props {
  node: CanvasNode;
  allNodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review', selectedText?: string) => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
  /** Position within the overlay: 'center' (single), 'left' (split), 'right' (split) */
  position: 'center' | 'left' | 'right';
}

export default function ExpandedNodeView({ node, allNodes, edges, onClose, onCreateAINode, onUpdateContent, position }: Props) {
  const initial = position === 'left' ? { x: -60 } : { x: 60 };

  return (
    <motion.div
      key={node.id}
      layout
      initial={{ opacity: 0, ...initial, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, ...initial, scale: 0.95 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden bg-white"
      style={{
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        flex: position === 'center' ? '0 0 65%' : '1 1 50%',
        maxWidth: position === 'center' ? 720 : undefined,
        minWidth: 0,
      }}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {node.type === 'note' && <ExpandedNoteContent node={node} onClose={onClose} onUpdateContent={onUpdateContent} />}
      {node.type === 'ai-response' && <ExpandedAIContent node={node} onClose={onClose} />}
      {node.type === 'synthesis' && <ExpandedSynthesisContent node={node} allNodes={allNodes} edges={edges} onClose={onClose} onUpdateContent={onUpdateContent} />}
      {(node.type === 'document' || node.type === 'chapter' || node.type === 'topic') && (
        <ExpandedDocContent node={node} onClose={onClose} onCreateAINode={onCreateAINode} />
      )}
    </motion.div>
  );
}
