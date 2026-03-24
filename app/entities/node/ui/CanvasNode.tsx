'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CanvasNode } from '@/entities/node/model/types';
import { NODE_STYLES } from '@/entities/node/model/types';
import NodeIcon from './NodeIcon';
import NodeBadge from './NodeBadge';

interface Props {
  node: CanvasNode;
  isExpanded: boolean;
  isFocused: boolean;
  onDrag: (id: string, dx: number, dy: number) => void;
  onClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, node: CanvasNode) => void;
  onStartEdge?: (nodeId: string, side: 'left' | 'right' | 'top' | 'bottom', x: number, y: number) => void;
  scale: number;
  collapsedChildCount?: number;
}

const HANDLE_SIZE = 10;

export default function CanvasNode({
  node, isExpanded, isFocused, onDrag, onClick, onContextMenu, onStartEdge, scale, collapsedChildCount = 0,
}: Props) {
  const baseStyle = NODE_STYLES[node.type];
  const style = (node as any).customBg ? {
    bg: (node as any).customBg,
    border: (node as any).customBorder,
    textColor: baseStyle.textColor,
  } : baseStyle;
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const [hovered, setHovered] = useState(false);
  const isSynthesis = node.type === 'synthesis';
  const isMainTopic = node.type === 'topic' && !!node.summary;

  const synthesisStyle = isSynthesis ? {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #A855F7, #22C55E) border-box',
    border: '2px solid transparent',
  } : {};

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-handle]')) return; // Don't drag when clicking handle
    e.stopPropagation();
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    const handleMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
        onDrag(node.id, dx / scale, dy / scale);
        dragStart.current = { x: ev.clientX, y: ev.clientY };
      }
    };
    const handleUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  };

  const handleHandleMouseDown = (side: 'left' | 'right' | 'top' | 'bottom') => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const cx = side === 'left' ? node.x : side === 'right' ? node.x + node.width : node.x + node.width / 2;
    const cy = side === 'top' ? node.y : side === 'bottom' ? node.y + node.height : node.y + node.height / 2;
    onStartEdge?.(node.id, side, cx, cy);
  };

  const handles: { side: 'left' | 'right' | 'top' | 'bottom'; style: React.CSSProperties }[] = [
    { side: 'right', style: { right: -HANDLE_SIZE / 2, top: '50%', transform: 'translateY(-50%)' } },
    { side: 'left', style: { left: -HANDLE_SIZE / 2, top: '50%', transform: 'translateY(-50%)' } },
    { side: 'top', style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
    { side: 'bottom', style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
  ];

  return (
    <motion.div
      data-node-id={node.id}
      className="absolute rounded-xl cursor-pointer select-none"
      style={{
        left: node.x, top: node.y, width: node.width, height: node.height,
        backgroundColor: isSynthesis ? '#FFFFFF' : style.bg,
        border: isSynthesis ? '2px solid transparent' : `2px solid ${style.border}`,
        ...synthesisStyle,
        color: style.textColor,
        boxShadow: isFocused
          ? `0 0 0 3px ${style.border}, 0 8px 32px rgba(0,0,0,0.18)`
          : isSynthesis ? '0 4px 20px rgba(168,85,247,0.2)' : '0 2px 10px rgba(0,0,0,0.08)',
        zIndex: isFocused ? 10 : 1,
        opacity: isExpanded ? 0.6 : 1,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isExpanded ? 0.6 : 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, boxShadow: '0 6px 24px rgba(0,0,0,0.14)' }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); if (!hasMoved.current) onClick(node.id); }}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, node); }}
    >
      {/* Connection handles — visible on hover */}
      {(hovered || isFocused) && handles.map((h) => (
        <div
          key={h.side}
          data-handle={h.side}
          className="absolute z-20 transition-opacity"
          style={{
            ...h.style,
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            borderRadius: '50%',
            backgroundColor: '#fff',
            border: `2px solid ${style.border}`,
            cursor: 'crosshair',
            opacity: hovered ? 1 : 0,
          }}
          onMouseDown={handleHandleMouseDown(h.side)}
        />
      ))}

      <div className="flex flex-col h-full px-3 py-2 overflow-hidden justify-center">
        <div className="flex items-center gap-2">
          <NodeIcon type={node.type} docType={node.docType} />
          <span className="text-[12.5px] font-semibold leading-tight truncate"
            style={{ fontSize: node.type === 'topic' ? 14 : node.type === 'synthesis' ? 13 : 12.5, fontWeight: (node.type === 'topic' || node.type === 'synthesis') ? 700 : 600 }}>
            {node.title}
          </span>
          <NodeBadge count={collapsedChildCount} textColor={style.textColor} />
        </div>
        {isMainTopic && node.summary && (
          <p className="text-[10px] mt-1 leading-relaxed opacity-70 line-clamp-2" style={{ color: style.textColor }}>
            {node.summary}
          </p>
        )}
      </div>
    </motion.div>
  );
}
