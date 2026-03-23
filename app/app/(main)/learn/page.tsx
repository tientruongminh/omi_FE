'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import MindmapCanvas from '@/components/MindmapCanvas';
import DocumentSidebar from '@/components/DocumentSidebar';
import NodeTextViewer from '@/components/NodeTextViewer';
import NodeVideoViewer from '@/components/NodeVideoViewer';
import ChatBox from '@/components/ChatBox';
import FloatingNote from '@/components/FloatingNote';
import { mindmapNodes } from '@/lib/learning-data';
import { useOmiLearnStore } from '@/lib/store';

interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

function LearnContent() {
  const searchParams = useSearchParams();
  const nodeParam = searchParams.get('node');
  const projectParam = searchParams.get('project');

  const { projects } = useOmiLearnStore();
  const project = projects.find((p) => p.id === projectParam);
  const projectTitle = project?.title ?? 'Hệ Điều Hành và Linux';
  const projectId = projectParam ?? 'os-linux';

  // Map node param from roadmap (roadmap uses n1-n7) to mindmap node IDs (learning-data)
  // Roadmap node index → mindmap node ID mapping
  const ROADMAP_TO_MINDMAP: Record<string, string> = {
    'n1': 'khai-niem',
    'n2': 'kien-truc',
    'n3': 'quan-ly',
    'n4': 'giao-dien',
    'n5': 'he-dieu-hanh',
    'n6': 'lap-trinh-shell',
    'n7': 'khoi-dong',
  };

  // Default to node 4 (giao-dien, index 3) when no URL param
  const DEFAULT_NODE_ID = mindmapNodes[3]?.id ?? mindmapNodes[0]?.id ?? 'giao-dien';

  const resolvedNodeId = nodeParam
    ? (ROADMAP_TO_MINDMAP[nodeParam] ?? (mindmapNodes.find((n) => n.id === nodeParam) ? nodeParam : DEFAULT_NODE_ID))
    : DEFAULT_NODE_ID;

  // ─── State ───────────────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(resolvedNodeId);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active content nodes per mindmap node
  const [activeContentNodes, setActiveContentNodes] = useState<Record<string, ContentNodeUI[]>>({});

  // Current open document
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [openDocNodeId, setOpenDocNodeId] = useState<string | null>(null);

  // Update selected node if URL param changes
  useEffect(() => {
    if (nodeParam && mindmapNodes.find((n) => n.id === nodeParam)) {
      setSelectedNodeId(nodeParam);
      setSidebarOpen(true);
    }
  }, [nodeParam]);

  // ─── Handlers ────────────────────────────────────────────────

  const handleSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setSidebarOpen(true);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
    setSelectedNodeId(null);
  }, []);

  const handleApply = useCallback((nodeId: string, contentNodes: ContentNodeUI[]) => {
    setActiveContentNodes((prev) => ({ ...prev, [nodeId]: contentNodes }));
  }, []);

  const handleOpenDocument = useCallback((docId: string, nodeId: string) => {
    setOpenDocId(docId);
    setOpenDocNodeId(nodeId);
  }, []);

  const handleCloseDocument = useCallback(() => {
    setOpenDocId(null);
    setOpenDocNodeId(null);
  }, []);

  // ─── Determine doc type ───────────────────────────────────────

  const getDocType = (docId: string | null, nodeId: string | null): 'text' | 'video' | null => {
    if (!docId || !nodeId) return null;
    const node = mindmapNodes.find((n) => n.id === nodeId);
    if (!node) return null;
    const doc = node.documents.find((d) => d.id === docId);
    if (!doc) return null;
    return doc.type === 'video' ? 'video' : 'text';
  };

  const docType = getDocType(openDocId, openDocNodeId);

  // ─── Render ──────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#F5F0EB' }}
    >
      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-[#333333]/10">
        <nav className="flex items-center gap-1.5 text-[12px] text-[#5A5C58]">
          <Link href="/" className="hover:text-[#2D2D2D] transition-colors font-medium">
            Dự án
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/dashboard/${projectId}`}
            className="hover:text-[#2D2D2D] transition-colors font-medium"
          >
            {projectTitle}
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/roadmap?project=${projectId}`}
            className="hover:text-[#6B2D3E] transition-colors font-medium"
          >
            Roadmap
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#6B2D3E] font-bold">Học tập</span>
        </nav>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 135px)' }}>
        {/* Mindmap — grows to fill space */}
        <div className="flex-1 p-4 min-w-0">
          <MindmapCanvas
            selectedNodeId={selectedNodeId}
            onSelectNode={handleSelectNode}
            activeContentNodes={activeContentNodes}
            onOpenDocument={handleOpenDocument}
          />
        </div>

        {/* Document Sidebar — slides in from right */}
        {sidebarOpen && selectedNodeId && (
          <div className="w-[380px] flex-shrink-0 p-4 pl-0">
            <DocumentSidebar
              nodeId={selectedNodeId}
              onClose={handleSidebarClose}
              onApply={handleApply}
              onOpenDocument={handleOpenDocument}
            />
          </div>
        )}
      </div>

      {/* ── Document Viewers (modal overlays) ────────────────── */}
      {docType === 'text' && (
        <NodeTextViewer
          docId={openDocId}
          nodeId={openDocNodeId}
          onClose={handleCloseDocument}
        />
      )}
      {docType === 'video' && (
        <NodeVideoViewer
          docId={openDocId}
          nodeId={openDocNodeId}
          onClose={handleCloseDocument}
        />
      )}

      {/* ── Floating UI ───────────────────────────────────────── */}
      <FloatingNote />
      <ChatBox />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-[#5A5C58]">Đang tải...</div>}>
      <LearnContent />
    </Suspense>
  );
}
