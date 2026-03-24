'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import ExpandedNodeView from './ExpandedNodeView';

interface Props {
  expandedNodes: CanvasNode[];
  allNodes: CanvasNode[];
  edges: CanvasEdge[];
  onClose: (nodeId?: string) => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
  leftPanel: React.ReactNode;
}

export default function SplitView({ expandedNodes, allNodes, edges, onClose, onCreateAINode, onUpdateContent, leftPanel }: Props) {
  const hasExpanded = expandedNodes.length > 0;
  const hasTwoExpanded = expandedNodes.length >= 2;

  return (
    <div className="flex w-full h-full gap-3">
      <motion.div
        animate={{ width: hasTwoExpanded ? '0%' : hasExpanded ? '55%' : '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{ flexShrink: 0, height: '100%', minWidth: 0, overflow: 'hidden' }}
      >
        {leftPanel}
      </motion.div>

      <AnimatePresence>
        {expandedNodes.map((node, i) => {
          const position = expandedNodes.length === 1 ? 'full' as const : i === 0 ? 'left' as const : 'right' as const;
          const width = expandedNodes.length === 1 ? '45%' : '50%';
          return (
            <motion.div
              key={node.id}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              style={{ flexShrink: 0, height: '100%', overflow: 'hidden' }}
            >
              <ExpandedNodeView
                node={node}
                allNodes={allNodes}
                edges={edges}
                onClose={() => onClose(node.id)}
                onCreateAINode={onCreateAINode}
                onUpdateContent={onUpdateContent}
                position={position}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
