'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { RoadmapNode, RoadmapEdge } from '@/lib/data';
import { mindmapNodes } from '@/lib/learning-data';

interface Props {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  onNodesChange?: (nodes: RoadmapNode[]) => void;
  onEdgesChange?: (edges: RoadmapEdge[]) => void;
  onNodeClick?: (nodeId: string) => void;
}

interface ContextMenu {
  x: number;
  y: number;
  nodeId: string;
}

const NODE_WIDTH = 170;
const NODE_HEIGHT = 44;

// Map roadmap node index to mindmap unit id
const ROADMAP_TO_UNIT_MAP: Record<string, string> = {
  'n1': 'khai-niem',
  'n2': 'kien-truc',
  'n3': 'quan-ly',
  'n4': 'giao-dien',
  'n5': 'he-dieu-hanh',
  'n6': 'lap-trinh-shell',
  'n7': 'khoi-dong',
};

export default function RoadmapGraph({ nodes: initialNodes, edges: initialEdges, onNodesChange, onEdgesChange, onNodeClick }: Props) {
  const [nodes, setNodes] = useState<RoadmapNode[]>(initialNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(initialEdges);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Track drag start positions
  const dragStartPos = useRef<Record<string, { x: number; y: number }>>({});

  // Close context menu on click outside
  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const updateNode = useCallback((id: string, updates: Partial<RoadmapNode>) => {
    setNodes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updates } : n));
      onNodesChange?.(next);
      return next;
    });
  }, [onNodesChange]);

  const deleteNode = useCallback((id: string) => {
    setNodes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      onNodesChange?.(next);
      return next;
    });
    setEdges((prev) => {
      const next = prev.filter((e) => e.from !== id && e.to !== id);
      onEdgesChange?.(next);
      return next;
    });
    setContextMenu(null);
  }, [onNodesChange, onEdgesChange]);

  const addNodeAfter = useCallback((afterId: string) => {
    const afterNode = nodes.find((n) => n.id === afterId);
    if (!afterNode) return;
    const newId = 'n' + Date.now();
    const newNode: RoadmapNode = {
      id: newId,
      label: 'Chủ đề mới',
      x: afterNode.x,
      y: afterNode.y + 100,
    };
    setNodes((prev) => {
      const next = [...prev, newNode];
      onNodesChange?.(next);
      return next;
    });
    setEdges((prev) => {
      const next = [...prev, { id: `e${afterId}-${newId}`, from: afterId, to: newId }];
      onEdgesChange?.(next);
      return next;
    });
    setContextMenu(null);
  }, [nodes, onNodesChange, onEdgesChange]);

  // Calculate center of all nodes for SVG viewBox
  const allX = nodes.map((n) => n.x);
  const allY = nodes.map((n) => n.y);
  const minX = Math.max(0, Math.min(...allX) - 60);
  const minY = Math.max(0, Math.min(...allY) - 60);
  const maxX = Math.max(...allX) + NODE_WIDTH + 80;
  const maxY = Math.max(...allY) + NODE_HEIGHT + 80;
  const svgWidth = Math.max(700, maxX - minX);
  const svgHeight = Math.max(600, maxY - minY);

  const getNodeCenter = (node: RoadmapNode) => ({
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  });

  // Find midpoint between two connected nodes for + button
  const getMidpoint = (from: RoadmapNode, to: RoadmapNode) => ({
    x: (from.x + to.x) / 2 + NODE_WIDTH / 2,
    y: (from.y + to.y) / 2 + NODE_HEIGHT / 2,
  });

  const handleNodeClick = (nodeId: string) => {
    // Map roadmap node to unit id and navigate via parent callback
    const unitId = ROADMAP_TO_UNIT_MAP[nodeId] ?? nodeId;
    onNodeClick?.(unitId);
  };

  return (
    <div ref={containerRef} className="relative w-full overflow-auto" style={{ minHeight: svgHeight + 40 }}>
      {/* SVG for edges — updates as nodes move */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgWidth}
        height={svgHeight}
        style={{ zIndex: 0 }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#818CF8" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const fromNode = nodes.find((n) => n.id === edge.from);
          const toNode = nodes.find((n) => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const from = getNodeCenter(fromNode);
          const to = getNodeCenter(toNode);
          // Bezier curve
          const midY = (from.y + to.y) / 2;
          const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
          return (
            <path
              key={edge.id}
              d={d}
              stroke="#818CF8"
              strokeWidth="2"
              fill="none"
              strokeDasharray="6 3"
              markerEnd="url(#arrowhead)"
              opacity={0.7}
            />
          );
        })}
      </svg>

      {/* + buttons between connected nodes */}
      {edges.map((edge) => {
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return null;
        const mid = getMidpoint(fromNode, toNode);
        return (
          <button
            key={`plus-${edge.id}`}
            onClick={() => addNodeAfter(edge.from)}
            className="absolute z-10 w-6 h-6 rounded-full bg-white border-2 border-[#818CF8] flex items-center justify-center hover:bg-[#818CF8] hover:text-white transition-colors shadow-sm"
            style={{ left: mid.x - 12, top: mid.y - 12 }}
            title="Thêm chủ đề mới"
          >
            <Plus size={12} />
          </button>
        );
      })}

      {/* Nodes */}
      {nodes.map((node, index) => {
        const unitId = ROADMAP_TO_UNIT_MAP[node.id];
        const unitData = unitId ? mindmapNodes.find(m => m.id === unitId) : null;
        return (
          <motion.div
            key={node.id}
            drag
            dragMomentum={false}
            dragConstraints={{ left: 0, top: 0, right: svgWidth - NODE_WIDTH, bottom: svgHeight - NODE_HEIGHT }}
            onDragStart={() => {
              dragStartPos.current[node.id] = { x: node.x, y: node.y };
            }}
            onDrag={(_, info) => {
              const start = dragStartPos.current[node.id];
              if (!start) return;
              const newX = Math.max(0, start.x + info.offset.x);
              const newY = Math.max(0, start.y + info.offset.y);
              setNodes((prev) => {
                const next = prev.map((n) => n.id === node.id ? { ...n, x: newX, y: newY } : n);
                return next;
              });
            }}
            onDragEnd={(_, info) => {
              const start = dragStartPos.current[node.id];
              if (!start) return;
              const newX = Math.max(0, start.x + info.offset.x);
              const newY = Math.max(0, start.y + info.offset.y);
              delete dragStartPos.current[node.id];
              setNodes((prev) => {
                const next = prev.map((n) => n.id === node.id ? { ...n, x: newX, y: newY } : n);
                onNodesChange?.(next);
                return next;
              });
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute z-20 cursor-grab active:cursor-grabbing select-none"
            style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id });
            }}
          >
            {editingNode === node.id ? (
              <input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => {
                  if (editValue.trim()) updateNode(node.id, { label: editValue.trim() });
                  setEditingNode(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (editValue.trim()) updateNode(node.id, { label: editValue.trim() });
                    setEditingNode(null);
                  }
                  if (e.key === 'Escape') setEditingNode(null);
                }}
                className="w-full px-3 py-2 rounded-full border-2 border-[#6B2D3E] bg-white text-sm font-semibold text-[#2D2D2D] outline-none text-center"
                style={{ height: NODE_HEIGHT }}
              />
            ) : (
              <div className="group relative">
                <div
                  className="px-4 py-2.5 bg-[#F1F1EC] border-2 border-[#333333] rounded-full text-sm font-semibold text-[#2D2D2D] text-center shadow-sm hover:border-[#6B2D3E] hover:shadow-md hover:bg-[#E8E4DF] transition-all cursor-pointer"
                  style={{ height: NODE_HEIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Click để học • Kéo để di chuyển • Chuột phải để chỉnh sửa"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node.id);
                  }}
                >
                  {node.label}
                </div>
                {/* Tooltip with unit summary on hover */}
                {unitData && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-[#2D2D2D] text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
                    <p className="font-bold mb-1 text-[#4CD964]">{node.label}</p>
                    <p>{unitData.subtitle}</p>
                    <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#2D2D2D] rotate-45" />
                  </div>
                )}
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-50 bg-white border-2 border-[#333333] rounded-xl shadow-xl overflow-hidden"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                const node = nodes.find((n) => n.id === contextMenu.nodeId);
                if (node) { setEditValue(node.label); setEditingNode(node.id); }
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#F1F1EC] w-full text-left transition-colors"
            >
              ✏️ Sửa tên
            </button>
            <button
              onClick={() => {
                handleNodeClick(contextMenu.nodeId);
                setContextMenu(null);
              }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#F1F1EC] w-full text-left transition-colors"
            >
              📖 Bắt đầu học
            </button>
            <button
              onClick={() => addNodeAfter(contextMenu.nodeId)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#2D2D2D] hover:bg-[#F1F1EC] w-full text-left transition-colors"
            >
              ➕ Thêm chủ đề sau
            </button>
            <div className="border-t border-[#CCCCCC]" />
            <button
              onClick={() => deleteNode(contextMenu.nodeId)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors"
            >
              <X size={14} /> Xóa
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
