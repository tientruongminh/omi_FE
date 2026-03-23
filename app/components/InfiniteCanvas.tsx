'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, X, Send, MessageCircle, ClipboardList, Play, Pause } from 'lucide-react';
import {
  mindmapNodes,
  documentTextContent,
  videoTranscripts,
  type LearningDocument,
} from '@/lib/learning-data';
import DocumentSidebar from './DocumentSidebar';
import NodeAIChat from './NodeAIChat';
import NodeReview from './NodeReview';
import AIStreamText from './AIStreamText';

// ─── Types ────────────────────────────────────────────────────

export interface CanvasNode {
  id: string;
  type: 'topic' | 'chapter' | 'document' | 'ai-response' | 'note';
  title: string;
  content?: string;
  docType?: 'text' | 'video';
  docId?: string;   // reference to original doc id
  nodeId?: string;  // reference to chapter/mindmap node id
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  color?: string;
}

interface CanvasEdge {
  from: string;
  to: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  nodeId?: string;
  nodeType?: string;
}

interface SelectionToolbarState {
  x: number;
  y: number;
  text: string;
  sourceNodeId: string;
}

interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

// ─── Constants ────────────────────────────────────────────────

const NODE_STYLES: Record<CanvasNode['type'], { bg: string; border: string; textColor: string }> = {
  topic:       { bg: '#E8D5F5', border: '#A855F7', textColor: '#4C1D95' },
  chapter:     { bg: '#EDFAF4', border: '#3DBE7A', textColor: '#1A4731' },
  document:    { bg: '#FFFFFF', border: '#E5DDD5', textColor: '#2D2D2D' },
  'ai-response': { bg: '#EEF2FF', border: '#818CF8', textColor: '#3730A3' },
  note:        { bg: '#FFFDE7', border: '#F59E0B', textColor: '#92400E' },
};

const EDGE_COLORS: Record<CanvasNode['type'], string> = {
  topic:       '#A855F7',
  chapter:     '#3DBE7A',
  document:    '#818CF8',
  'ai-response': '#818CF8',
  note:        '#F59E0B',
};

// ─── Bezier path helper ───────────────────────────────────────

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

// ─── Initial layout ───────────────────────────────────────────

function buildInitialNodes(): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const CENTER_X = 600;
  const CENTER_Y = 400;
  const RADIUS = 270;

  // Radial layout for 7 chapter nodes
  const angles = [
    -90,   // top
    -45,   // top-right
    0,     // right
    45,    // bottom-right
    90,    // bottom
    135,   // bottom-left
    180,   // left
  ];

  const topicNode: CanvasNode = {
    id: 'topic-root',
    type: 'topic',
    title: 'Hệ Điều Hành và Linux',
    x: CENTER_X - 110,
    y: CENTER_Y - 30,
    width: 220,
    height: 60,
  };

  const nodes: CanvasNode[] = [topicNode];
  const edges: CanvasEdge[] = [];

  mindmapNodes.forEach((mn, i) => {
    const angle = (angles[i] ?? (i * 51.4)) * (Math.PI / 180);
    const x = CENTER_X + Math.cos(angle) * RADIUS - 90;
    const y = CENTER_Y + Math.sin(angle) * RADIUS - 22;

    const chapterNode: CanvasNode = {
      id: `chapter-${mn.id}`,
      type: 'chapter',
      title: mn.label,
      nodeId: mn.id,
      x,
      y,
      width: 180,
      height: 44,
    };

    nodes.push(chapterNode);
    edges.push({ from: 'topic-root', to: chapterNode.id });
  });

  return { nodes, edges };
}

// ─── DraggableNode ────────────────────────────────────────────

interface DraggableNodeProps {
  node: CanvasNode;
  isExpanded: boolean;
  isFocused: boolean;
  onDrag: (id: string, dx: number, dy: number) => void;
  onClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, node: CanvasNode) => void;
  scale: number;
}

function DraggableNode({
  node,
  isExpanded,
  isFocused,
  onDrag,
  onClick,
  onContextMenu,
  scale,
}: DraggableNodeProps) {
  const style = NODE_STYLES[node.type];
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    isDragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };

    const handleMouseMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const dx = ev.clientX - dragStart.current.x;
      const dy = ev.clientY - dragStart.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved.current = true;
        onDrag(node.id, dx / scale, dy / scale);
        dragStart.current = { x: ev.clientX, y: ev.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMoved.current) {
      onClick(node.id);
    }
  };

  const getIcon = () => {
    if (node.type === 'document') {
      return node.docType === 'video' ? '🎬' : '📄';
    }
    if (node.type === 'ai-response') return '🤖';
    if (node.type === 'note') return '📝';
    if (node.type === 'topic') return '🖥️';
    return null;
  };

  const icon = getIcon();

  return (
    <motion.div
      data-node-id={node.id}
      className="absolute rounded-xl cursor-pointer select-none"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        backgroundColor: style.bg,
        border: `2px solid ${style.border}`,
        color: style.textColor,
        boxShadow: isFocused
          ? `0 0 0 3px ${style.border}, 0 8px 32px rgba(0,0,0,0.18)`
          : '0 2px 10px rgba(0,0,0,0.08)',
        zIndex: isFocused ? 10 : 1,
        opacity: isExpanded ? 0.6 : 1,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isExpanded ? 0.6 : 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, boxShadow: `0 6px 24px rgba(0,0,0,0.14)` }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(e, node); }}
    >
      <div className="flex items-center gap-2 h-full px-3 overflow-hidden">
        {icon && (
          <span className="text-base flex-shrink-0 leading-none">{icon}</span>
        )}
        <span
          className="text-[12.5px] font-semibold leading-tight truncate"
          style={{
            fontSize: node.type === 'topic' ? 14 : 12.5,
            fontWeight: node.type === 'topic' ? 700 : 600,
          }}
        >
          {node.title}
        </span>
      </div>
    </motion.div>
  );
}

// ─── BezierEdge ───────────────────────────────────────────────

interface EdgeProps {
  fromNode: CanvasNode;
  toNode: CanvasNode;
  color: string;
}

function BezierEdge({ fromNode, toNode, color }: EdgeProps) {
  const x1 = fromNode.x + fromNode.width;
  const y1 = fromNode.y + fromNode.height / 2;
  const x2 = toNode.x;
  const y2 = toNode.y + toNode.height / 2;
  const d = bezierPath(x1, y1, x2, y2);

  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={1.8}
      fill="none"
      strokeLinecap="round"
      opacity={0.65}
    />
  );
}

// ─── ExpandedTextContent ──────────────────────────────────────

interface ExpandedDocProps {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
}

function ExpandedDocContent({ node, onClose, onCreateAINode }: ExpandedDocProps) {
  const [view, setView] = useState<'content' | 'ai' | 'review'>('content');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const paragraphs = node.docType === 'text'
    ? (documentTextContent[node.docId ?? ''] ?? ['Nội dung đang được chuẩn bị.'])
    : [videoTranscripts[node.docId ?? ''] ?? '...nội dung video đang được tải...'];

  const chapterNode = mindmapNodes.find((n) => n.id === node.nodeId);
  const doc = chapterNode?.documents.find((d) => d.id === node.docId);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 0.5));
    }, 300);
    return () => clearInterval(interval);
  }, [playing]);

  const totalSeconds = parseInt(doc?.duration ?? '45') * 60;
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="flex flex-col h-full bg-[#F5F0EB]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
        <span className="text-lg">{node.docType === 'video' ? '🎬' : '📄'}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#2D2D2D] text-[14px] truncate">{node.title}</h3>
          {doc && (
            <p className="text-[11px] text-[#5A5C58]">
              {node.docType === 'video' ? `Video • ${doc.duration}` : `PDF • ${doc.size}`}
            </p>
          )}
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center hover:border-[#333333] transition-colors cursor-pointer flex-shrink-0">
          <X size={13} />
        </button>
      </div>

      {/* Tab bar */}
      {view === 'content' && node.docType === 'text' && (
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-4 max-w-xl mx-auto">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-[13.5px] text-[#2D2D2D] leading-[1.9] font-serif">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}

      {view === 'content' && node.docType === 'video' && (
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* Video mock */}
          <div
            className="w-full rounded-2xl overflow-hidden relative group cursor-pointer mb-4"
            style={{ aspectRatio: '16/9', background: '#1A1A2E' }}
            onClick={() => setPlaying((p) => !p)}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(129,140,248,0.4) 0%, rgba(79,70,229,0.2) 50%, #1A1A2E 100%)' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                {playing ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-1" />}
              </motion.div>
            </div>
            {doc && <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-mono">{doc.duration}</div>}
          </div>
          {/* Timeline */}
          <div className="flex justify-between text-[11px] text-[#5A5C58] font-mono mb-1">
            <span>{formatTime(currentSeconds)}</span>
            <span>{doc?.duration ?? '45 phút'}</span>
          </div>
          <div className="h-2 bg-[#E5E5DF] rounded-full overflow-hidden cursor-pointer mb-4" onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); }}>
            <motion.div className="h-full bg-gradient-to-r from-[#818CF8] to-[#6366F1] rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {/* Transcript */}
          <div className="p-4 bg-white rounded-xl border border-[#E5E5DF]">
            <p className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wide mb-2">Nội dung chính</p>
            <p className="text-[13px] text-[#5A5C58] leading-relaxed italic">{paragraphs[0]}</p>
          </div>
        </div>
      )}

      {view === 'ai' && (
        <div className="flex-1 overflow-hidden">
          <NodeAIChat
            docId={node.docId ?? null}
            paragraphs={paragraphs}
            docTitle={node.title}
            onBack={() => setView('content')}
          />
        </div>
      )}

      {view === 'review' && (
        <div className="flex-1 overflow-hidden">
          <NodeReview onBack={() => setView('content')} />
        </div>
      )}

      {/* Footer buttons */}
      {view === 'content' && (
        <div className="flex gap-2.5 px-5 py-3.5 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
          <button
            onClick={() => setView('ai')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-[12px] hover:bg-[#A7F3D0] transition-colors cursor-pointer"
          >
            <MessageCircle size={13} /> AI hỏi đáp
          </button>
          <button
            onClick={() => setView('review')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-[12px] hover:bg-[#FECACA] transition-colors cursor-pointer"
          >
            <ClipboardList size={13} /> Ôn tập
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ExpandedNoteContent ──────────────────────────────────────

function ExpandedNoteContent({ node, onClose }: { node: CanvasNode; onClose: () => void }) {
  return (
    <div className="flex flex-col h-full bg-[#FFFDE7]">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#F59E0B]/30 flex-shrink-0">
        <span className="text-lg">📝</span>
        <div className="flex-1">
          <h3 className="font-bold text-[#92400E] text-[14px]">{node.title}</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#F59E0B]/30 flex items-center justify-center hover:border-[#F59E0B] transition-colors cursor-pointer flex-shrink-0">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <p className="text-[14px] text-[#78350F] leading-[1.9] font-serif">
          {node.content ?? node.title}
        </p>
      </div>
    </div>
  );
}

// ─── ExpandedAIContent ────────────────────────────────────────

function ExpandedAIContent({ node, onClose }: { node: CanvasNode; onClose: () => void }) {
  const [input, setInput] = useState('');
  type ChatMsg = { id: string; role: 'ai' | 'user'; text: string };
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: 'init', role: 'ai', text: node.content ?? node.title },
  ]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = () => {
    if (!input.trim() || streaming) return;
    const aiReply = `Đây là câu trả lời tiếp theo cho "${input.trim()}". AI đang xử lý thêm thông tin từ tài liệu...`;
    setMsgs((prev) => [
      ...prev,
      { id: Date.now() + '-u', role: 'user' as const, text: input.trim() },
      { id: Date.now() + '-ai', role: 'ai' as const, text: aiReply },
    ]);
    setInput('');
    setStreaming(true);
    setTimeout(() => setStreaming(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#EEF2FF]">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[#818CF8]/30 flex-shrink-0">
        <span className="text-lg">🤖</span>
        <div className="flex-1">
          <h3 className="font-bold text-[#3730A3] text-[14px]">Câu trả lời AI</h3>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#818CF8]/30 flex items-center justify-center hover:border-[#818CF8] transition-colors cursor-pointer flex-shrink-0">
          <X size={13} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {msgs.map((m, idx) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-white border border-[#A5B4FC] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">🤖</div>
            )}
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${m.role === 'user' ? 'bg-[#6B2D3E] text-white rounded-tr-sm' : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'}`}>
              {idx === 0 && m.role === 'ai' ? (
                <AIStreamText text={m.text} speed={18} startDelay={200} />
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-5 py-3 border-t border-[#818CF8]/20 bg-white/40 flex-shrink-0">
        <div className="flex gap-2 items-center bg-white border-2 border-[#E5E5DF] rounded-full px-4 py-2 focus-within:border-[#6B2D3E] transition-colors">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Hỏi tiếp..."
            className="flex-1 text-[13px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]"
          />
          <button onClick={send} disabled={!input.trim() || streaming} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer" style={{ backgroundColor: input.trim() && !streaming ? '#6B2D3E' : '#E5E5DF' }}>
            <Send size={12} className={input.trim() && !streaming ? 'text-white' : 'text-[#9CA3AF]'} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ExpandedView ─────────────────────────────────────────────

interface ExpandedViewProps {
  expandedNodeIds: string[];
  nodes: CanvasNode[];
  onClose: (id: string) => void;
  onCreateAINode: (sourceNodeId: string, type: 'ai-response' | 'review') => void;
}

function ExpandedView({ expandedNodeIds, nodes, onClose, onCreateAINode }: ExpandedViewProps) {
  const expandedNodes = expandedNodeIds
    .map((id) => nodes.find((n) => n.id === id))
    .filter(Boolean) as CanvasNode[];

  if (expandedNodes.length === 0) return null;

  const isSplit = expandedNodes.length === 2;
  const cardWidth = isSplit ? '45vw' : '60vw';
  const maxWidth = isSplit ? 640 : 760;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center gap-4 p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
    >
      {expandedNodes.map((node) => (
        <motion.div
          key={node.id}
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-[#F5F0EB] rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden flex flex-col"
          style={{ width: cardWidth, maxWidth, height: '80vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {node.type === 'document' && (
            <ExpandedDocContent
              node={node}
              onClose={() => onClose(node.id)}
              onCreateAINode={onCreateAINode}
            />
          )}
          {node.type === 'note' && (
            <ExpandedNoteContent node={node} onClose={() => onClose(node.id)} />
          )}
          {node.type === 'ai-response' && (
            <ExpandedAIContent node={node} onClose={() => onClose(node.id)} />
          )}
          {(node.type === 'topic' || node.type === 'chapter') && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
                <span className="text-lg">{node.type === 'topic' ? '🖥️' : '📚'}</span>
                <h3 className="flex-1 font-bold text-[#2D2D2D] text-[15px]">{node.title}</h3>
                <button onClick={() => onClose(node.id)} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center cursor-pointer"><X size={13} /></button>
              </div>
              <div className="flex-1 flex items-center justify-center text-[#5A5C58] text-sm">
                {node.type === 'chapter' ? 'Nhấp chuột phải để thêm tài liệu →' : 'Canvas gốc của chủ đề này'}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── ContextMenu ──────────────────────────────────────────────

interface ContextMenuProps {
  menu: ContextMenuState;
  onAction: (action: string, nodeId?: string) => void;
  onClose: () => void;
}

function ContextMenu({ menu, onAction, onClose }: ContextMenuProps) {
  const items = useMemo(() => {
    if (!menu.nodeId) {
      // Empty canvas
      return [
        { label: '+ Thêm chủ đề mới', action: 'add-topic' },
        { label: '📝 Thêm ghi chú', action: 'add-note' },
      ];
    }
    switch (menu.nodeType) {
      case 'chapter':
        return [
          { label: '📄 Thêm tài liệu', action: 'add-document' },
          { label: '🎨 Đổi màu', action: 'change-color' },
          { label: '🗑 Xóa chủ đề', action: 'delete-node', danger: true },
        ];
      case 'document':
        return [
          { label: '🤖 AI Ôn tập', action: 'ai-review' },
          { label: '💬 AI Hỏi đáp', action: 'ai-chat' },
          { label: '📖 Mở đọc', action: 'open-read' },
          { label: '🗑 Xóa tài liệu', action: 'delete-node', danger: true },
        ];
      case 'ai-response':
      case 'note':
        return [
          { label: '🔗 Tạo node kế thừa', action: 'create-child' },
          { label: '🗑 Xóa', action: 'delete-node', danger: true },
        ];
      default:
        return [
          { label: '🗑 Xóa', action: 'delete-node', danger: true },
        ];
    }
  }, [menu.nodeId, menu.nodeType]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      onClose();
    };
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[70] bg-white border-2 border-[#333333] rounded-xl shadow-2xl py-2 min-w-[200px]"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <button
          key={item.action}
          className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F1F1EC] transition-colors cursor-pointer"
          style={{ color: (item as any).danger ? '#DC2626' : '#2D2D2D' }}
          onClick={() => {
            onAction(item.action, menu.nodeId);
            onClose();
          }}
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

// ─── SelectionToolbar ─────────────────────────────────────────

interface SelectionToolbarProps {
  toolbar: SelectionToolbarState;
  onCreate: () => void;
  onClose: () => void;
}

function SelectionToolbar({ toolbar, onCreate, onClose }: SelectionToolbarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[75] flex items-center gap-1 bg-[#2D2D2D] rounded-full px-3 py-1.5 shadow-xl"
      style={{ left: toolbar.x - 80, top: toolbar.y - 40 }}
    >
      <span className="text-white text-[11px] font-medium">Văn bản đã chọn</span>
      <button
        onClick={() => { onCreate(); onClose(); }}
        className="ml-1 px-2.5 py-1 bg-[#6B2D3E] text-white text-[11px] font-bold rounded-full hover:bg-[#5a2434] transition-colors cursor-pointer"
      >
        + Tạo node mới
      </button>
      <button onClick={onClose} className="ml-0.5 text-white/60 hover:text-white transition-colors cursor-pointer">
        <X size={11} />
      </button>
    </motion.div>
  );
}

// ─── Main InfiniteCanvas ──────────────────────────────────────

export default function InfiniteCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas transform
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Nodes & edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildInitialNodes(), []);
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);

  // Interaction state
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarState | null>(null);

  // Sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarNodeId, setSidebarNodeId] = useState<string | null>(null); // chapter node id (canvas)

  // Panning
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // ── Node drag ──────────────────────────────────────────────

  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n))
    );
  }, []);

  // ── Canvas pan ─────────────────────────────────────────────

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-id]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // ── Wheel zoom ─────────────────────────────────────────────

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform((t) => ({
      ...t,
      scale: Math.min(2.5, Math.max(0.3, t.scale * delta)),
    }));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // ── Zoom to node ────────────────────────────────────────────

  const zoomToNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    const container = containerRef.current;
    if (!node || !container) return;

    const viewportW = container.clientWidth;
    const viewportH = container.clientHeight;
    const targetScale = 1.4;
    const targetX = viewportW / 2 - (node.x + node.width / 2) * targetScale;
    const targetY = viewportH / 2 - (node.y + node.height / 2) * targetScale;

    setTransform({ x: targetX, y: targetY, scale: targetScale });
  }, [nodes]);

  // ── Node click ─────────────────────────────────────────────

  const handleNodeClick = useCallback((id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    // Chapter nodes: just focus (no expanded view)
    if (node.type === 'chapter' || node.type === 'topic') {
      setFocusedNodeId((prev) => (prev === id ? null : id));
      zoomToNode(id);
      return;
    }

    // Other nodes: expand
    setExpandedNodeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id]; // keep last two
      return [...prev, id];
    });
    setFocusedNodeId(id);
  }, [nodes, zoomToNode]);

  // ── Click on backdrop of expanded view ────────────────────

  const handleExpandedBackdropClick = useCallback(() => {
    setExpandedNodeIds([]);
    setFocusedNodeId(null);
  }, []);

  // ── Canvas click (deselect) ────────────────────────────────

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-id]')) return;
    setFocusedNodeId(null);
    setContextMenu(null);
    setSelectionToolbar(null);
  }, []);

  // ── Context menu ───────────────────────────────────────────

  const handleContextMenu = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: node.id,
      nodeType: node.type,
    });
  }, []);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-id]')) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  // ── Generate unique ID ─────────────────────────────────────

  const genId = useCallback(() => `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);

  // ── Context menu actions ───────────────────────────────────

  const handleContextAction = useCallback((action: string, nodeId?: string) => {
    const canvasNode = nodeId ? nodes.find((n) => n.id === nodeId) : null;

    switch (action) {
      case 'add-document': {
        // Open sidebar to select docs for this chapter
        if (canvasNode?.nodeId) {
          setSidebarNodeId(nodeId ?? null);
          setSidebarOpen(true);
        }
        break;
      }

      case 'ai-chat': {
        if (!canvasNode) break;
        // Find the doc content
        const chapterNode = mindmapNodes.find((n) => n.id === canvasNode.nodeId);
        const doc = chapterNode?.documents.find((d) => d.id === canvasNode.docId);
        const paragraphs = canvasNode.docType === 'text'
          ? (documentTextContent[canvasNode.docId ?? ''] ?? [])
          : [videoTranscripts[canvasNode.docId ?? ''] ?? ''];
        const aiText = `AI đang phân tích tài liệu "${canvasNode.title}"...\n\nĐây là tóm tắt: ${paragraphs[0]?.slice(0, 200) ?? ''}...`;

        const newNode: CanvasNode = {
          id: genId(),
          type: 'ai-response',
          title: `AI: ${canvasNode.title.slice(0, 30)}`,
          content: aiText,
          x: canvasNode.x + 220,
          y: canvasNode.y + 60,
          width: 190,
          height: 50,
          parentId: canvasNode.id,
        };
        setNodes((prev) => [...prev, newNode]);
        setEdges((prev) => [...prev, { from: canvasNode.id, to: newNode.id }]);
        break;
      }

      case 'ai-review': {
        if (!canvasNode) break;
        const reviewText = 'Đây là nội dung ôn tập được tạo từ tài liệu. Bao gồm quiz, flashcard và câu hỏi tự luận.';
        const newNode: CanvasNode = {
          id: genId(),
          type: 'ai-response',
          title: `Ôn tập: ${canvasNode.title.slice(0, 25)}`,
          content: reviewText,
          x: canvasNode.x + 220,
          y: canvasNode.y - 60,
          width: 190,
          height: 50,
          parentId: canvasNode.id,
        };
        setNodes((prev) => [...prev, newNode]);
        setEdges((prev) => [...prev, { from: canvasNode.id, to: newNode.id }]);
        // Open expanded review
        setExpandedNodeIds([newNode.id]);
        break;
      }

      case 'open-read': {
        if (canvasNode) {
          setExpandedNodeIds([canvasNode.id]);
          setFocusedNodeId(canvasNode.id);
        }
        break;
      }

      case 'create-child': {
        if (!canvasNode) break;
        const childNode: CanvasNode = {
          id: genId(),
          type: canvasNode.type === 'ai-response' ? 'ai-response' : 'note',
          title: `Kế thừa từ: ${canvasNode.title.slice(0, 25)}`,
          content: '',
          x: canvasNode.x + 230,
          y: canvasNode.y + 30,
          width: 190,
          height: 50,
          parentId: canvasNode.id,
        };
        setNodes((prev) => [...prev, childNode]);
        setEdges((prev) => [...prev, { from: canvasNode.id, to: childNode.id }]);
        break;
      }

      case 'add-topic': {
        const newTopic: CanvasNode = {
          id: genId(),
          type: 'chapter',
          title: 'Chủ đề mới',
          x: 500 - transform.x / transform.scale,
          y: 350 - transform.y / transform.scale,
          width: 180,
          height: 44,
          parentId: 'topic-root',
        };
        setNodes((prev) => [...prev, newTopic]);
        setEdges((prev) => [...prev, { from: 'topic-root', to: newTopic.id }]);
        break;
      }

      case 'add-note': {
        const newNote: CanvasNode = {
          id: genId(),
          type: 'note',
          title: 'Ghi chú mới',
          content: '',
          x: 500 - transform.x / transform.scale,
          y: 380 - transform.y / transform.scale,
          width: 160,
          height: 44,
        };
        setNodes((prev) => [...prev, newNote]);
        break;
      }

      case 'delete-node': {
        if (!nodeId) break;
        setNodes((prev) => prev.filter((n) => n.id !== nodeId));
        setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
        setExpandedNodeIds((prev) => prev.filter((id) => id !== nodeId));
        if (focusedNodeId === nodeId) setFocusedNodeId(null);
        break;
      }

      case 'change-color': {
        // Cycle through a few colors
        const colors = ['#EDFAF4', '#FEF3C7', '#DBEAFE', '#FCE7F3', '#F3F4F6'];
        const borders = ['#3DBE7A', '#F59E0B', '#60A5FA', '#F472B6', '#9CA3AF'];
        const currentIdx = colors.indexOf(canvasNode?.color ?? '#EDFAF4');
        const nextIdx = (currentIdx + 1) % colors.length;
        if (nodeId) {
          setNodes((prev) =>
            prev.map((n) =>
              n.id === nodeId ? { ...n, color: colors[nextIdx] } : n
            )
          );
        }
        break;
      }
    }
  }, [nodes, genId, transform, focusedNodeId]);

  // ── Document sidebar apply ─────────────────────────────────

  const handleSidebarApply = useCallback((mindmapNodeId: string, contentNodes: ContentNodeUI[]) => {
    const chapterCanvasNode = nodes.find(
      (n) => n.type === 'chapter' && n.nodeId === mindmapNodeId
    );
    if (!chapterCanvasNode) return;

    const chapterMindmapNode = mindmapNodes.find((n) => n.id === mindmapNodeId);

    const newNodes: CanvasNode[] = contentNodes.map((cn, i) => {
      const originalDoc = chapterMindmapNode?.documents.find((d) => d.id === cn.docId);
      return {
        id: genId() + '-' + i,
        type: 'document' as const,
        title: cn.label,
        docId: cn.docId,
        docType: originalDoc?.type === 'video' ? 'video' : 'text',
        nodeId: mindmapNodeId,
        x: chapterCanvasNode.x + 210,
        y: chapterCanvasNode.y + (i * 60) - ((contentNodes.length - 1) * 30),
        width: 200,
        height: 44,
        parentId: chapterCanvasNode.id,
      };
    });

    const newEdges = newNodes.map((n) => ({ from: chapterCanvasNode.id, to: n.id }));

    setNodes((prev) => [...prev, ...newNodes]);
    setEdges((prev) => [...prev, ...newEdges]);
    setSidebarOpen(false);
    setSidebarNodeId(null);
  }, [nodes, genId]);

  // ── Text selection → node ──────────────────────────────────

  const handleMouseUp = useCallback((e: MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Find source node via data-node-id
      let el: Node | null = range.startContainer;
      let sourceNodeId: string | null = null;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement) {
          const id = el.getAttribute('data-node-id');
          if (id) { sourceNodeId = id; break; }
          // check inside expanded view
          const expandedId = el.closest('[data-expanded-node-id]');
          if (expandedId) {
            sourceNodeId = (expandedId as HTMLElement).getAttribute('data-expanded-node-id');
            break;
          }
        }
        el = el.parentNode;
      }

      if (sourceNodeId) {
        setSelectionToolbar({
          x: rect.left + rect.width / 2,
          y: rect.top,
          text: selection.toString(),
          sourceNodeId,
        });
      }
    } else {
      setSelectionToolbar(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  const handleCreateNodeFromSelection = useCallback(() => {
    if (!selectionToolbar) return;
    const sourceNode = nodes.find((n) => n.id === selectionToolbar.sourceNodeId);
    const newNote: CanvasNode = {
      id: genId(),
      type: 'note',
      title: selectionToolbar.text.slice(0, 60),
      content: selectionToolbar.text,
      x: (sourceNode?.x ?? 400) + 230,
      y: (sourceNode?.y ?? 300) + 80,
      width: 200,
      height: 50,
      parentId: selectionToolbar.sourceNodeId,
    };
    setNodes((prev) => [...prev, newNote]);
    setEdges((prev) => [...prev, { from: selectionToolbar.sourceNodeId, to: newNote.id }]);
    window.getSelection()?.removeAllRanges();
    setSelectionToolbar(null);
  }, [selectionToolbar, nodes, genId]);

  // ── Zoom controls ──────────────────────────────────────────

  const zoomIn = () => setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }));
  const zoomOut = () => setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale / 1.2) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // ── Close expanded node ────────────────────────────────────

  const handleCloseExpanded = useCallback((id: string) => {
    setExpandedNodeIds((prev) => prev.filter((x) => x !== id));
    if (focusedNodeId === id) setFocusedNodeId(null);
  }, [focusedNodeId]);

  // ── Create AI node from expanded doc ──────────────────────

  const handleCreateAINode = useCallback((sourceNodeId: string, type: 'ai-response' | 'review') => {
    const sourceNode = nodes.find((n) => n.id === sourceNodeId);
    if (!sourceNode) return;
    const text = type === 'ai-response'
      ? 'AI đang phân tích tài liệu...'
      : 'Nội dung ôn tập đã sẵn sàng. Quiz, flashcard và bài tập tự luận.';
    const newNode: CanvasNode = {
      id: genId(),
      type: 'ai-response',
      title: `${type === 'review' ? 'Ôn tập' : 'AI'}: ${sourceNode.title.slice(0, 25)}`,
      content: text,
      x: sourceNode.x + 230,
      y: sourceNode.y + (type === 'review' ? -60 : 60),
      width: 190,
      height: 50,
      parentId: sourceNodeId,
    };
    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { from: sourceNodeId, to: newNode.id }]);
  }, [nodes, genId]);

  // ── Get the sidebar's mindmap nodeId ──────────────────────
  const sidebarMindmapNodeId = sidebarNodeId
    ? nodes.find((n) => n.id === sidebarNodeId)?.nodeId ?? null
    : null;

  // ── Canvas size (infinite feel) ────────────────────────────
  const CANVAS_W = 3000;
  const CANVAS_H = 2400;

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full">
      {/* Main canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-full mindmap-bg overflow-hidden rounded-2xl border-2 border-[#333333] select-none"
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
      >
        {/* Transform layer */}
        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            width: CANVAS_W,
            height: CANVAS_H,
            position: 'relative',
            willChange: 'transform',
            transition: isPanning.current ? 'none' : 'transform 0.05s',
          }}
        >
          {/* SVG edges */}
          <svg
            width={CANVAS_W}
            height={CANVAS_H}
            style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}
          >
            {edges.map((edge) => {
              const fromNode = nodes.find((n) => n.id === edge.from);
              const toNode = nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              const color = EDGE_COLORS[fromNode.type] ?? '#818CF8';
              return (
                <BezierEdge
                  key={`${edge.from}-${edge.to}`}
                  fromNode={fromNode}
                  toNode={toNode}
                  color={color}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node) => (
              <DraggableNode
                key={node.id}
                node={node}
                isExpanded={expandedNodeIds.includes(node.id)}
                isFocused={focusedNodeId === node.id}
                onDrag={handleNodeDrag}
                onClick={handleNodeClick}
                onContextMenu={handleContextMenu}
                scale={transform.scale}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Zoom controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
          {[
            { icon: <Plus size={13} />, action: zoomIn, title: 'Phóng to' },
            { icon: <Minus size={13} />, action: zoomOut, title: 'Thu nhỏ' },
            { icon: <RotateCcw size={12} />, action: resetView, title: 'Đặt lại' },
          ].map(({ icon, action, title }) => (
            <button
              key={title}
              title={title}
              onClick={action}
              className="w-8 h-8 rounded-lg bg-white border-2 border-[#333333] flex items-center justify-center text-[#333333] hover:bg-[#F1F1EC] transition-colors shadow-sm cursor-pointer"
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Zoom indicator */}
        <div className="absolute bottom-3 left-3 text-[11px] text-[#5A5C58] bg-white/80 px-2.5 py-1 rounded-lg border border-[#CCCCCC]">
          {Math.round(transform.scale * 100)}%
        </div>

        {/* Hint */}
        <div className="absolute bottom-3 right-14 text-[11px] text-[#9CA3AF] bg-white/60 px-2.5 py-1 rounded-lg border border-[#E5E5DF]">
          Chuột phải để thêm tài liệu · Kéo để di chuyển · Scroll để zoom
        </div>
      </div>

      {/* Document Sidebar (right panel) */}
      <AnimatePresence>
        {sidebarOpen && sidebarMindmapNodeId && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute top-0 right-0 h-full z-30"
            style={{ width: 380 }}
          >
            <DocumentSidebar
              nodeId={sidebarMindmapNodeId}
              onClose={() => { setSidebarOpen(false); setSidebarNodeId(null); }}
              onApply={handleSidebarApply}
              onOpenDocument={(docId, nodeId) => {
                // Find canvas node for this doc
                const cn = nodes.find((n) => n.type === 'document' && n.docId === docId);
                if (cn) {
                  setExpandedNodeIds([cn.id]);
                  setFocusedNodeId(cn.id);
                }
                setSidebarOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context menu (fixed position, outside canvas transform) */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            menu={contextMenu}
            onAction={handleContextAction}
            onClose={() => setContextMenu(null)}
          />
        )}
      </AnimatePresence>

      {/* Selection toolbar */}
      <AnimatePresence>
        {selectionToolbar && (
          <SelectionToolbar
            toolbar={selectionToolbar}
            onCreate={handleCreateNodeFromSelection}
            onClose={() => setSelectionToolbar(null)}
          />
        )}
      </AnimatePresence>

      {/* Expanded view overlay */}
      <AnimatePresence>
        {expandedNodeIds.length > 0 && (
          <div
            className="fixed inset-0 z-50"
            onClick={handleExpandedBackdropClick}
          >
            <ExpandedView
              expandedNodeIds={expandedNodeIds}
              nodes={nodes}
              onClose={handleCloseExpanded}
              onCreateAINode={handleCreateAINode}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
