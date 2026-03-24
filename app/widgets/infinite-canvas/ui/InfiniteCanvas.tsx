'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { mindmapNodes, documentTextContent, videoTranscripts, unitSummaries, additionalUnits } from '@/entities/learning-content';
import { CanvasNode, CanvasEdge, ContextMenuState, SelectionToolbarState, ContentNodeUI } from '../model/types';
import { CANVAS_W, CANVAS_H } from '../model/constants';
import CanvasNodeComponent from '@/entities/node/ui/CanvasNode';
import { EdgeLayer } from './CanvasEdge';
import ZoomControls from './ZoomControls';
import ZoomIndicator from './ZoomIndicator';
import CanvasHint from './CanvasHint';
import ContextMenuComponent from './ContextMenu';
import AddUnitMenu from './AddUnitMenu';
import SelectionToolbarComponent from './SelectionToolbar';
import ColorPicker from './ColorPicker';
import DocumentSidebar from './DocumentSidebar';
import ExpandedNodeView from './ExpandedNodeView';

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

// ─── Edge drawing state ─────────────────────────────────────
interface DrawingEdge {
  fromNodeId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
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
  const [colorPicker, setColorPicker] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  
  // DocumentSidebar state
  const [sidebarNodeId, setSidebarNodeId] = useState<string | null>(null);
  
  // Edge drawing state
  const [drawingEdge, setDrawingEdge] = useState<DrawingEdge | null>(null);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const genId = useCallback(() => `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, []);

  // ── Reset on unitId change ─────────────────────────────────
  useEffect(() => {
    const data = unitId ? buildUnitLayout(unitId) : buildInitialNodes();
    setNodes(data.nodes); setEdges(data.edges);
    setExpandedNodeIds([]); setFocusedNodeId(null); setCollapsedNodeIds(new Set());
    setSidebarNodeId(null);
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
    if (drawingEdge) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  }, [drawingEdge]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // Handle edge drawing
    if (drawingEdge) {
      const t = transformRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const canvasX = (e.clientX - rect.left - t.x) / t.scale;
      const canvasY = (e.clientY - rect.top - t.y) / t.scale;
      setDrawingEdge((prev) => prev ? { ...prev, toX: canvasX, toY: canvasY } : null);
      return;
    }
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x; const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, [drawingEdge]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    isPanning.current = false;
    if (drawingEdge) {
      // Find target node under cursor
      const t = transformRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const canvasX = (e.clientX - rect.left - t.x) / t.scale;
        const canvasY = (e.clientY - rect.top - t.y) / t.scale;
        const targetNode = nodes.find((n) =>
          n.id !== drawingEdge.fromNodeId &&
          canvasX >= n.x && canvasX <= n.x + n.width &&
          canvasY >= n.y && canvasY <= n.y + n.height
        );
        if (targetNode) {
          // Check if edge already exists
          const exists = edges.some((e) =>
            (e.from === drawingEdge.fromNodeId && e.to === targetNode.id) ||
            (e.from === targetNode.id && e.to === drawingEdge.fromNodeId)
          );
          if (!exists) {
            setEdges((prev) => [...prev, { from: drawingEdge.fromNodeId, to: targetNode.id }]);
            // Also add to synthSourceIds if target is synthesis node
            if (targetNode.type === 'synthesis') {
              setNodes((prev) => prev.map((n) =>
                n.id === targetNode.id
                  ? { ...n, synthSourceIds: [...(n.synthSourceIds ?? []), drawingEdge.fromNodeId] }
                  : n
              ));
            }
            const fromNode = nodes.find((n) => n.id === drawingEdge.fromNodeId);
            if (fromNode?.type === 'synthesis') {
              setNodes((prev) => prev.map((n) =>
                n.id === fromNode.id
                  ? { ...n, synthSourceIds: [...(n.synthSourceIds ?? []), targetNode.id] }
                  : n
              ));
            }
          }
        }
      }
      setDrawingEdge(null);
    }
  }, [drawingEdge, nodes, edges]);

  // ── Start edge from handle ──────────────────────────────────
  const handleStartEdge = useCallback((nodeId: string, side: string, x: number, y: number) => {
    setDrawingEdge({ fromNodeId: nodeId, fromX: x, fromY: y, toX: x, toY: y });
  }, []);

  // ── Node drag ───────────────────────────────────────────────
  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) =>
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n)), []);

  // ── Update node content ─────────────────────────────────────
  const handleUpdateContent = useCallback((nodeId: string, content: string) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, content } : n));
  }, []);

  // ── Change node color ───────────────────────────────────────
  const handleChangeColor = useCallback((nodeId: string, bg: string, border: string) => {
    setNodes((prev) => prev.map((n) => n.id === nodeId ? { ...n, color: border, customBg: bg, customBorder: border } : n));
  }, []);

  // ── Node click ──────────────────────────────────────────────
  const handleNodeClick = useCallback((id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    
    // Topic/chapter → open DocumentSidebar
    if ((node.type === 'topic' || node.type === 'chapter') && node.nodeId) {
      setFocusedNodeId(id);
      setSidebarNodeId(node.nodeId);
      return;
    }
    
    // Note, AI, synthesis, document → expand panel
    setExpandedNodeIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setFocusedNodeId(id);
  }, [nodes]);

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

  // ── Sidebar apply (add documents to canvas) ─────────────────
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

  // ── Open document (from sidebar arrow icon) ─────────────────
  const handleOpenDocument = useCallback((docId: string, nodeId: string) => {
    // Find the canvas node for this document, or create one if it doesn't exist
    let docCanvasNode = nodes.find((n) => n.docId === docId);
    if (!docCanvasNode) {
      // Create a document node on the canvas
      const parent = nodes.find((n) => n.nodeId === nodeId);
      const chapterData = mindmapNodes.find((n) => n.id === nodeId);
      const doc = chapterData?.documents.find((d) => d.id === docId);
      if (doc && parent) {
        const newNode: CanvasNode = {
          id: genId(),
          type: 'document',
          title: doc.title,
          docId: doc.id,
          docType: doc.type === 'video' ? 'video' : 'text',
          nodeId: nodeId,
          x: parent.x + parent.width + 60,
          y: parent.y,
          width: 200,
          height: 44,
          parentId: parent.id,
        };
        setNodes((p) => [...p, newNode]);
        setEdges((p) => [...p, { from: parent.id, to: newNode.id }]);
        docCanvasNode = newNode;
      }
    }
    if (docCanvasNode) {
      // Expand it
      setExpandedNodeIds((prev) => {
        if (prev.includes(docCanvasNode!.id)) return prev;
        if (prev.length >= 2) return [prev[1], docCanvasNode!.id];
        return [...prev, docCanvasNode!.id];
      });
      setFocusedNodeId(docCanvasNode.id);
    }
  }, [nodes, genId]);

  // ── Context actions ─────────────────────────────────────────
  const handleContextAction = useCallback((action: string, nodeId?: string) => {
    const target = nodeId ? nodes.find((n) => n.id === nodeId) : null;
    const cx = contextMenu?.canvasX ?? 500; const cy = contextMenu?.canvasY ?? 350;
    switch (action) {
      case 'add-document': {
        if (target?.nodeId) setSidebarNodeId(target.nodeId);
        break;
      }
      case 'open-read': {
        if (target) {
          setExpandedNodeIds((prev) => prev.includes(target.id) ? prev : [...prev.slice(-1), target.id]);
          setFocusedNodeId(target.id);
        }
        break;
      }
      case 'change-color': {
        if (!nodeId) break;
        setColorPicker({ x: contextMenu?.x ?? 300, y: contextMenu?.y ?? 300, nodeId });
        break;
      }
      case 'ai-chat': case 'ai-review': {
        if (!target) break;
        // Gather context from connected nodes
        const connectedIds = edges
          .filter((e) => e.from === target.id || e.to === target.id)
          .map((e) => e.from === target.id ? e.to : e.from);
        const connectedNodes = nodes.filter((n) => connectedIds.includes(n.id));
        
        let contextText = '';
        if (target.content) contextText += target.content;
        connectedNodes.forEach((cn) => {
          if (cn.content) contextText += `\n\n[${cn.title}]: ${cn.content}`;
        });
        
        const paragraphs = target.docType === 'text' ? (documentTextContent[target.docId ?? ''] ?? []) : [videoTranscripts[target.docId ?? ''] ?? ''];
        const aiText = action === 'ai-chat'
          ? `AI đang phân tích "${target.title}"...\n\n${contextText || (paragraphs[0]?.slice(0, 200) ?? '')}...${connectedNodes.length > 0 ? `\n\n(Dựa trên ${connectedNodes.length} node liên kết)` : ''}`
          : 'Nội dung ôn tập được tạo. Bao gồm quiz, flashcard và câu hỏi tự luận.';
        const newNode: CanvasNode = { id: genId(), type: action === 'ai-chat' ? 'ai-chat' : 'ai-review', title: `${action === 'ai-chat' ? 'AI Hỏi đáp' : 'AI Ôn tập'}: ${target.title.slice(0, 25)}`, content: aiText, x: target.x + 220, y: action === 'ai-review' ? target.y - 60 : target.y + 60, width: 190, height: 50, parentId: target.id };
        setNodes((p) => [...p, newNode]);
        setEdges((p) => [...p, { from: target.id, to: newNode.id }]);
        setExpandedNodeIds((prev) => {
          if (prev.length >= 2) return [prev[prev.length - 1], newNode.id];
          return [...prev, newNode.id];
        });
        setFocusedNodeId(newNode.id);
        break;
      }
      case 'add-note': {
        const n: CanvasNode = { id: genId(), type: 'note', title: 'Ghi chú mới', content: '', x: cx, y: cy, width: 160, height: 44 };
        setNodes((p) => [...p, n]);
        // Auto-expand the note for editing
        setExpandedNodeIds((prev) => {
          if (prev.length >= 2) return [prev[1], n.id];
          return [...prev, n.id];
        });
        setFocusedNodeId(n.id);
        break;
      }
      case 'add-synthesis': {
        const n: CanvasNode = { id: genId(), type: 'synthesis', title: 'Tổng hợp kiến thức', content: '', x: cx, y: cy, width: 220, height: 60, synthSourceIds: [] };
        setNodes((p) => [...p, n]);
        break;
      }
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
  }, [nodes, edges, contextMenu, genId, focusedNodeId, toggleCollapse]);

  // ── Add unit from menu or submenu ───────────────────────────
  const handleAddUnit = useCallback((uid: string, label: string, cx: number, cy: number) => {
    const summary = unitSummaries[uid] ?? '';
    const mainNode: CanvasNode = { id: genId(), type: 'topic', title: label, summary, nodeId: uid, x: cx, y: cy, width: 220, height: 80 };
    setNodes((p) => [...p, mainNode]);
  }, [genId]);

  const handleAddUnitDirect = useCallback((uid: string, label: string, cx: number, cy: number) => {
    const summary = unitSummaries[uid] ?? '';
    const topicId = genId();
    const topicNode: CanvasNode = { id: topicId, type: 'topic', title: label, summary, nodeId: uid, x: cx, y: cy, width: 220, height: 80 };
    const unit = mindmapNodes.find((n) => n.id === uid);
    const newNodes: CanvasNode[] = [topicNode];
    const newEdges: CanvasEdge[] = [];
    if (unit) {
      unit.documents?.forEach((doc, i) => {
        const angle = ((i * 360) / Math.max(unit.documents.length, 1) - 90) * (Math.PI / 180);
        const docNode: CanvasNode = {
          id: genId() + '-' + i, type: 'document', title: doc.title, docId: doc.id,
          docType: doc.type === 'video' ? 'video' : 'text', nodeId: uid,
          x: cx + Math.cos(angle) * 180, y: cy + 80 + Math.sin(angle) * 100,
          width: 180, height: 44, parentId: topicId,
        };
        newNodes.push(docNode);
        newEdges.push({ from: topicId, to: docNode.id });
      });
    }
    setNodes((p) => [...p, ...newNodes]);
    setEdges((p) => [...p, ...newEdges]);
  }, [genId]);

  // ── Close expanded node ─────────────────────────────────────
  const handleCloseExpanded = useCallback((nodeId?: string) => {
    if (nodeId) setExpandedNodeIds((prev) => prev.filter((id) => id !== nodeId));
    else setExpandedNodeIds([]);
  }, []);

  // ── Create AI node from expanded view (keeps source panel open) ──
  const handleCreateAINode = useCallback((nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => {
    const target = nodes.find((n) => n.id === nodeId);
    if (!target) return;
    
    const connectedIds = edges
      .filter((e) => e.from === target.id || e.to === target.id)
      .map((e) => e.from === target.id ? e.to : e.from);
    const connectedNodes = nodes.filter((n) => connectedIds.includes(n.id));
    
    let contextText = '';
    if (selectedText) {
      contextText = `"${selectedText}"`;
    } else if (target.content) {
      contextText = target.content;
    }
    connectedNodes.forEach((cn) => {
      if (cn.content) contextText += `\n\n[${cn.title}]: ${cn.content}`;
    });
    
    const action = type;
    const paragraphs = target.docType === 'text' ? (documentTextContent[target.docId ?? ''] ?? []) : [videoTranscripts[target.docId ?? ''] ?? ''];
    
    let aiText: string;
    if (selectedText) {
      aiText = action === 'ai-chat'
        ? `AI đang phân tích đoạn trích từ "${target.title}":\n\n> "${selectedText.slice(0, 300)}${selectedText.length > 300 ? '...' : ''}"\n\n...`
        : `Ôn tập đoạn trích từ "${target.title}":\n\n> "${selectedText.slice(0, 300)}${selectedText.length > 300 ? '...' : ''}"\n\nCâu hỏi ôn tập đang được tạo...`;
    } else {
      aiText = action === 'ai-chat'
        ? `AI đang phân tích "${target.title}"...\n\n${contextText || (paragraphs[0]?.slice(0, 200) ?? '')}...${connectedNodes.length > 0 ? `\n\n(Dựa trên ${connectedNodes.length} node liên kết)` : ''}`
        : 'Nội dung ôn tập được tạo. Bao gồm quiz, flashcard và câu hỏi tự luận.';
    }
    
    const newNode: CanvasNode = {
      id: genId(), type: action,
      title: `${action === 'ai-chat' ? 'AI Hỏi đáp' : 'AI Ôn tập'}: ${selectedText ? selectedText.slice(0, 20) + '...' : target.title.slice(0, 25)}`,
      content: aiText,
      x: target.x + 220, y: action === 'ai-review' ? target.y - 60 : target.y + 60,
      width: 190, height: 50, parentId: target.id,
    };
    setNodes((p) => [...p, newNode]);
    setEdges((p) => [...p, { from: target.id, to: newNode.id }]);
    
    // Keep source node expanded on left, add AI node on right → 50/50 split
    setExpandedNodeIds([nodeId, newNode.id]);
    setFocusedNodeId(newNode.id);
  }, [nodes, edges, genId]);

  const visibleNodes = useMemo(() => nodes.filter((n) => !isNodeHidden(n.id)), [nodes, isNodeHidden]);
  const expandedNodes = useMemo(() => expandedNodeIds.map((id) => nodes.find((n) => n.id === id)).filter(Boolean) as CanvasNode[], [expandedNodeIds, nodes]);

  const hasSidebar = sidebarNodeId !== null;
  const hasExpanded = expandedNodes.length > 0;
  const sidebarCount = expandedNodes.length + (hasSidebar ? 1 : 0);

  return (
    <div className="flex w-full h-full gap-3">
      {/* Canvas area — shrinks when sidebars open */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border-2 border-[#333333] bg-[#F5F0EB] transition-all duration-300"
        style={{
          cursor: drawingEdge ? 'crosshair' : isPanning.current ? 'grabbing' : 'grab',
          flex: sidebarCount === 0 ? '1 1 100%' : sidebarCount === 1 ? '1 1 55%' : '0 0 0%',
          minWidth: sidebarCount >= 2 ? 0 : 300,
          display: sidebarCount >= 2 ? 'none' : undefined,
        }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}
        onClick={(e) => { if (!(e.target as HTMLElement).closest('[data-node-id]')) { setFocusedNodeId(null); setContextMenu(null); setSelectionToolbar(null); } }}
        onContextMenu={handleCanvasContextMenu}
      >
        {/* Dot-grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle, #CCCCCC 1px, transparent 1px)`, backgroundSize: `${30 * transform.scale}px ${30 * transform.scale}px`, backgroundPosition: `${transform.x}px ${transform.y}px` }} />

        {/* Transform layer */}
        <div style={{ transform: `translate(${transform.x}px,${transform.y}px) scale(${transform.scale})`, transformOrigin: '0 0', position: 'absolute', width: CANVAS_W, height: CANVAS_H, willChange: 'transform' }}>
          <EdgeLayer edges={edges} nodes={nodes} isNodeHidden={isNodeHidden} width={CANVAS_W} height={CANVAS_H} />
          
          {/* Drawing edge preview */}
          {drawingEdge && (
            <svg width={CANVAS_W} height={CANVAS_H} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible', zIndex: 50 }}>
              <line
                x1={drawingEdge.fromX} y1={drawingEdge.fromY}
                x2={drawingEdge.toX} y2={drawingEdge.toY}
                stroke="#6366F1" strokeWidth={2} strokeDasharray="6 4" opacity={0.7}
              />
              <circle cx={drawingEdge.toX} cy={drawingEdge.toY} r={5} fill="#6366F1" opacity={0.5} />
            </svg>
          )}

          <AnimatePresence>
            {visibleNodes.map((node) => {
              const childCount = collapsedNodeIds.has(node.id) ? nodes.filter((n) => n.parentId === node.id).length : 0;
              return (
                <CanvasNodeComponent
                  key={node.id}
                  node={node}
                  isExpanded={expandedNodeIds.includes(node.id)}
                  isFocused={focusedNodeId === node.id}
                  onDrag={handleNodeDrag}
                  onClick={handleNodeClick}
                  onContextMenu={handleContextMenu}
                  onStartEdge={handleStartEdge}
                  scale={transform.scale}
                  collapsedChildCount={childCount}
                />
              );
            })}
          </AnimatePresence>
        </div>

        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
        <ZoomIndicator scale={transform.scale} />
        {!hasExpanded && !hasSidebar && <CanvasHint />}

        <AnimatePresence>
          {contextMenu && (
            <ContextMenuComponent
              menu={contextMenu}
              onAction={handleContextAction}
              onClose={() => setContextMenu(null)}
              onShowAddUnit={() => { setAddUnitMenuState({ x: contextMenu.x, y: contextMenu.y, canvasX: contextMenu.canvasX ?? 500, canvasY: contextMenu.canvasY ?? 350 }); setContextMenu(null); }}
              onAddUnitDirect={handleAddUnitDirect}
            />
          )}
          {addUnitMenuState && (
            <AddUnitMenu {...addUnitMenuState} onAddUnit={handleAddUnit} onClose={() => setAddUnitMenuState(null)} />
          )}
          {selectionToolbar && (
            <SelectionToolbarComponent toolbar={selectionToolbar} onCreate={() => {}} onClose={() => setSelectionToolbar(null)} />
          )}
          {colorPicker && (
            <ColorPicker
              x={colorPicker.x} y={colorPicker.y}
              currentColor={nodes.find((n) => n.id === colorPicker.nodeId)?.color}
              onSelectColor={(bg, border) => handleChangeColor(colorPicker.nodeId, bg, border)}
              onClose={() => setColorPicker(null)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Right sidebars — expanded nodes + document sidebar */}
      <AnimatePresence>
        {expandedNodes.map((node) => (
          <ExpandedNodeView
            key={node.id}
            node={node}
            allNodes={nodes}
            edges={edges}
            onClose={() => handleCloseExpanded(node.id)}
            onCreateAINode={handleCreateAINode}
            onUpdateContent={handleUpdateContent}
          />
        ))}
      </AnimatePresence>

      {/* Document sidebar */}
      <DocumentSidebar
        nodeId={sidebarNodeId}
        onClose={() => setSidebarNodeId(null)}
        onApply={handleSidebarApply}
        onOpenDocument={handleOpenDocument}
      />
    </div>
  );
}
