'use client';

import { useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import MindmapCanvas from '@/components/MindmapCanvas';
import DocumentSidebar from '@/components/DocumentSidebar';
import NodeTextViewer from '@/components/NodeTextViewer';
import NodeVideoViewer from '@/components/NodeVideoViewer';
import ChatBox from '@/components/ChatBox';
import FloatingNote from '@/components/FloatingNote';
import { mindmapNodes } from '@/lib/learning-data';

interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;
  color: string;
  border: string;
  docId: string;
}

export default function LearnPage() {
  // ─── State ───────────────────────────────────────────────────
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('giao-dien');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Active content nodes per mindmap node
  const [activeContentNodes, setActiveContentNodes] = useState<Record<string, ContentNodeUI[]>>({});

  // Current open document
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [openDocNodeId, setOpenDocNodeId] = useState<string | null>(null);

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
          <a href="/" className="hover:text-[#2D2D2D] transition-colors font-medium">
            Dự án
          </a>
          <ChevronRight size={12} />
          <span className="text-[#2D2D2D] font-medium">Hệ Điều Hành</span>
          <ChevronRight size={12} />
          <span className="text-[#6B2D3E] font-bold">Học tập</span>
        </nav>
      </div>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
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
