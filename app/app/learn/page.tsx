'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  NodeProps,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, FileText, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { contentCards } from '@/lib/data';

// Root Node Component
function RootNode({ data }: NodeProps) {
  return (
    <div className="min-w-[200px] text-center relative bg-[#EEF2FF] border-2 border-[#A5B4FC] rounded-2xl px-5 py-3">
      <div className="text-sm font-bold text-[#4338CA]">{data.label as string}</div>
      <Handle type="source" position={Position.Right} style={{ background: '#818CF8', border: 'none', width: 12, height: 12 }} />
    </div>
  );
}

// Child Node Component
function ChildNode({ data }: NodeProps) {
  const typedData = data as { expanded?: boolean; onToggle?: () => void; label?: string };
  const isExpanded = typedData.expanded;
  const onToggle = typedData.onToggle;
  const label = typedData.label;

  return (
    <div
      className={`flex items-center gap-2 min-w-[180px] rounded-xl px-4 py-2.5 border-2 ${
        isExpanded
          ? 'bg-[#6EE7B7] border-[#34D399]'
          : 'bg-[#A7F3D0] border-[#7CE6BB]'
      }`}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#818CF8', border: 'none', width: 12, height: 12 }} />
      <span className="flex-1 text-sm font-medium text-[#2D2D2D]">{label}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
        className="w-6 h-6 rounded-full bg-white/60 border border-[#7CE6BB] flex items-center justify-center hover:bg-white/80 transition-colors flex-shrink-0"
      >
        {isExpanded ? (
          <ChevronLeft size={12} className="text-[#065F46]" />
        ) : (
          <ChevronRight size={12} className="text-[#065F46]" />
        )}
      </button>
      <Handle type="source" position={Position.Right} style={{ background: '#818CF8', border: 'none', width: 12, height: 12 }} />
    </div>
  );
}

const nodeTypes = {
  rootNode: RootNode,
  childNode: ChildNode,
};

const CHILD_NODES = [
  'Khái Niệm Cơ Bản',
  'Kiến Trúc Hệ Thống',
  'Quản Lý Tài Nguyên',
  'Giao Diện Người Dùng (UI)',
  'Hệ Điều Hành Phổ Biến',
  'Lập Trình Shell (BASH)',
  'Khởi Động và Debug',
];

// Content Panel
function ContentPanel({ nodeLabel, onClose }: { nodeLabel: string; onClose: () => void }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs text-[#5A5C58] uppercase tracking-widest mb-1">Selected Topic</p>
          <h3 className="text-base font-bold text-[#2D2D2D]">{nodeLabel}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-[#F1F1EC] border-2 border-[#333333] flex items-center justify-center hover:bg-[#E5E5DF] transition-colors"
        >
          <X size={14} className="text-[#2D2D2D]" />
        </button>
      </div>

      {contentCards.map((card) => (
        <div
          key={card.id}
          className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden hover:border-[#2D2D2D] transition-colors"
        >
          {card.type === 'pdf' && (
            <div className="h-2 bg-gradient-to-r from-[#F9A8D4] to-[#F472B6]" />
          )}

          <div className="p-4">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  card.type === 'video' ? 'bg-[#DBEAFE]' : 'bg-[#FCE7F3]'
                }`}
              >
                {card.type === 'video' ? (
                  <Play size={14} className="text-[#2563EB] fill-current" />
                ) : (
                  <FileText size={14} className="text-[#DB2777]" />
                )}
              </div>
              <span className="font-semibold text-[#2D2D2D] text-sm uppercase tracking-wide">
                {card.type === 'video' ? 'Video' : 'PDF'}
              </span>
              <div className="flex gap-1.5 ml-auto flex-wrap">
                {card.tags.map((tag) => (
                  <span
                    key={tag.label}
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      tag.color === 'green'
                        ? 'bg-[#D1FAE5] text-[#065F46]'
                        : 'bg-[#FEE2E2] text-[#991B1B]'
                    }`}
                  >
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>

            {card.type === 'video' && (
              <div className="w-full h-28 rounded-xl bg-[#E5E7EB] mb-3 relative overflow-hidden flex items-center justify-center group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-[#818CF8]/30 to-[#C7D2FE]/40" />
                <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/90 transition-colors z-10">
                  <Play size={18} className="text-[#4338CA] fill-current ml-0.5" />
                </div>
                <div className="absolute bottom-2 left-3 right-3 z-10">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-[#818CF8] rounded-full" />
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm font-medium text-[#2D2D2D] leading-snug">
              {card.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MindMapPage() {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>('child-4');

  const selectedNodeLabel = useMemo(() => {
    if (!expandedNodeId) return null;
    const idx = parseInt(expandedNodeId.replace('child-', '')) - 1;
    return CHILD_NODES[idx] ?? null;
  }, [expandedNodeId]);

  const handleToggle = useCallback((id: string) => {
    setExpandedNodeId((prev) => (prev === id ? null : id));
  }, []);

  const nodes: Node[] = useMemo(() => {
    const result: Node[] = [
      {
        id: 'root',
        type: 'rootNode',
        position: { x: 40, y: 240 },
        data: { label: 'Hệ Điều Hành và Linux' },
      },
    ];

    CHILD_NODES.forEach((label, i) => {
      result.push({
        id: `child-${i + 1}`,
        type: 'childNode',
        position: { x: 320, y: i * 72 + 10 },
        data: {
          label,
          expanded: expandedNodeId === `child-${i + 1}`,
          onToggle: () => handleToggle(`child-${i + 1}`),
        },
      });
    });

    return result;
  }, [expandedNodeId, handleToggle]);

  const edges: Edge[] = useMemo(() => {
    return CHILD_NODES.map((_, i) => ({
      id: `edge-${i + 1}`,
      source: 'root',
      target: `child-${i + 1}`,
      type: 'smoothstep',
      style: { stroke: '#818CF8', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#818CF8', width: 12, height: 12 },
    }));
  }, []);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      <div className="mb-6">
        <p className="text-xs text-[#5A5C58] uppercase tracking-widest mb-1">Learning Mode</p>
        <h1 className="text-3xl font-bold text-[#2D2D2D]">Hệ Điều Hành và Linux</h1>
        <p className="text-[#5A5C58] mt-1 text-sm">Click &gt; on a topic node to explore resources</p>
      </div>

      <div className="flex gap-6">
        {/* Mindmap canvas */}
        <div
          className="flex-1 bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden"
          style={{ height: 580 }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={true}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnScroll={true}
            zoomOnScroll={true}
            minZoom={0.4}
            maxZoom={2}
          >
            <Background color="#CCCCCC" gap={20} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Content panel */}
        <div
          className={`transition-all duration-300 overflow-hidden ${
            selectedNodeLabel ? 'w-[340px] opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {selectedNodeLabel && (
            <ContentPanel
              nodeLabel={selectedNodeLabel}
              onClose={() => setExpandedNodeId(null)}
            />
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#EEF2FF] border-2 border-[#A5B4FC]" />
          <span className="text-xs text-[#5A5C58]">Root topic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-[#A7F3D0] border-2 border-[#7CE6BB]" />
          <span className="text-xs text-[#5A5C58]">Sub-topic (click &gt; to expand)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-[#818CF8]" />
          <span className="text-xs text-[#5A5C58]">Connection</span>
        </div>
      </div>
    </div>
  );
}
