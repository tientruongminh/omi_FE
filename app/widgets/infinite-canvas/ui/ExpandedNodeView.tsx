'use client';

import { motion } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import ExpandedDocContent from './ExpandedDocContent';
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
  isPopup?: boolean;
}

export default function ExpandedNodeView({ node, allNodes, edges, onClose, onCreateAINode, onUpdateContent, isPopup }: Props) {
  return (
    <motion.div
      key={node.id}
      layout
      initial={{ opacity: 0, y: isPopup ? 30 : 0, x: isPopup ? 0 : 40, scale: isPopup ? 0.95 : 1 }}
      animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      exit={{ opacity: 0, y: isPopup ? 30 : 0, x: isPopup ? 0 : 40, scale: isPopup ? 0.95 : 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl border-2 border-[#333333] shadow-xl overflow-hidden"
      style={{
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        ...(isPopup
          ? { flex: '1 1 0%', minWidth: 0, height: '100%' }
          : { width: 400, flexShrink: 0, height: '100%' }
        ),
      }}
    >
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
      {node.type === 'note' && (
        <div className="flex items-center justify-center h-full text-sm text-[#5A5C58]">
          Ghi chú mở ở sidebar bên phải
        </div>
      )}
    </motion.div>
  );
}
