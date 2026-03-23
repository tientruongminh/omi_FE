'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import { mindmapNodes, documentTextContent, videoTranscripts, unitSummaries, additionalUnits } from '../../data/learning-data';
import { CanvasNode, CanvasEdge, ContextMenuState, SelectionToolbarState, ContentNodeUI } from './types';
import { CANVAS_W, CANVAS_H } from './constants';
import CanvasNodeComponent from './CanvasNode';
import { EdgeLayer } from './CanvasEdge';
import ZoomControls from './ZoomControls';
import ZoomIndicator from './ZoomIndicator';
import CanvasHint from './CanvasHint';
import ContextMenuComponent from './ContextMenu';
import AddUnitMenu from './AddUnitMenu';
import SelectionToolbarComponent from './SelectionToolbar';

// ─── Layout builders ────────────────────────────────────────

export function buildUnitLayout(unitId: string): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const unit = mindmapNodes.find((n) => n.id === unitId);
  const summary = unitSummaries[unitId] ?? 'Đơn vị học này chứa các tài liệu và bài học quan trọng.';
  const mainNode: CanvasNode = {
    id: `unit-${unitId}`, type: 'topic', title: unit?.label ?? unitId,
    summary, nodeId: unitId, x: 370, y: 305, width: 260, height: 90,
  };
  return { nodes: [mainNode], edges: [] };
}

export function buildInitialNodes(): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const CENTER_X = 600; const CENTER_Y = 400; const RADIUS = 270;
  const angles = [-90, -45, 0, 45, 90, 135, 180];
  const topicNode: CanvasNode = {
    id: 'topic-root', type: 'topic', title: 'Hệ Điều Hành và Linux',
    summary: 'Khóa học toàn diện về hệ điều hành Linux — từ khái niệm cơ bản đến lập trình shell nâng cao.',
    x: CENTER_X - 110, y: CENTER_Y - 30, width: 220, height: 60,
  };
  const nodes: CanvasNode[] = [topicNode];
  const edges: CanvasEdge[] = [];
  mindmapNodes.forEach((mn, i) => {
    const angle = (angles[i] ?? (i * 51.4)) * (Math.PI / 180);
    const chapterNode: CanvasNode = {
      id: `chapter-${mn.id}`, type: 'chapter', title: mn.label, nodeId: mn.id,
      x: CENTER_X + Math.cos(angle) * RADIUS - 90,
      y: CENTER_Y + Math.sin(angle) * RADIUS - 22,
      width: 180, height: 44,
    };
    nodes.push(chapterNode);
    edges.push({ from: 'topic-root', to: chapterNode.id });
  });
  return { nodes, edges };
}

// ─── Props ──────────────────────────────────────────────────

interface Props {
  unitId?: string;
  projectId?: string;
  onNodeClickForSidebar?: (nodeId: string, canvasNodeId: string) => void;
  onOpenDocument?: (docId: string, nodeId: string) => void;
}

export default function InfiniteCanvasCore({ unitId, projectId, onNodeClickForSidebar, onOpenDocument }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const initialData = useMemo(() => unitId ? buildUnitLayout(unitId) : buildInitialNodes(), [unitId]);
  const [nodes, setNodes] = useState<CanvasNode[]>(initialData.nodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialData.edges);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarState | null>(null);
  const [addUnitMenuState, setAddUnitMenuState] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const genId = useCallback(() => `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);

  // ── Reset on unitId change ─────────────────────────────────
  useEffect(() => {
    const data = unitId ? buildUnitLayout(unitId) : buildInitialNodes();
    setNodes(data.nodes); setEdges(data.edges);
    setExpandedNodeIds([]); setFocusedNodeId(null); setCollapsedNodeIds(new Set());
  }, [unitId]);

  // ── Collapse helpers ────────────────────────────────────────
  const isNodeHidden = useCallback((nodeId: string): boolean => {
    let current = nodes.find((n) => n.id === nodeId);
    while (current?.parentId) {
      if (collapsedNodeIds.has(current.parentId)) return true;
      current = nodes.find((n) => n.id === current!.parentId);
    }
    return false;
  }, [nodes, collapsedNodeIds]);

  const hasChildren = useCallback((nodeId: string) => nodes.some((n) => n.parentId === nodeId), [nodes]);
  const toggleCollapse = useCallback((nodeId: string) => setCollapsedNodeIds((prev) => {
    const next = new Set(prev); if (next.has(nodeId)) next.delete(nodeId); else next.add(nodeId); return next;
  }), []);

  // ── Zoom ────────────────────────────────────────────────────
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform((t) => ({ ...t, scale: Math.min(2.5, Math.max(0.3, t.scale * delta)) }));
  }, []);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const zoomIn = () => setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }));
  const zoomOut = () => setTransform((t) => ({ ...t, scale: Math.max(0.3, t.scale / 1.2) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  // ── Pan ──────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x; const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  // ── Node drag ───────────────────────────────────────────────
  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) =>
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)), []);

  // ── Node click ──────────────────────────────────────────────
  const handleNodeClick = useCallback((id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    if ((node.type === 'topic' || node.type === 'chapter') && node.nodeId) {
      setFocusedNodeId(id);
      onNodeClickForSidebar?.(node.nodeId, id);
      return;
    }
    setExpandedNodeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setFocusedNodeId(id);
  }, [nodes, onNodeClickForSidebar]);

  // ── Context menu ────────────────────────────────────────────
  const handleContextMenu = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId: node.id, nodeType: node.type, hasChildren: hasChildren(node.id), isCollapsed: collapsedNodeIds.has(node.id) });
  }, [hasChildren, collapsedNodeIds]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    e.preventDefault();
    const t = transformRef.current;
    const canvasX = (e.clientX - t.x) / t.scale;
    const canvasY = (e.clientY - t.y) / t.scale;
    setContextMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY });
  }, []);

  // ── Context actions ─────────────────────────────────────────
  const handleContextAction = useCallback((action: string, nodeId?: string) => {
    const target = nodeId ? nodes.find((n) => n.id === nodeId) : null;
    const cx = contextMenu?.canvasX ?? 500; const cy = contextMenu?.canvasY ?? 350;
    switch (action) {
      case 'add-document': if (target?.nodeId) onNodeClickForSidebar?.(target.nodeId, target.id); break;
      case 'open-read': if (target) { setExpandedNodeIds([target.id]); setFocusedNodeId(target.id); } break;
      case 'ai-chat': case 'ai-review': {
        if (!target) break;
        const paragraphs = target.docType === 'text' ? (documentTextContent[target.docId ?? ''] ?? []) : [videoTranscripts[target.docId ?? ''] ?? ''];
        const aiText = action === 'ai-chat' ? `AI đang phân tích "${target.title}"...\n\n${paragraphs[0]?.slice(0, 200) ?? ''}...` : 'Nội dung ôn tập được tạo. Bao gồm quiz, flashcard và câu hỏi tự luận.';
        const newNode: CanvasNode = { id: genId(), type: 'ai-response', title: `${action === 'ai-chat' ? 'AI' : 'Ôn tập'}: ${target.title.slice(0, 25)}`, content: aiText, x: target.x + 220, y: action === 'ai-review' ? target.y - 60 : target.y + 60, width: 190, height: 50, parentId: target.id };
        setNodes((p) => [...p, newNode]); setEdges((p) => [...p, { from: target.id, to: newNode.id }]);
        if (action === 'ai-review') { setExpandedNodeIds([newNode.id]); }
        break;
      }
      case 'create-child': {
        if (!target) break;
        const child: CanvasNode = { id: genId(), type: target.type === 'ai-response' ? 'ai-response' : 'note', title: `Kế thừa từ: ${target.title.slice(0, 25)}`, content: '', x: target.x + 230, y: target.y + 30, width: 190, height: 50, parentId: target.id };
        setNodes((p) => [...p, child]); setEdges((p) => [...p, { from: target.id, to: child.id }]);
        break;
      }
      case 'add-topic': { const n: CanvasNode = { id: genId(), type: 'chapter', title: 'Chủ đề mới', x: cx, y: cy, width: 180, height: 44 }; setNodes((p) => [...p, n]); break; }
      case 'add-note': { const n: CanvasNode = { id: genId(), type: 'note', title: 'Ghi chú mới', content: '', x: cx, y: cy, width: 160, height: 44 }; setNodes((p) => [...p, n]); break; }
      case 'add-synthesis': { const n: CanvasNode = { id: genId(), type: 'synthesis', title: 'Tổng hợp kiến thức', content: '', x: cx, y: cy, width: 220, height: 60, synthSourceIds: [] }; setNodes((p) => [...p, n]); break; }
      case 'collapse-node': case 'expand-node': if (nodeId) toggleCollapse(nodeId); break;
      case 'delete-node': {
        if (!nodeId) break;
        setNodes((p) => p.filter((n) => n.id !== nodeId));
        setEdges((p) => p.filter((e) => e.from !== nodeId && e.to !== nodeId));
        setExpandedNodeIds((p) => p.filter((id) => id !== nodeId));
        if (focusedNodeId === nodeId) setFocusedNodeId(null);
        break;
      }
    }
  }, [nodes, contextMenu, genId, focusedNodeId, toggleCollapse, onNodeClickForSidebar, documentTextContent, videoTranscripts]);

  // ── Add unit from menu ──────────────────────────────────────
  const handleAddUnit = useCallback((uid: string, label: string, cx: number, cy: number) => {
    const summary = unitSummaries[uid] ?? '';
    const mainNode: CanvasNode = { id: genId(), type: 'topic', title: label, summary, nodeId: uid, x: cx, y: cy, width: 220, height: 80 };
    setNodes((p) => [...p, mainNode]);
  }, [genId]);

  // ── Sidebar apply ───────────────────────────────────────────
  const handleSidebarApply = useCallback((mindmapNodeId: string, contentNodes: ContentNodeUI[]) => {
    const parent = nodes.find((n) => (n.type === 'chapter' || n.type === 'topic') && n.nodeId === mindmapNodeId);
    if (!parent) return;
    const chapterData = mindmapNodes.find((n) => n.id === mindmapNodeId);
    const count = contentNodes.length;
    const newNodes: CanvasNode[] = contentNodes.map((cn, i) => {
      const originalDoc = chapterData?.documents.find((d) => d.id === cn.docId);
      const angle = count === 1 ? Math.PI / 2 : (Math.PI / (count + 1)) * (i + 1);
      return { id: genId() + '-' + i, type: 'document' as const, title: cn.label, docId: cn.docId, docType: originalDoc?.type === 'video' ? 'video' as const : 'text' as const, nodeId: mindmapNodeId, x: parent.x + parent.width / 2 + Math.cos(angle) * 220 - 100, y: parent.y + parent.height + Math.sin(angle) * 110 + 20, width: 200, height: 44, parentId: parent.id };
    });
    setNodes((p) => [...p, ...newNodes]);
    setEdges((p) => [...p, ...newNodes.map((n) => ({ from: parent.id, to: n.id }))]);
  }, [nodes, genId]);

  const visibleNodes = useMemo(() => nodes.filter((n) => !isNodeHidden(n.id)), [nodes, isNodeHidden]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-2xl border-2 border-[#333333] bg-[#F5F0EB]"
      style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-node-id]')) { setFocusedNodeId(null); setContextMenu(null); setSelectionToolbar(null); } }}
      onContextMenu={handleCanvasContextMenu}
    >
      {/* Dot-grid background */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #CCCCCC 1px, transparent 1px)`, backgroundSize: `${30 * transform.scale}px ${30 * transform.scale}px`, backgroundPosition: `${transform.x}px ${transform.y}px` }} />

      {/* Transform layer */}
      <div style={{ transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', position: 'absolute', width: CANVAS_W, height: CANVAS_H, willChange: 'transform' }}>
        <EdgeLayer edges={edges} nodes={nodes} isNodeHidden={isNodeHidden} width={CANVAS_W} height={CANVAS_H} />
        <AnimatePresence>
          {visibleNodes.map((node) => {
            const childCount = collapsedNodeIds.has(node.id) ? nodes.filter((n) => n.parentId === node.id).length : 0;
            return (
              <CanvasNodeComponent key={node.id} node={node} isExpanded={expandedNodeIds.includes(node.id)} isFocused={focusedNodeId === node.id} onDrag={handleNodeDrag} onClick={handleNodeClick} onContextMenu={handleContextMenu} scale={transform.scale} collapsedChildCount={childCount} />
            );
          })}
        </AnimatePresence>
      </div>

      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
      <ZoomIndicator scale={transform.scale} />
      <CanvasHint />

      <AnimatePresence>
        {contextMenu && (
          <ContextMenuComponent menu={contextMenu} onAction={handleContextAction} onClose={() => setContextMenu(null)}
            onShowAddUnit={() => { setAddUnitMenuState({ x: contextMenu.x, y: contextMenu.y, canvasX: contextMenu.canvasX ?? 500, canvasY: contextMenu.canvasY ?? 350 }); setContextMenu(null); }}
          />
        )}
        {addUnitMenuState && (
          <AddUnitMenu {...addUnitMenuState} onAddUnit={handleAddUnit} onClose={() => setAddUnitMenuState(null)} />
        )}
        {selectionToolbar && (
          <SelectionToolbarComponent toolbar={selectionToolbar} onCreate={() => {}} onClose={() => setSelectionToolbar(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
