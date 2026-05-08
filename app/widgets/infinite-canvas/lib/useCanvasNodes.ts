'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasNode, CanvasEdge } from '../model/types';
import { apiFetch } from '@/shared/api/client';

interface CanvasApiNode {
  id: string;
  node_type: string;
  title: string;
  content?: string | null;
  summary?: string | null;
  meta: Record<string, unknown>;
  x: number;
  y: number;
  width: number;
  height: number;
  parent_id?: string | null;
  color?: string | null;
  sort_order: number;
}

interface CanvasApiEdge {
  id: string;
  from_node_id: string;
  to_node_id: string;
  edge_type: string;
}

interface WorkspaceResponse {
  workspace_id: string | null;
  nodes: CanvasApiNode[];
  edges: CanvasApiEdge[];
}

function apiNodeToCanvas(n: CanvasApiNode): CanvasNode {
  const meta = (n.meta || {}) as Record<string, unknown>;
  return {
    id: n.id,
    type: n.node_type as CanvasNode['type'],
    title: n.title,
    content: n.content ?? undefined,
    summary: n.summary ?? undefined,
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height,
    parentId: n.parent_id ?? undefined,
    color: n.color ?? undefined,
    docId: meta.docId as string | undefined,
    sourceId: meta.sourceId as string | undefined,
    sourceType: meta.sourceType as string | undefined,
    passages: meta.passages as string[] | undefined,
    passageIds: meta.passageIds as string[] | undefined,
    noteVersions: meta.noteVersions as CanvasNode['noteVersions'],
    activeNoteVersionId: meta.activeNoteVersionId as string | undefined,
    synthSourceIds: meta.synthSourceIds as string[] | undefined,
    questionCount: meta.questionCount as number | undefined,
    metaSubtitle: meta.metaSubtitle as string | undefined,
    docType: meta.docType as 'text' | 'video' | undefined,
    nodeId: meta.nodeId as string | undefined,
    customBg: meta.customBg as string | undefined,
    customBorder: meta.customBorder as string | undefined,
  };
}

function canvasNodeToApi(n: CanvasNode) {
  const meta: Record<string, unknown> = {};
  if (n.docId) meta.docId = n.docId;
  if (n.sourceId) meta.sourceId = n.sourceId;
  if (n.sourceType) meta.sourceType = n.sourceType;
  if (n.passages) meta.passages = n.passages;
  if (n.passageIds) meta.passageIds = n.passageIds;
  if (n.noteVersions) meta.noteVersions = n.noteVersions;
  if (n.activeNoteVersionId) meta.activeNoteVersionId = n.activeNoteVersionId;
  if (n.synthSourceIds) meta.synthSourceIds = n.synthSourceIds;
  if (n.questionCount) meta.questionCount = n.questionCount;
  if (n.metaSubtitle) meta.metaSubtitle = n.metaSubtitle;
  if (n.docType) meta.docType = n.docType;
  if (n.nodeId) meta.nodeId = n.nodeId;
  if (n.customBg) meta.customBg = n.customBg;
  if (n.customBorder) meta.customBorder = n.customBorder;

  return {
    id: n.id,
    node_type: n.type,
    title: n.title,
    content: n.content ?? null,
    summary: n.summary ?? null,
    meta,
    x: n.x,
    y: n.y,
    width: n.width,
    height: n.height,
    parent_id: n.parentId ?? null,
    color: n.color ?? null,
    sort_order: 0,
  };
}

function canvasEdgeToApi(e: CanvasEdge) {
  return {
    from_node_id: e.from,
    to_node_id: e.to,
    edge_type: 'default',
  };
}

export function useCanvasNodes(
  initialNodes: CanvasNode[],
  initialEdges: CanvasEdge[],
  options?: { projectId?: string; unitId?: string },
) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  nodesRef.current = nodes;
  edgesRef.current = edges;

  const projectId = options?.projectId;
  const unitId = options?.unitId;

  // Load from backend on mount
  useEffect(() => {
    if (!projectId) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const params = new URLSearchParams();
        if (unitId) params.set('unit_id', unitId);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await apiFetch<WorkspaceResponse>(`/canvas/${projectId}${qs}`);
        if (cancelled) return;
        if (res.nodes.length > 0) {
          setNodes(res.nodes.map(apiNodeToCanvas));
          setEdges(res.edges.map((e) => ({ from: e.from_node_id, to: e.to_node_id })));
        }
      } catch {
        // Silently fall back to initial nodes if backend unavailable
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [projectId, unitId]);

  // Debounced save to backend
  const saveToBackend = useCallback(() => {
    if (!projectId) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        if (unitId) params.set('unit_id', unitId);
        const qs = params.toString() ? `?${params.toString()}` : '';
        await apiFetch(`/canvas/${projectId}${qs}`, {
          method: 'PUT',
          body: JSON.stringify({
            nodes: nodesRef.current.map(canvasNodeToApi),
            edges: edgesRef.current.map(canvasEdgeToApi),
          }),
        });
      } catch {
        // Silent failure - will retry on next change
      }
    }, 2000);
  }, [projectId, unitId]);

  // Trigger save whenever nodes or edges change (after initial load)
  useEffect(() => {
    if (!loaded) return;
    saveToBackend();
  }, [nodes, edges, loaded, saveToBackend]);

  const genId = useCallback(
    () => `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    []
  );

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

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
  }, []);

  const addNode = useCallback((node: CanvasNode) => {
    setNodes((prev) => [...prev, node]);
  }, []);

  const addEdge = useCallback((edge: CanvasEdge) => {
    setEdges((prev) => [...prev, edge]);
  }, []);

  return {
    nodes, setNodes,
    edges, setEdges,
    collapsedNodeIds,
    loaded,
    genId,
    getAllDescendantIds,
    isNodeHidden,
    hasChildren,
    toggleCollapse,
    deleteNode,
    addNode,
    addEdge,
  };
}
