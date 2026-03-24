'use client';

import { motion } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import ExpandedDocContent from './ExpandedDocContent';
import ExpandedNoteContent from './ExpandedNoteContent';
import ExpandedAIContent from './ExpandedAIContent';
import ExpandedSynthesisContent from './ExpandedSynthesisContent';

interface Props {
  node: CanvasNode | null;
  allNodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review', selectedText?: string) => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
}

export default function ExpandedNodeView({ node, allNodes, edges, onClose, onCreateAINode, onUpdateContent }: Props) {
  if (!node) return null;

  return (
    <motion.div
      key={node.id}
      layout
      initial={{ opacity: 0, x: 40, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden flex-1 min-w-0"
      style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
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
