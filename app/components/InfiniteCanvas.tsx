'use client';

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, X, Send, MessageCircle, ClipboardList, Play, Pause, ChevronLeft } from 'lucide-react';
import {
  mindmapNodes,
  documentTextContent,
  videoTranscripts,
  unitSummaries,
  additionalUnits,
  type LearningDocument,
} from '@/lib/learning-data';
import DocumentSidebar from './DocumentSidebar';
import NodeAIChat from './NodeAIChat';
import NodeReview from './NodeReview';
import AIStreamText from './AIStreamText';

// ─── Types ────────────────────────────────────────────────────

export interface CanvasNode {
  id: string;
  type: 'topic' | 'chapter' | 'document' | 'ai-response' | 'note' | 'synthesis';
  title: string;
  content?: string;
  summary?: string; // for main topic/unit nodes
  docType?: 'text' | 'video';
  docId?: string;
  nodeId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  color?: string;
  synthSourceIds?: string[]; // for synthesis nodes
}

interface CanvasEdge {
  from: string;
  to: string;
}

interface ContextMenuState {
  x: number;
  y: number;
  canvasX?: number; // canvas-space position for placing nodes
  canvasY?: number;
  nodeId?: string;
  nodeType?: string;
  hasChildren?: boolean;
  isCollapsed?: boolean;
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
  topic:         { bg: '#E8D5F5', border: '#A855F7', textColor: '#4C1D95' },
  chapter:       { bg: '#EDFAF4', border: '#3DBE7A', textColor: '#1A4731' },
  document:      { bg: '#FFFFFF', border: '#E5DDD5', textColor: '#2D2D2D' },
  'ai-response': { bg: '#EEF2FF', border: '#818CF8', textColor: '#3730A3' },
  note:          { bg: '#FFFDE7', border: '#F59E0B', textColor: '#92400E' },
  synthesis:     { bg: '#FFFFFF', border: '#A855F7', textColor: '#2D2D2D' },
};

const EDGE_COLORS: Record<CanvasNode['type'], string> = {
  topic:         '#A855F7',
  chapter:       '#3DBE7A',
  document:      '#818CF8',
  'ai-response': '#818CF8',
  note:          '#F59E0B',
  synthesis:     '#A855F7',
};

// ─── Bezier path helper ───────────────────────────────────────

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const cx = (x1 + x2) / 2;
  return `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
}

// ─── Build unit-centric layout (when unitId provided) ─────────

function buildUnitLayout(unitId: string): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const unit = mindmapNodes.find((n) => n.id === unitId);
  const summary = unitSummaries[unitId] ?? 'Đơn vị học này chứa các tài liệu và bài học quan trọng về chủ đề này.';

  const CENTER_X = 500;
  const CENTER_Y = 350;

  const mainNode: CanvasNode = {
    id: `unit-${unitId}`,
    type: 'topic',
    title: unit?.label ?? unitId,
    summary,
    nodeId: unitId,
    x: CENTER_X - 130,
    y: CENTER_Y - 45,
    width: 260,
    height: 90,
  };

  return { nodes: [mainNode], edges: [] };
}

// ─── Build default layout (all chapters) ─────────────────────

function buildInitialNodes(): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const CENTER_X = 600;
  const CENTER_Y = 400;
  const RADIUS = 270;

  const angles = [-90, -45, 0, 45, 90, 135, 180];

  const topicNode: CanvasNode = {
    id: 'topic-root',
    type: 'topic',
    title: 'Hệ Điều Hành và Linux',
    summary: 'Khóa học toàn diện về hệ điều hành Linux — từ khái niệm cơ bản đến lập trình shell nâng cao.',
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
  collapsedChildCount?: number;
}

function DraggableNode({
  node,
  isExpanded,
  isFocused,
  onDrag,
  onClick,
  onContextMenu,
  scale,
  collapsedChildCount = 0,
}: DraggableNodeProps) {
  const style = NODE_STYLES[node.type];
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const isSynthesis = node.type === 'synthesis';
  const isMainTopic = node.type === 'topic' && node.summary;

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
    if (node.type === 'synthesis') return '⬡';
    if (node.type === 'document') return node.docType === 'video' ? '▶' : '◎';
    if (node.type === 'ai-response') return 'AI';
    if (node.type === 'note') return '✎';
    if (node.type === 'topic') return '◆';
    return null;
  };

  const icon = getIcon();

  // Synthesis gradient border via boxShadow trick
  const synthesisStyle = isSynthesis ? {
    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #A855F7, #22C55E) border-box',
    border: '2px solid transparent',
  } : {};

  return (
    <motion.div
      data-node-id={node.id}
      className="absolute rounded-xl cursor-pointer select-none"
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        backgroundColor: isSynthesis ? '#FFFFFF' : style.bg,
        border: isSynthesis ? '2px solid transparent' : `2px solid ${style.border}`,
        ...synthesisStyle,
        color: style.textColor,
        boxShadow: isFocused
          ? `0 0 0 3px ${style.border}, 0 8px 32px rgba(0,0,0,0.18)`
          : isSynthesis
          ? '0 4px 20px rgba(168,85,247,0.2)'
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
      <div className="flex flex-col h-full px-3 py-2 overflow-hidden justify-center">
        <div className="flex items-center gap-2">
          {icon && (
            <span className={`text-[11px] flex-shrink-0 leading-none font-bold ${isSynthesis ? 'text-purple-500' : ''}`} style={{ opacity: isSynthesis ? 1 : 0.6 }}>{icon}</span>
          )}
          <span
            className="text-[12.5px] font-semibold leading-tight truncate"
            style={{
              fontSize: node.type === 'topic' ? 14 : node.type === 'synthesis' ? 13 : 12.5,
              fontWeight: node.type === 'topic' || node.type === 'synthesis' ? 700 : 600,
            }}
          >
            {node.title}
          </span>
          {collapsedChildCount > 0 && (
            <span
              className="ml-auto flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.1)', color: style.textColor }}
            >
              +{collapsedChildCount}
            </span>
          )}
        </div>
        {/* Summary text for main topic nodes */}
        {isMainTopic && node.summary && (
          <p className="text-[10px] mt-1 leading-relaxed opacity-70 line-clamp-2" style={{ color: style.textColor }}>
            {node.summary}
          </p>
        )}
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

// ─── ExpandedDocContent ───────────────────────────────────────

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
        <span className="text-lg">{node.docType === 'video' ? '▶' : '◎'}</span>
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
          {/* Video mock placeholder */}
          <div
            className="w-full rounded-2xl overflow-hidden relative group cursor-pointer mb-4"
            style={{ aspectRatio: '16/9', background: '#1A1A2E' }}
            onClick={() => setPlaying((p) => !p)}
          >
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(129,140,248,0.4) 0%, rgba(79,70,229,0.2) 50%, #1A1A2E 100%)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <motion.div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                {playing ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-1" />}
              </motion.div>
              <p className="text-white/80 text-[12px] font-medium px-4 text-center">{node.title}</p>
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
        <span className="text-lg">✎</span>
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
        <span className="text-lg">AI</span>
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
              <div className="w-7 h-7 rounded-xl bg-white border border-[#A5B4FC] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">AI</div>
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

// ─── ExpandedSynthesisContent ─────────────────────────────────

function ExpandedSynthesisContent({ node, allNodes, onClose }: { node: CanvasNode; allNodes: CanvasNode[]; onClose: () => void }) {
  const sourceDocs = (node.synthSourceIds ?? [])
    .map(id => allNodes.find(n => n.id === id))
    .filter(Boolean) as CanvasNode[];

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/10 flex-shrink-0" style={{ background: 'linear-gradient(to right, #F5F3FF, #ECFDF5)' }}>
        <span className="text-lg">⬡</span>
        <div className="flex-1">
          <h3 className="font-bold text-[#2D2D2D] text-[14px]">{node.title}</h3>
          <p className="text-[11px] text-[#5A5C58]">Tổng hợp từ {sourceDocs.length} nguồn</p>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center cursor-pointer"><X size={13} /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
        {sourceDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="text-4xl">⬡</div>
            <p className="text-[#5A5C58] text-[13px] leading-relaxed max-w-xs">
              Kéo các node khác vào đây để tổng hợp kiến thức từ nhiều nguồn.
            </p>
          </div>
        ) : (
          sourceDocs.map((src, i) => (
            <div key={src.id} className="p-4 bg-[#F5F0EB] rounded-xl border border-[#E5E5DF]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{src.docType === 'video' ? '▶' : src.type === 'ai-response' ? '🤖' : '◎'}</span>
                <p className="text-[13px] font-bold text-[#2D2D2D]">{src.title}</p>
              </div>
              {src.content && (
                <p className="text-[12px] text-[#5A5C58] leading-relaxed line-clamp-3">{src.content}</p>
              )}
            </div>
          ))
        )}
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
          {node.type === 'synthesis' && (
            <ExpandedSynthesisContent node={node} allNodes={nodes} onClose={() => onClose(node.id)} />
          )}
          {(node.type === 'topic' || node.type === 'chapter') && (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
                <span className="text-lg">{node.type === 'topic' ? '◆' : '◇'}</span>
                <div className="flex-1">
                  <h3 className="font-bold text-[#2D2D2D] text-[15px]">{node.title}</h3>
                  {node.summary && <p className="text-[12px] text-[#5A5C58] mt-0.5">{node.summary}</p>}
                </div>
                <button onClick={() => onClose(node.id)} className="w-7 h-7 rounded-full bg-white border border-[#333333]/20 flex items-center justify-center cursor-pointer"><X size={13} /></button>
              </div>
              <div className="flex-1 flex items-center justify-center text-[#5A5C58] text-sm">
                {node.type === 'chapter' ? 'Nhấp chuột phải để thêm tài liệu →' : 'Nhấn vào để mở sidebar tài liệu'}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ─── Add Unit Menu ────────────────────────────────────────────

interface AddUnitMenuProps {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  onAddUnit: (unitId: string, unitLabel: string, cx: number, cy: number) => void;
  onClose: () => void;
}

function AddUnitMenu({ x, y, canvasX, canvasY, onAddUnit, onClose }: AddUnitMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [onClose]);

  const allUnits = [
    ...mindmapNodes.map(n => ({ id: n.id, label: n.label, subtitle: n.subtitle })),
    ...additionalUnits.map(u => ({ id: u.id, label: u.label, subtitle: u.summary })),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[70] bg-white border-2 border-[#333333] rounded-xl shadow-2xl overflow-hidden"
      style={{ left: x, top: y, width: 280, maxHeight: 360 }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-4 py-3 border-b border-[#CCCCCC] bg-[#F5F0EB]">
        <p className="text-[12px] font-bold text-[#2D2D2D]">Thêm đơn vị bài học</p>
        <p className="text-[10px] text-[#5A5C58]">Chọn để thêm vào canvas</p>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
        {allUnits.map((unit) => (
          <button
            key={unit.id}
            className="w-full text-left px-4 py-3 hover:bg-[#F5F0EB] transition-colors border-b border-[#F1F1EC] last:border-0"
            onClick={() => {
              onAddUnit(unit.id, unit.label, canvasX, canvasY);
              onClose();
            }}
          >
            <p className="text-[13px] font-semibold text-[#2D2D2D]">{unit.label}</p>
            <p className="text-[10px] text-[#5A5C58] leading-snug mt-0.5 line-clamp-2">{unit.subtitle}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── ContextMenu ──────────────────────────────────────────────

interface ContextMenuProps {
  menu: ContextMenuState;
  onAction: (action: string, nodeId?: string) => void;
  onClose: () => void;
  onShowAddUnit: () => void;
}

function ContextMenu({ menu, onAction, onClose, onShowAddUnit }: ContextMenuProps) {
  const items = useMemo(() => {
    if (!menu.nodeId) {
      return [
        { label: 'Thêm chủ đề mới', action: 'add-topic' },
        { label: 'Thêm ghi chú', action: 'add-note' },
        { label: 'Thêm đơn vị bài học', action: 'add-unit' },
        { label: 'Tạo node tổng hợp', action: 'add-synthesis' },
      ];
    }
    const baseItems: { label: string; action: string; danger?: boolean }[] = [];
    switch (menu.nodeType) {
      case 'topic':
        baseItems.push(
          { label: 'Mở tài liệu', action: 'open-read' },
        );
        break;
      case 'chapter':
        baseItems.push(
          { label: 'Thêm tài liệu', action: 'add-document' },
          { label: 'Đổi màu', action: 'change-color' },
        );
        break;
      case 'document':
        baseItems.push(
          { label: 'AI Ôn tập', action: 'ai-review' },
          { label: 'AI Hỏi đáp', action: 'ai-chat' },
          { label: 'Mở đọc', action: 'open-read' },
        );
        break;
      case 'synthesis':
        baseItems.push(
          { label: 'Mở tổng hợp', action: 'open-read' },
        );
        break;
      case 'ai-response':
      case 'note':
        baseItems.push({ label: 'Tạo node kế thừa', action: 'create-child' });
        break;
    }
    if (menu.hasChildren) {
      if (menu.isCollapsed) {
        baseItems.push({ label: 'Mở rộng', action: 'expand-node' });
      } else {
        baseItems.push({ label: 'Thu gọn', action: 'collapse-node' });
      }
    }
    baseItems.push({ label: 'Xóa', action: 'delete-node', danger: true });
    return baseItems;
  }, [menu.nodeId, menu.nodeType, menu.hasChildren, menu.isCollapsed]);

  useEffect(() => {
    const close = (e: MouseEvent) => { onClose(); };
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
            if (item.action === 'add-unit') {
              onShowAddUnit();
            } else {
              onAction(item.action, menu.nodeId);
              onClose();
            }
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

interface InfiniteCanvasProps {
  unitId?: string;
  projectId?: string;
}

export default function InfiniteCanvas({ unitId, projectId }: InfiniteCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Canvas transform
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  // Nodes & edges — depends on whether we have a unit context
  const initialData = useMemo(() => {
    if (unitId) return buildUnitLayout(unitId);
    return buildInitialNodes();
  }, [unitId]);

  const [nodes, setNodes] = useState<CanvasNode[]>(initialData.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialData.edges);

  // Interaction state
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarState | null>(null);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  // Unit-specific: show sidebar if coming from unit context
  const [sidebarOpen, setSidebarOpen] = useState(!!unitId);
  const [sidebarNodeId, setSidebarNodeId] = useState<string | null>(
    unitId ? `unit-${unitId}` : null
  );

  // Add unit menu
  const [addUnitMenu, setAddUnitMenu] = useState<{
    x: number; y: number; canvasX: number; canvasY: number;
  } | null>(null);

  // Reset when unitId changes
  useEffect(() => {
    const data = unitId ? buildUnitLayout(unitId) : buildInitialNodes();
    setNodes(data.nodes);
    setEdges(data.edges);
    setExpandedNodeIds([]);
    setFocusedNodeId(null);
    setCollapsedNodeIds(new Set());
    if (unitId) {
      setSidebarOpen(true);
      setSidebarNodeId(`unit-${unitId}`);
    } else {
      setSidebarOpen(false);
      setSidebarNodeId(null);
    }
  }, [unitId]);

  // ── Collapse/expand helpers ────────────────────────────────

  const getAllDescendantIds = useCallback((nodeId: string): string[] => {
    const result: string[] = [];
    const queue = [nodeId];
    while (queue.length) {
      const current = queue.shift()!;
      const children = nodes.filter((n) => n.parentId === current);
      for (const child of children) {
        result.push(child.id);
        queue.push(child.id);
      }
    }
    return result;
  }, [nodes]);

  const isNodeHidden = useCallback((nodeId: string): boolean => {
    let current = nodes.find((n) => n.id === nodeId);
    while (current?.parentId) {
      if (collapsedNodeIds.has(current.parentId)) return true;
      current = nodes.find((n) => n.id === current!.parentId);
    }
    return false;
  }, [nodes, collapsedNodeIds]);

  const hasChildren = useCallback((nodeId: string): boolean => {
    return nodes.some((n) => n.parentId === nodeId);
  }, [nodes]);

  const toggleCollapse = useCallback((nodeId: string) => {
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

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

    // Topic with unitId → open document sidebar
    if (node.type === 'topic' && node.nodeId) {
      setFocusedNodeId(id);
      zoomToNode(id);
      setSidebarNodeId(id);
      setSidebarOpen(true);
      return;
    }

    // Chapter nodes: open sidebar
    if (node.type === 'chapter' && node.nodeId) {
      setFocusedNodeId((prev) => (prev === id ? null : id));
      zoomToNode(id);
      setSidebarNodeId(id);
      setSidebarOpen(true);
      return;
    }

    // Other nodes: expand
    setExpandedNodeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
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
      hasChildren: hasChildren(node.id),
      isCollapsed: collapsedNodeIds.has(node.id),
    });
  }, [hasChildren, collapsedNodeIds]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-node-id]')) return;
    e.preventDefault();
    // Calculate canvas-space position
    const canvasX = (e.clientX - transformRef.current.x) / transformRef.current.scale;
    const canvasY = (e.clientY - transformRef.current.y) / transformRef.current.scale;
    setContextMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY });
  }, []);

  // ── Generate unique ID ─────────────────────────────────────

  const genId = useCallback(() => `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);

  // ── Add unit to canvas ────────────────────────────────────

  const handleAddUnit = useCallback((uid: string, label: string, cx: number, cy: number) => {
    const unit = mindmapNodes.find(m => m.id === uid);
    const summary = unitSummaries[uid] ?? '';

    const mainId = genId();
    const mainNode: CanvasNode = {
      id: mainId,
      type: 'topic',
      title: label,
      summary,
      nodeId: uid,
      x: cx,
      y: cy,
      width: 220,
      height: 80,
    };

    setNodes(prev => [...prev, mainNode]);
  }, [genId]);

  // ── Context menu actions ───────────────────────────────────

  const handleContextAction = useCallback((action: string, nodeId?: string) => {
    const canvasNode = nodeId ? nodes.find((n) => n.id === nodeId) : null;

    switch (action) {
      case 'add-document': {
        if (canvasNode?.nodeId) {
          setSidebarNodeId(nodeId ?? null);
          setSidebarOpen(true);
        }
        break;
      }

      case 'ai-chat': {
        if (!canvasNode) break;
        const chapterNode = mindmapNodes.find((n) => n.id === canvasNode.nodeId);
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
        const cx = contextMenu?.canvasX ?? 500;
        const cy = contextMenu?.canvasY ?? 350;
        const newTopic: CanvasNode = {
          id: genId(),
          type: 'chapter',
          title: 'Chủ đề mới',
          x: cx,
          y: cy,
          width: 180,
          height: 44,
          parentId: 'topic-root',
        };
        setNodes((prev) => [...prev, newTopic]);
        setEdges((prev) => [...prev, { from: 'topic-root', to: newTopic.id }]);
        break;
      }

      case 'add-note': {
        const cx = contextMenu?.canvasX ?? 500;
        const cy = contextMenu?.canvasY ?? 380;
        const newNote: CanvasNode = {
          id: genId(),
          type: 'note',
          title: 'Ghi chú mới',
          content: '',
          x: cx,
          y: cy,
          width: 160,
          height: 44,
        };
        setNodes((prev) => [...prev, newNote]);
        break;
      }

      case 'add-synthesis': {
        const cx = contextMenu?.canvasX ?? 500;
        const cy = contextMenu?.canvasY ?? 350;
        const synthNode: CanvasNode = {
          id: genId(),
          type: 'synthesis',
          title: 'Tổng hợp kiến thức',
          content: '',
          x: cx,
          y: cy,
          width: 220,
          height: 60,
          synthSourceIds: [],
        };
        setNodes((prev) => [...prev, synthNode]);
        break;
      }

      case 'collapse-node': {
        if (nodeId) toggleCollapse(nodeId);
        break;
      }

      case 'expand-node': {
        if (nodeId) toggleCollapse(nodeId);
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
        const colors = ['#EDFAF4', '#FEF3C7', '#DBEAFE', '#FCE7F3', '#F3F4F6'];
        const currentIdx = colors.indexOf(canvasNode?.color ?? '#EDFAF4');
        const nextIdx = (currentIdx + 1) % colors.length;
        if (nodeId) {
          setNodes((prev) =>
            prev.map((n) => n.id === nodeId ? { ...n, color: colors[nextIdx] } : n)
          );
        }
        break;
      }
    }
  }, [nodes, genId, contextMenu, focusedNodeId, toggleCollapse]);

  // ── Document sidebar apply ─────────────────────────────────

  const handleSidebarApply = useCallback((mindmapNodeId: string, contentNodes: ContentNodeUI[]) => {
    // Find the canvas node that is either 'chapter' or 'topic' for this mindmap node
    const parentCanvasNode = nodes.find(
      (n) => (n.type === 'chapter' || n.type === 'topic') && n.nodeId === mindmapNodeId
    );
    if (!parentCanvasNode) return;

    const chapterMindmapNode = mindmapNodes.find((n) => n.id === mindmapNodeId);
    const count = contentNodes.length;

    const newNodes: CanvasNode[] = contentNodes.map((cn, i) => {
      const originalDoc = chapterMindmapNode?.documents.find((d) => d.id === cn.docId);
      // Fan/arc layout below the parent node
      const angle = count === 1 ? Math.PI / 2 : (Math.PI / (count + 1)) * (i + 1);
      const radius = 220;
      const fanX = parentCanvasNode.x + parentCanvasNode.width / 2 + Math.cos(angle) * radius - 100;
      const fanY = parentCanvasNode.y + parentCanvasNode.height + Math.sin(angle) * radius * 0.5 + 20;

      return {
        id: genId() + '-' + i,
        type: 'document' as const,
        title: cn.label,
        docId: cn.docId,
        docType: originalDoc?.type === 'video' ? 'video' : 'text',
        nodeId: mindmapNodeId,
        x: fanX,
        y: fanY,
        width: 200,
        height: 44,
        parentId: parentCanvasNode.id,
      };
    });

    const newEdges = newNodes.map((n) => ({ from: parentCanvasNode.id, to: n.id }));

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

      let el: Node | null = range.startContainer;
      let sourceNodeId: string | null = null;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement) {
          const id = el.getAttribute('data-node-id');
          if (id) { sourceNodeId = id; break; }
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

  // ── Get sidebar mindmap node ID ────────────────────────────
  const sidebarMindmapNodeId = sidebarNodeId
    ? nodes.find((n) => n.id === sidebarNodeId)?.nodeId ?? null
    : null;

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
              if (isNodeHidden(edge.from) || isNodeHidden(edge.to)) return null;
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
            {nodes.map((node) => {
              if (isNodeHidden(node.id)) return null;
              const childCount = collapsedNodeIds.has(node.id) ? getAllDescendantIds(node.id).length : 0;
              return (
                <DraggableNode
                  key={node.id}
                  node={node}
                  isExpanded={expandedNodeIds.includes(node.id)}
                  isFocused={focusedNodeId === node.id}
                  onDrag={handleNodeDrag}
                  onClick={handleNodeClick}
                  onContextMenu={handleContextMenu}
                  scale={transform.scale}
                  collapsedChildCount={childCount}
                />
              );
            })}
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
          Chuột phải để thêm · Kéo để di chuyển · Scroll để zoom
        </div>

        {/* Unit context indicator */}
        {unitId && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-[#E8D5F5] border-2 border-[#A855F7] rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-[#4C1D95]">◆ {mindmapNodes.find(n => n.id === unitId)?.label ?? unitId}</span>
          </div>
        )}
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

      {/* Context menu */}
      <AnimatePresence>
        {contextMenu && (
          <ContextMenu
            menu={contextMenu}
            onAction={handleContextAction}
            onClose={() => setContextMenu(null)}
            onShowAddUnit={() => {
              if (contextMenu) {
                setAddUnitMenu({
                  x: contextMenu.x,
                  y: contextMenu.y,
                  canvasX: contextMenu.canvasX ?? 500,
                  canvasY: contextMenu.canvasY ?? 350,
                });
                setContextMenu(null);
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Add unit menu */}
      <AnimatePresence>
        {addUnitMenu && (
          <AddUnitMenu
            x={addUnitMenu.x}
            y={addUnitMenu.y}
            canvasX={addUnitMenu.canvasX}
            canvasY={addUnitMenu.canvasY}
            onAddUnit={handleAddUnit}
            onClose={() => setAddUnitMenu(null)}
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
