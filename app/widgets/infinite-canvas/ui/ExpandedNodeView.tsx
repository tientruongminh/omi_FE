'use client';

import { motion } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import ExpandedDocContent from './ExpandedDocContent';
import ExpandedNoteContent from './ExpandedNoteContent';
import ExpandedAIContent from './ExpandedAIContent';
import ExpandedReviewContent from './ExpandedReviewContent';
import ExpandedSynthesisContent from './ExpandedSynthesisContent';

interface Props {
  node: CanvasNode;
  allNodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
}

export default function ExpandedNodeView({ node, allNodes, edges, onClose, onCreateAINode, onUpdateContent }: Props) {
  return (
    <motion.div
      key={node.id}
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full rounded-2xl border-2 border-[#333333] shadow-xl overflow-hidden flex-shrink-0"
      style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.15)', width: 400 }}
    >
      {node.type === 'note' && <ExpandedNoteContent node={node} onClose={onClose} onUpdateContent={onUpdateContent} />}
      {node.type === 'ai-chat' && (
        <ExpandedAIContent node={node} onClose={onClose} onCreateAINode={onCreateAINode} />
      )}
      {node.type === 'ai-review' && (
        <ExpandedReviewContent node={node} onClose={onClose} onCreateAINode={onCreateAINode} />
      )}
      {node.type === 'synthesis' && <ExpandedSynthesisContent node={node} allNodes={allNodes} edges={edges} onClose={onClose} onUpdateContent={onUpdateContent} />}
      {(node.type === 'document' || node.type === 'chapter' || node.type === 'topic') && (
        <ExpandedDocContent node={node} onClose={onClose} onCreateAINode={onCreateAINode} />
      )}
    </motion.div>
  );
}
