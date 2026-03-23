'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CanvasNode } from '../InfiniteCanvas/types';
import ExpandedDocContent from './ExpandedDocContent';
import ExpandedNoteContent from './ExpandedNoteContent';
import ExpandedAIContent from './ExpandedAIContent';
import ExpandedSynthesisContent from './ExpandedSynthesisContent';

interface Props {
  node: CanvasNode | null;
  allNodes: CanvasNode[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
}

export default function ExpandedNodeView({ node, allNodes, onClose, onCreateAINode }: Props) {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: 60, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full h-full rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
        >
          {node.type === 'note' && <ExpandedNoteContent node={node} onClose={onClose} />}
          {node.type === 'ai-response' && <ExpandedAIContent node={node} onClose={onClose} />}
          {node.type === 'synthesis' && <ExpandedSynthesisContent node={node} allNodes={allNodes} onClose={onClose} />}
          {(node.type === 'document' || node.type === 'chapter' || node.type === 'topic') && (
            <ExpandedDocContent node={node} onClose={onClose} onCreateAINode={onCreateAINode} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
