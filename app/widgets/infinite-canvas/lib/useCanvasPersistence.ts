'use client';

import { useEffect, useRef, useCallback } from 'react';
import { CanvasNode, CanvasEdge } from '../model/types';
import { apiFetch } from '@/shared/api/client';

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

export function useCanvasPersistence(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  options: {
    projectId?: string;
    unitId?: string;
    onLoaded?: (nodes: CanvasNode[], edges: CanvasEdge[]) => void;
  },
) {
  const { projectId, unitId, onLoaded } = options;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const initialLoadDone = useRef(false);
  const onLoadedRef = useRef(onLoaded);
  onLoadedRef.current = onLoaded;
  nodesRef.current = nodes;
  edgesRef.current = edges;

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;

    async function load() {
      try {
        const params = new URLSearchParams();
        if (unitId) params.set('unit_id', unitId);
        const qs = params.toString() ? `?${params.toString()}` : '';
        const res = await apiFetch<WorkspaceResponse>(`/canvas/${projectId}${qs}`);
        if (cancelled) return;
        if (res.nodes.length > 0 && onLoadedRef.current) {
          onLoadedRef.current(
            res.nodes.map(apiNodeToCanvas),
            res.edges.map((e) => ({ from: e.from_node_id, to: e.to_node_id })),
          );
        }
      } catch {
        // Silently fail - use default layout
      } finally {
        if (!cancelled) {
          initialLoadDone.current = true;
          setTimeout(() => { if (!cancelled) { saveEnabledRef.current = true; console.log("[canvas-persist] saveEnabled=true"); } }, 500);
        }
      }
    }
    console.log("[canvas-persist] starting load", projectId, unitId);
    void load();
    return () => { cancelled = true; };
  }, [projectId, unitId]);

  const saveEnabledRef = useRef(false);
  const dirtyRef = useRef(false);

  const flushSave = useCallback(() => {
    if (!projectId || !saveEnabledRef.current) return;
    if (nodesRef.current.length === 0) return;
    const params = new URLSearchParams();
    if (unitId) params.set('unit_id', unitId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const payload = JSON.stringify({
      nodes: nodesRef.current.map(canvasNodeToApi),
      edges: edgesRef.current.map(canvasEdgeToApi),
    });
    let token = '';
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
      token = match ? decodeURIComponent(match[1]) : '';
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000')}/canvas/${projectId}${qs}`, {
      method: 'PUT',
      headers,
      body: payload,
      keepalive: true,
    }).catch(() => {});
    dirtyRef.current = false;
  }, [projectId, unitId]);

  const save = useCallback(() => {
    if (!projectId || !saveEnabledRef.current) return;
    if (nodesRef.current.length === 0) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    dirtyRef.current = true;

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
        dirtyRef.current = false;
      } catch {
        // Silent - will retry on next change
      }
    }, 800);
  }, [projectId, unitId]);

  useEffect(() => {
    console.log("[canvas-persist] save effect", { saveEnabled: saveEnabledRef.current, nodesLen: nodes.length });
    if (!saveEnabledRef.current) return;
    console.log("[canvas-persist] calling save()");
    save();
  }, [nodes, edges, save]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (dirtyRef.current) flushSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [flushSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (dirtyRef.current) flushSave();
    };
  }, [flushSave]);
}
