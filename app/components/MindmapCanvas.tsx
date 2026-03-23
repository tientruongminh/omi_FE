'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { mindmapNodes, nearbyUnits, type MindmapNodeData } from '@/lib/learning-data';

// ─── Types ────────────────────────────────────────────────────

interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

interface Props {
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
  activeContentNodes: Record<string, ContentNodeUI[]>;
  onOpenDocument: (docId: string, nodeId: string) => void;
}

// ─── Layout constants ─────────────────────────────────────────

const ROOT_X = 80;
const ROOT_Y = 260;
const ROOT_W = 220;
const ROOT_H = 56;

const CHILD_X = 370;
const CHILD_W = 200;
const CHILD_H = 44;
const CHILD_SPACING = 76;
const CHILD_START_Y = ROOT_Y - ((mindmapNodes.length - 1) / 2) * CHILD_SPACING;

const CONTENT_X = 620;
const CONTENT_W = 200;
const CONTENT_H = 38;
const CONTENT_SPACING = 52;

// ─── Bezier path helper ───────────────────────────────────────

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

// ─── Component ────────────────────────────────────────────────

export default function MindmapCanvas({
  selectedNodeId,
  onSelectNode,
  activeContentNodes,
  onOpenDocument,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan + Zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  // ── Pan handlers ──────────────────────────────────────────

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node]') || target.closest('[data-content-node]')) return;
    if (e.button !== 0) return;
    isPanning.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Scroll to zoom ─────────────────────────────────────────

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(2, Math.max(0.5, t.scale * delta)),
    }));
  }, []);

  // ── Context menu ───────────────────────────────────────────

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node]') || target.closest('[data-content-node]')) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // ── Zoom controls ─────────────────────────────────────────

  const zoomIn = () =>
    setTransform((t) => ({ ...t, scale: Math.min(2, t.scale * 1.2) }));
  const zoomOut = () =>
    setTransform((t) => ({ ...t, scale: Math.max(0.5, t.scale / 1.2) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // ── Build SVG canvas size ─────────────────────────────────

  const canvasW = 900;
  const canvasH = 660;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 mindmap-bg overflow-hidden rounded-2xl border-2 border-[#333333] select-none"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onContextMenu={onContextMenu}
    >
      {/* ── Zoom Controls ─────────────────────────────────── */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {[
          { icon: <Plus size={14} />, action: zoomIn, title: 'Phóng to' },
          { icon: <Minus size={14} />, action: zoomOut, title: 'Thu nhỏ' },
          { icon: <RotateCcw size={13} />, action: resetView, title: 'Đặt lại' },
        ].map(({ icon, action, title }) => (
          <button
            key={title}
            title={title}
            onClick={action}
            className="w-8 h-8 rounded-lg bg-white border-2 border-[#333333] flex items-center justify-center text-[#333333] hover:bg-[#F1F1EC] transition-colors shadow-sm"
          >
            {icon}
          </button>
        ))}
      </div>

      {/* ── Transformable canvas ───────────────────────────── */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: 'center center',
          width: canvasW,
          height: canvasH,
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -canvasH / 2,
          marginLeft: -canvasW / 2,
          willChange: 'transform',
        }}
      >
        {/* SVG connections */}
        <svg
          width={canvasW}
          height={canvasH}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
        >
          {/* Root → Child connections */}
          {mindmapNodes.map((node, i) => {
            const cy = CHILD_START_Y + i * CHILD_SPACING + CHILD_H / 2;
            const x1 = ROOT_X + ROOT_W;
            const y1 = ROOT_Y + ROOT_H / 2;
            const x2 = CHILD_X;
            const y2 = cy;
            return (
              <path
                key={`edge-${node.id}`}
                d={bezierPath(x1, y1, x2, y2)}
                stroke="#818CF8"
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
                opacity={selectedNodeId && selectedNodeId !== node.id ? 0.3 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
            );
          })}

          {/* Child → Content node connections */}
          {mindmapNodes.map((node, i) => {
            const contentNodes = activeContentNodes[node.id];
            if (!contentNodes?.length) return null;
            const parentCy = CHILD_START_Y + i * CHILD_SPACING + CHILD_H / 2;
            const totalContent = contentNodes.length;
            const contentStartY =
              parentCy - ((totalContent - 1) / 2) * CONTENT_SPACING;

            return contentNodes.map((cn, ci) => {
              const cy2 = contentStartY + ci * CONTENT_SPACING + CONTENT_H / 2;
              return (
                <path
                  key={`edge-content-${cn.id}`}
                  d={bezierPath(CHILD_X + CHILD_W, parentCy, CONTENT_X, cy2)}
                  stroke="#818CF8"
                  strokeWidth={1.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="4 3"
                  opacity={0.7}
                />
              );
            });
          })}
        </svg>

        {/* ── Root Node ─────────────────────────────────── */}
        <div
          data-node="root"
          className="absolute flex items-center justify-center rounded-2xl border-2 border-[#A5B4FC] bg-[#E0E0F8] font-bold text-[#2D2D2D] text-sm shadow-md"
          style={{
            left: ROOT_X,
            top: ROOT_Y,
            width: ROOT_W,
            height: ROOT_H,
            fontSize: 15,
          }}
        >
          Hệ Điều Hành và Linux
        </div>

        {/* ── Child Nodes ───────────────────────────────── */}
        {mindmapNodes.map((node, i) => {
          const cy = CHILD_START_Y + i * CHILD_SPACING;
          const isSelected = selectedNodeId === node.id;
          const hasContent = !!activeContentNodes[node.id]?.length;

          return (
            <motion.div
              key={node.id}
              data-node={node.id}
              className="absolute flex items-center gap-2 rounded-xl border-2 cursor-pointer"
              style={{
                left: CHILD_X,
                top: cy,
                width: CHILD_W,
                height: CHILD_H,
                backgroundColor: isSelected ? '#6EE7B7' : '#A7F3D0',
                borderColor: isSelected ? '#059669' : '#7CE6BB',
                boxShadow: isSelected
                  ? '0 0 0 4px rgba(5,150,105,0.3), 0 0 16px rgba(5,150,105,0.2), 0 4px 12px rgba(0,0,0,0.1)'
                  : '0 2px 6px rgba(0,0,0,0.06)',
                paddingLeft: 14,
                paddingRight: 8,
                zIndex: isSelected ? 2 : 1,
              }}
              initial={false}
              animate={{ scale: isSelected ? 1.04 : 1 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              whileHover={{ scale: isSelected ? 1.04 : 1.03, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
              onClick={() => onSelectNode(node.id)}
              onDoubleClick={() => {
                // Open first document if available
                const docs = activeContentNodes[node.id];
                if (docs?.length) onOpenDocument(docs[0].docId, node.id);
              }}
            >
              <span className="flex-1 text-[13px] font-semibold text-[#1A4731] leading-tight">
                {node.label}
              </span>
              {hasContent && (
                <span className="text-[10px] text-[#059669] font-bold mr-1">✦</span>
              )}
              <button
                className="w-5 h-5 rounded-full bg-white/60 border border-[#7CE6BB] flex items-center justify-center hover:bg-white/90 transition-colors flex-shrink-0 text-[10px] text-[#065F46] font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
              >
                ▶
              </button>
            </motion.div>
          );
        })}

        {/* ── Content Nodes ─────────────────────────────── */}
        {mindmapNodes.map((node, i) => {
          const contentNodes = activeContentNodes[node.id];
          if (!contentNodes?.length) return null;

          const parentCy = CHILD_START_Y + i * CHILD_SPACING + CHILD_H / 2;
          const totalContent = contentNodes.length;
          const contentStartY =
            parentCy - ((totalContent - 1) / 2) * CONTENT_SPACING;

          return (
            <AnimatePresence key={`content-group-${node.id}`}>
              {contentNodes.map((cn, ci) => {
                const cy = contentStartY + ci * CONTENT_SPACING;
                return (
                  <motion.div
                    key={cn.id}
                    data-content-node={cn.id}
                    className="absolute flex items-center gap-2 rounded-xl border-2 cursor-pointer"
                    style={{
                      left: CONTENT_X,
                      top: cy,
                      width: CONTENT_W,
                      height: CONTENT_H,
                      backgroundColor: cn.color,
                      borderColor: cn.border,
                      paddingLeft: 10,
                      paddingRight: 10,
                      zIndex: 3,
                    }}
                    initial={{ opacity: 0, x: -20, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.8 }}
                    transition={{ delay: ci * 0.08, duration: 0.25, ease: 'easeOut' }}
                    whileHover={{ scale: 1.04, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                    onClick={() => onOpenDocument(cn.docId, node.id)}
                  >
                    <span className="text-sm">{cn.icon}</span>
                    <span className="flex-1 text-[11px] font-medium text-[#2D2D2D] leading-tight truncate">
                      {cn.label}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          );
        })}
      </div>

      {/* ── Context Menu ──────────────────────────────────── */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 bg-white border-2 border-[#333333] rounded-xl shadow-xl py-2 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider">
              Thêm Unit
            </div>
            {nearbyUnits.map((unit) => (
              <button
                key={unit}
                className="w-full text-left px-3 py-2 text-sm text-[#2D2D2D] hover:bg-[#F1F1EC] transition-colors"
                onClick={() => setContextMenu(null)}
              >
                + {unit}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Zoom indicator ────────────────────────────────── */}
      <div className="absolute bottom-3 left-3 text-[11px] text-[#5A5C58] bg-white/70 px-2 py-0.5 rounded-md border border-[#CCCCCC]">
        {Math.round(transform.scale * 100)}%
      </div>
    </div>
  );
}
