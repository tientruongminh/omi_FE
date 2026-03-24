'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CanvasNode } from '../model/types';
import ExpandedNodeView from './ExpandedNodeView';

interface Props {
  expandedNode: CanvasNode | null;
  allNodes: CanvasNode[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
  leftPanel: React.ReactNode;
}

export default function SplitView({ expandedNode, allNodes, onClose, onCreateAINode, leftPanel }: Props) {
  return (
    <div className="flex w-full h-full gap-3">
      <motion.div
        animate={{ width: expandedNode ? '55%' : '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ flexShrink: 0, height: '100%', minWidth: 0 }}
      >
        {leftPanel}
      </motion.div>

      <AnimatePresence>
        {expandedNode && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: '45%', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{ flexShrink: 0, height: '100%', overflow: 'hidden' }}
          >
            <ExpandedNodeView
              node={expandedNode}
              allNodes={allNodes}
              onClose={onClose}
              onCreateAINode={onCreateAINode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
