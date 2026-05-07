'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CanvasNode, CanvasEdge } from '../model/types';
import { CANVAS_W, CANVAS_H } from '../model/constants';
import CanvasNodeComponent from '@/entities/node/ui/CanvasNode';
import { EdgeLayer } from './CanvasEdge';
import ZoomControls from './ZoomControls';
import ZoomIndicator from './ZoomIndicator';
import CanvasHint from './CanvasHint';
import DocumentSidebar from './DocumentSidebar';
import ExpandedNodeView from './ExpandedNodeView';
import ExpandedNoteContent from './ExpandedNoteContent';
import ContextMenu from './ContextMenu';
import { ContextMenuState } from '../model/types';
import {
  fetchLearningUnitsForRoadmapNode,
  fetchPassagesForLearningUnitSource,
  fetchRoadmapByProject,
  fetchSourcesForLearningUnit,
  getLearningSourceDisplayLabel,
  findRoadmapNodeById,
  type LearningUnit,
  type LearningUnitPassage,
  type LearningUnitSource,
  type RoadmapNode,
} from '@/entities/project/api/roadmap';

interface Props {
  unitId?: string;
  projectId?: string;
}

interface WorkspaceData {
  roadmapNode: RoadmapNode;
  learningUnits: LearningUnit[];
}

interface SidebarContext {
  id: string;
  kind: 'workspace' | 'learning-unit';
  title: string;
  description?: string | null;
}

interface SourceNodePayload {
  source: LearningUnitSource;
  passages: LearningUnitPassage[];
  contextNodeId: string;
}

function buildSyntheticLearningUnits(unitId: string, roadmapNode: RoadmapNode | null): LearningUnit[] {
  if (!roadmapNode) return [];
  return [
    {
      id: unitId,
      roadmap_node_id: unitId,
      title: 'Related study materials',
      description: `Workspace fallback for ${roadmapNode.title}`,
      sort_order: 0,
      created_at: roadmapNode.created_at,
      updated_at: roadmapNode.updated_at,
    },
  ];
}

function buildFallbackRoadmapNode(unitId: string, learningUnits: LearningUnit[]): RoadmapNode {
  return {
    id: unitId,
    roadmap_id: '',
    parent_id: null,
    title: learningUnits[0]?.title ? `Chu de hoc: ${learningUnits[0].title}` : unitId,
    status: 'active',
    position_x: null,
    position_y: null,
    sort_order: 0,
    is_expanded: true,
    is_completed: false,
    completed_at: null,
    learning_units: learningUnits,
    children: [],
    created_at: '',
    updated_at: '',
  };
}

function buildWorkspaceLayout(workspace: WorkspaceData): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  const { roadmapNode, learningUnits } = workspace;
  const root: CanvasNode = {
    id: `workspace-${roadmapNode.id}`,
    type: 'document',
    title: roadmapNode.title,
    content: roadmapNode.title,
    metaSubtitle: 'Chu de chinh',
    nodeId: roadmapNode.id,
    x: 360,
    y: 300,
    width: 260,
    height: 72,
  };

  const nodes: CanvasNode[] = [root];
  const edges: CanvasEdge[] = [];
  const total = learningUnits.length;

  learningUnits.forEach((learningUnit, index) => {
    const angle = total <= 1 ? Math.PI / 2 : ((index - (total - 1) / 2) * 0.55) + Math.PI / 2;
    const radius = 180;
    nodes.push({
      id: `learning-unit-${learningUnit.id}`,
      type: 'chapter',
      title: learningUnit.title,
      summary: learningUnit.description ?? '',
      nodeId: learningUnit.id,
      x: 360 + 130 + Math.cos(angle) * radius - 96,
      y: 300 + 36 + Math.sin(angle) * radius - 24,
      width: 192,
      height: 48,
      parentId: root.id,
    });
    edges.push({ from: root.id, to: `learning-unit-${learningUnit.id}` });
  });

  return { nodes, edges };
}

function dedupePassages(passages: LearningUnitPassage[]): LearningUnitPassage[] {
  const seen = new Set<string>();
  return passages
    .sort((left, right) => left.sort_order - right.sort_order)
    .filter((passage) => {
      if (seen.has(passage.passage_id)) return false;
      seen.add(passage.passage_id);
      return true;
    });
}

function buildSourceNodeId(context: SidebarContext, sourceId: string): string {
  return `source-${context.kind}-${context.id}-${sourceId}`;
}

function buildSourceSubtitle(sourceType: string, passageCount: number): string {
  return `${sourceType.toUpperCase()} - ${passageCount} trich doan`;
}

function buildAINodeTitle(type: 'ai-chat' | 'ai-review' | 'synthesis'): string {
  if (type === 'ai-chat') return 'AI hoi dap';
  if (type === 'ai-review') return 'On tap';
  return 'Tong hop';
}

export default function InfiniteCanvas({ unitId, projectId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [previewNodes, setPreviewNodes] = useState<CanvasNode[]>([]);
  const [sidebarContext, setSidebarContext] = useState<SidebarContext | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [sidebarNode, setSidebarNode] = useState<CanvasNode | null>(null);
  const [edgeDraft, setEdgeDraft] = useState<{ from: string; x: number; y: number; toX: number; toY: number } | null>(null);

  const [sourceCache, setSourceCache] = useState<Record<string, LearningUnitSource[]>>({});
  const [passageCache, setPassageCache] = useState<Record<string, LearningUnitPassage[]>>({});
  const [sidebarSourceCache, setSidebarSourceCache] = useState<Record<string, LearningUnitSource[]>>({});
  const [loadingSourcesFor, setLoadingSourcesFor] = useState<string | null>(null);
  const [selectedSourceIdsByContext, setSelectedSourceIdsByContext] = useState<Record<string, string[]>>({});
  const [applyingSourcesFor, setApplyingSourcesFor] = useState<string | null>(null);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadWorkspace() {
      if (!unitId) {
        setWorkspaceData(null);
        setWorkspaceError(null);
        return;
      }

      setWorkspaceLoading(true);
      setWorkspaceError(null);

      try {
        const fetchedLearningUnits = await fetchLearningUnitsForRoadmapNode(unitId);
        let roadmapNode: RoadmapNode | null = null;

        if (projectId) {
          try {
            const roadmap = await fetchRoadmapByProject(projectId);
            if (roadmap) {
              roadmapNode = findRoadmapNodeById(roadmap.roadmap_nodes, unitId);
            }
          } catch (lookupError) {
            console.warn('Workspace roadmap lookup failed; using fallback node.', lookupError);
          }
        }

        if (!roadmapNode) {
          roadmapNode = buildFallbackRoadmapNode(unitId, fetchedLearningUnits);
        }

        const learningUnits = fetchedLearningUnits.length > 0
          ? fetchedLearningUnits
          : buildSyntheticLearningUnits(unitId, roadmapNode);

        if (!cancelled) {
          setWorkspaceData({ roadmapNode, learningUnits });
        }
      } catch (error) {
        if (!cancelled) {
          setWorkspaceData(null);
          setWorkspaceError(error instanceof Error ? error.message : 'Khong the tai workspace hoc tap.');
        }
      } finally {
        if (!cancelled) {
          setWorkspaceLoading(false);
        }
      }
    }

    void loadWorkspace();
    return () => {
      cancelled = true;
    };
  }, [projectId, unitId]);

  useEffect(() => {
    if (!workspaceData) {
      setNodes([]);
      setEdges([]);
      return;
    }
    const layout = buildWorkspaceLayout(workspaceData);
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setFocusedNodeId(null);
    setPreviewNodes([]);
    setSidebarContext(null);
    setSidebarNode(null);
    setSelectedSourceIdsByContext({});
    setApplyingSourcesFor(null);
  }, [workspaceData]);

  const currentSources = useMemo(
    () => (sidebarContext ? (sidebarSourceCache[sidebarContext.id] ?? []) : []),
    [sidebarContext, sidebarSourceCache],
  );

  const selectedSourceIds = useMemo(
    () => (sidebarContext ? (selectedSourceIdsByContext[sidebarContext.id] ?? []) : []),
    [selectedSourceIdsByContext, sidebarContext],
  );

  const appliedSourceIds = useMemo(() => {
    if (!sidebarContext) return [];

    const parentNodeId = sidebarContext.kind === 'workspace'
      ? `workspace-${sidebarContext.id}`
      : `learning-unit-${sidebarContext.id}`;

    return nodes
      .filter((node) => node.parentId === parentNodeId && node.type === 'document' && !!node.sourceId)
      .map((node) => node.sourceId!)
      .filter((value, index, arr) => arr.indexOf(value) === index);
  }, [nodes, sidebarContext]);

  const ensureSourcesLoaded = useCallback(async (learningUnitId: string) => {
    if (sourceCache[learningUnitId]) return sourceCache[learningUnitId];
    const rows = await fetchSourcesForLearningUnit(learningUnitId);
    setSourceCache((prev) => ({ ...prev, [learningUnitId]: rows }));
    return rows;
  }, [sourceCache]);

  const ensurePassagesLoaded = useCallback(async (learningUnitId: string, sourceId: string) => {
    const key = `${learningUnitId}:${sourceId}`;
    if (passageCache[key]) return passageCache[key];
    const rows = await fetchPassagesForLearningUnitSource(learningUnitId, sourceId);
    setPassageCache((prev) => ({ ...prev, [key]: rows }));
    return rows;
  }, [passageCache]);

  const ensureWorkspaceSourcesLoaded = useCallback(async () => {
    if (!workspaceData) return [];
    const cacheKey = workspaceData.roadmapNode.id;
    if (sidebarSourceCache[cacheKey]) return sidebarSourceCache[cacheKey];

    setLoadingSourcesFor(cacheKey);
    try {
      const sourceGroups = await Promise.all(
        workspaceData.learningUnits.map(async (learningUnit) => ({
          learningUnit,
          sources: await ensureSourcesLoaded(learningUnit.id),
        })),
      );

      const merged = new Map<string, LearningUnitSource>();
      for (const group of sourceGroups) {
        for (const source of group.sources) {
          const existing = merged.get(source.source_id);
          if (existing) {
            merged.set(source.source_id, {
              ...existing,
              passage_count: existing.passage_count + source.passage_count,
            });
          } else {
            merged.set(source.source_id, { ...source });
          }
        }
      }

      const rows = Array.from(merged.values()).sort((left, right) => right.passage_count - left.passage_count);
      setSidebarSourceCache((prev) => ({ ...prev, [cacheKey]: rows }));
      return rows;
    } finally {
      setLoadingSourcesFor((prev) => (prev === cacheKey ? null : prev));
    }
  }, [ensureSourcesLoaded, sidebarSourceCache, workspaceData]);

  const openPreviewNode = useCallback((node: CanvasNode) => {
    setPreviewNodes((prev) => {
      const withoutDuplicate = prev.filter((item) => item.id !== node.id);
      return [...withoutDuplicate.slice(-1), node];
    });
  }, []);

  const findParentCanvasNode = useCallback((context: SidebarContext, canvasNodes: CanvasNode[]) => {
    const expectedId = context.kind === 'workspace'
      ? `workspace-${context.id}`
      : `learning-unit-${context.id}`;

    return canvasNodes.find((node) => node.id === expectedId) ?? null;
  }, []);

  const getSourcePayloadForContext = useCallback(async (
    context: SidebarContext,
    sourceId: string,
  ): Promise<SourceNodePayload | null> => {
    if (context.kind === 'workspace') {
      if (!workspaceData) return null;

      const sources = await ensureWorkspaceSourcesLoaded();
      const source = sources.find((row) => row.source_id === sourceId);
      if (!source) return null;

      const mergedPassages: LearningUnitPassage[] = [];
      for (const learningUnit of workspaceData.learningUnits) {
        const unitSources = await ensureSourcesLoaded(learningUnit.id);
        if (!unitSources.some((row) => row.source_id === sourceId)) continue;
        mergedPassages.push(...await ensurePassagesLoaded(learningUnit.id, sourceId));
      }

      return {
        source,
        passages: dedupePassages(mergedPassages),
        contextNodeId: workspaceData.roadmapNode.id,
      };
    }

    const learningUnit = workspaceData?.learningUnits.find((item) => item.id === context.id);
    if (!learningUnit) return null;

    const sources = await ensureSourcesLoaded(learningUnit.id);
    const source = sources.find((row) => row.source_id === sourceId);
    if (!source) return null;

    return {
      source,
      passages: dedupePassages(await ensurePassagesLoaded(learningUnit.id, sourceId)),
      contextNodeId: learningUnit.id,
    };
  }, [ensurePassagesLoaded, ensureSourcesLoaded, ensureWorkspaceSourcesLoaded, workspaceData]);

  const handleToggleSource = useCallback((sourceId: string) => {
    if (!sidebarContext) return;

    setSelectedSourceIdsByContext((prev) => {
      const current = prev[sidebarContext.id] ?? [];
      const next = current.includes(sourceId)
        ? current.filter((id) => id !== sourceId)
        : [...current, sourceId];

      return {
        ...prev,
        [sidebarContext.id]: next,
      };
    });
  }, [sidebarContext]);

  const handleApplySources = useCallback(async () => {
    if (!sidebarContext || selectedSourceIds.length === 0) return;

    setApplyingSourcesFor(sidebarContext.id);
    try {
      const payloads = (
        await Promise.all(selectedSourceIds.map((sourceId) => getSourcePayloadForContext(sidebarContext, sourceId)))
      ).filter((item): item is SourceNodePayload => item !== null);

      if (payloads.length === 0) return;

      const parentNode = findParentCanvasNode(sidebarContext, nodes);
      if (!parentNode) return;

      const nextNodes = [...nodes];
      const nextEdges = [...edges];
      const addedOrUpdatedNodes: CanvasNode[] = [];

      for (const payload of payloads) {
        const nodeId = buildSourceNodeId(sidebarContext, payload.source.source_id);
        const existingIndex = nextNodes.findIndex((node) => node.id === nodeId);
        const passages = payload.passages.map((row) => row.text);

        if (existingIndex >= 0) {
          const existingNode = nextNodes[existingIndex];
          const updatedNode: CanvasNode = {
            ...existingNode,
            title: getLearningSourceDisplayLabel(payload.source),
            docType: 'text',
            docId: payload.source.source_id,
            nodeId: payload.contextNodeId,
            sourceId: payload.source.source_id,
            sourceType: payload.source.source_type,
            passages,
            passageIds: payload.passages.map((row) => row.passage_id),
            content: passages.join('\n\n'),
            metaSubtitle: buildSourceSubtitle(payload.source.source_type, passages.length),
            parentId: parentNode.id,
          };
          nextNodes[existingIndex] = updatedNode;
          if (!nextEdges.some((edge) => edge.from === parentNode.id && edge.to === nodeId)) {
            nextEdges.push({ from: parentNode.id, to: nodeId });
          }
          addedOrUpdatedNodes.push(updatedNode);
          continue;
        }

        const existingDocumentCount = nextNodes.filter(
          (node) => node.parentId === parentNode.id && node.type === 'document' && !!node.sourceId,
        ).length;
        const row = Math.floor(existingDocumentCount / 3);
        const column = existingDocumentCount % 3;

        const newNode: CanvasNode = {
          id: nodeId,
          type: 'document',
          title: getLearningSourceDisplayLabel(payload.source),
          docType: 'text',
          docId: payload.source.source_id,
          nodeId: payload.contextNodeId,
          sourceId: payload.source.source_id,
          sourceType: payload.source.source_type,
          passages,
          passageIds: payload.passages.map((row) => row.passage_id),
          content: passages.join('\n\n'),
          metaSubtitle: buildSourceSubtitle(payload.source.source_type, passages.length),
          x: parentNode.x + parentNode.width + 110 + row * 24,
          y: parentNode.y - 20 + column * 78 + row * 10,
          width: 220,
          height: 44,
          parentId: parentNode.id,
        };

        nextNodes.push(newNode);
        if (!nextEdges.some((edge) => edge.from === parentNode.id && edge.to === nodeId)) {
          nextEdges.push({ from: parentNode.id, to: nodeId });
        }
        addedOrUpdatedNodes.push(newNode);
      }

      setNodes(nextNodes);
      setEdges(nextEdges);
      if (addedOrUpdatedNodes.length > 0) {
        setFocusedNodeId(addedOrUpdatedNodes[addedOrUpdatedNodes.length - 1].id);
      }
      setSelectedSourceIdsByContext((prev) => ({ ...prev, [sidebarContext.id]: [] }));
    } finally {
      setApplyingSourcesFor((prev) => (prev === sidebarContext.id ? null : prev));
    }
  }, [edges, findParentCanvasNode, getSourcePayloadForContext, nodes, selectedSourceIds, sidebarContext]);

  const handleStartEdge = useCallback((nodeId: string, _side: 'left' | 'right' | 'top' | 'bottom', x: number, y: number) => {
    setEdgeDraft({ from: nodeId, x, y, toX: x, toY: y });
  }, []);

  const completeEdgeToNode = useCallback((toNodeId: string) => {
    setEdgeDraft((draft) => {
      if (!draft || draft.from === toNodeId) return null;
      setEdges((prev) => prev.some((edge) => edge.from === draft.from && edge.to === toNodeId)
        ? prev
        : [...prev, { from: draft.from, to: toNodeId }]);
      return null;
    });
  }, []);

  const handleCreateAINode = useCallback((
    parentNodeId: string,
    type: 'ai-chat' | 'ai-review',
    selectedText?: string,
  ) => {
    const parentNode = nodes.find((node) => node.id === parentNodeId);
    if (!parentNode) return;

    const siblingCount = nodes.filter((node) => node.parentId === parentNodeId && node.type === type).length;
    const nodeId = `${type}-${parentNodeId}-${Date.now()}`;
    const seedText = selectedText?.trim() || parentNode.content || parentNode.title;
    const newNode: CanvasNode = {
      id: nodeId,
      type,
      title: buildAINodeTitle(type),
      content: seedText,
      summary: selectedText?.trim(),
      metaSubtitle: selectedText ? 'Tao tu doan van da chon' : `Lien ket tu ${parentNode.title}`,
      nodeId: parentNode.nodeId,
      sourceId: parentNode.sourceId,
      sourceType: parentNode.sourceType,
      passages: parentNode.passages,
      passageIds: parentNode.passageIds,
      x: parentNode.x + parentNode.width + 90,
      y: parentNode.y + siblingCount * 78,
      width: 196,
      height: 48,
      parentId: parentNode.id,
      questionCount: type === 'ai-review' ? 15 : undefined,
    };

    setNodes((prev) => [...prev, newNode]);
    setEdges((prev) => [...prev, { from: parentNode.id, to: nodeId }]);
    setFocusedNodeId(nodeId);
    openPreviewNode(newNode);
  }, [nodes, openPreviewNode]);

  const createCanvasNodeAt = useCallback((type: 'ai-chat' | 'ai-review' | 'synthesis', x: number, y: number, parentNode?: CanvasNode) => {
    const nodeId = `${type}-${parentNode?.id ?? 'canvas'}-${Date.now()}`;
    const seedText = parentNode?.content || parentNode?.title || workspaceData?.roadmapNode.title || 'Workspace context';
    const newNode: CanvasNode = {
      id: nodeId,
      type,
      title: buildAINodeTitle(type),
      content: seedText,
      metaSubtitle: parentNode ? `Tao tu ${parentNode.title}` : 'Tao tu canvas',
      nodeId: parentNode?.nodeId ?? workspaceData?.roadmapNode.id,
      sourceId: parentNode?.sourceId,
      sourceType: parentNode?.sourceType,
      passages: parentNode?.passages,
      passageIds: parentNode?.passageIds,
      x,
      y,
      width: type === 'synthesis' ? 220 : 196,
      height: type === 'synthesis' ? 52 : 48,
      parentId: parentNode?.id,
      questionCount: type === 'ai-review' ? 15 : undefined,
    };
    setNodes((prev) => [...prev, newNode]);
    if (parentNode) {
      setEdges((prev) => [...prev, { from: parentNode.id, to: nodeId }]);
    }
    setFocusedNodeId(nodeId);
    openPreviewNode(newNode);
  }, [openPreviewNode, workspaceData]);

  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    const canvasX = rect ? (e.clientX - rect.left - transform.x) / transform.scale : e.clientX;
    const canvasY = rect ? (e.clientY - rect.top - transform.y) / transform.scale : e.clientY;
    setContextMenu({ x: e.clientX, y: e.clientY, canvasX, canvasY });
  }, [transform]);

  const handleNodeContextMenu = useCallback((e: React.MouseEvent, node: CanvasNode) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId: node.id,
      nodeType: node.type,
      hasChildren: nodes.some((item) => item.parentId === node.id),
    });
  }, [nodes]);

  const handleContextMenuAction = useCallback((action: string, nodeId?: string) => {
    const parentNode = nodeId ? nodes.find((node) => node.id === nodeId) : undefined;
    const x = parentNode ? parentNode.x + parentNode.width + 90 : (contextMenu?.canvasX ?? 520);
    const y = parentNode ? parentNode.y + nodes.filter((node) => node.parentId === parentNode.id).length * 72 : (contextMenu?.canvasY ?? 340);

    switch (action) {
      case 'ai-chat':
      case 'add-ai-chat':
        if (parentNode) handleCreateAINode(parentNode.id, 'ai-chat');
        else createCanvasNodeAt('ai-chat', x, y);
        break;
      case 'ai-review':
      case 'add-ai-review':
        if (parentNode) handleCreateAINode(parentNode.id, 'ai-review');
        else createCanvasNodeAt('ai-review', x, y);
        break;
      case 'ai-synthesis':
      case 'add-synthesis':
        createCanvasNodeAt('synthesis', x, y, parentNode);
        break;
      case 'add-note': {
        const nodeId = `note-${parentNode?.id ?? 'canvas'}-${Date.now()}`;
        const newNode: CanvasNode = {
          id: nodeId,
          type: 'note',
          title: 'Ghi chu',
          content: parentNode?.content || '',
          metaSubtitle: parentNode ? `Tao tu ${parentNode.title}` : 'Ghi chu moi',
          nodeId: parentNode?.nodeId ?? workspaceData?.roadmapNode.id,
          x,
          y,
          width: 196,
          height: 48,
          parentId: parentNode?.id,
        };
        setNodes((prev) => [...prev, newNode]);
        if (parentNode) setEdges((prev) => [...prev, { from: parentNode.id, to: nodeId }]);
        setFocusedNodeId(nodeId);
        openPreviewNode(newNode);
        break;
      }
      case 'open-read':
        if (parentNode) openPreviewNode(parentNode);
        break;
      case 'delete-node':
        if (nodeId) {
          setNodes((prev) => prev.filter((node) => node.id !== nodeId && node.parentId !== nodeId));
          setEdges((prev) => prev.filter((edge) => edge.from !== nodeId && edge.to !== nodeId));
          setPreviewNodes((prev) => prev.filter((node) => node.id !== nodeId));
        }
        break;
    }
    setContextMenu(null);
  }, [contextMenu, createCanvasNodeAt, handleCreateAINode, nodes, openPreviewNode]);

  const handleAddUnitDirect = useCallback((unitIdToAdd: string, unitLabel: string, cx: number, cy: number) => {
    const nodeId = `unit-${unitIdToAdd}-${Date.now()}`;
    const newNode: CanvasNode = {
      id: nodeId,
      type: 'chapter',
      title: unitLabel,
      content: unitLabel,
      nodeId: unitIdToAdd,
      x: cx,
      y: cy,
      width: 192,
      height: 48,
    };
    setNodes((prev) => [...prev, newNode]);
    setFocusedNodeId(nodeId);
  }, []);

  const handleNodeClick = useCallback((id: string) => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;

    if (workspaceData && node.type === 'document' && !node.sourceId && node.nodeId === workspaceData.roadmapNode.id) {
      setFocusedNodeId(id);
      setSidebarContext({
        id: workspaceData.roadmapNode.id,
        kind: 'workspace',
        title: workspaceData.roadmapNode.title,
        description: 'Chon tai lieu lien quan tu toan bo learning unit, sau do bam Ap dung de tao cac node tai lieu.',
      });
      void ensureWorkspaceSourcesLoaded();
      return;
    }

    if (node.type === 'chapter' && node.nodeId) {
      const learningUnit = workspaceData?.learningUnits.find((item) => item.id === node.nodeId);
      setFocusedNodeId(id);
      setSidebarContext({
        id: node.nodeId,
        kind: 'learning-unit',
        title: node.title,
        description: learningUnit?.description || 'Chon mot hoac nhieu tai lieu, bam Ap dung de dua chung len workspace.',
      });
      setLoadingSourcesFor(node.nodeId);
      void ensureSourcesLoaded(node.nodeId).then((rows) => {
        setSidebarSourceCache((prev) => ({ ...prev, [node.nodeId!]: rows }));
      }).finally(() => {
        setLoadingSourcesFor((prev) => (prev === node.nodeId ? null : prev));
      });
      return;
    }

    if (edgeDraft) {
      completeEdgeToNode(id);
      setFocusedNodeId(id);
      return;
    }

    if (node.type === 'note') {
      setFocusedNodeId(id);
      setSidebarContext(null);
      setSidebarNode(node);
      return;
    }

    if (node.type === 'document' && node.sourceId) {
      setFocusedNodeId(id);
      openPreviewNode(node);
      return;
    }

    if (node.type === 'ai-chat' || node.type === 'ai-review' || node.type === 'synthesis') {
      setFocusedNodeId(id);
      openPreviewNode(node);
      return;
    }

    setFocusedNodeId(id);
  }, [completeEdgeToNode, edgeDraft, ensureSourcesLoaded, ensureWorkspaceSourcesLoaded, nodes, openPreviewNode, workspaceData]);

  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) => {
    setNodes((prev) => prev.map((node) => (
      node.id === id
        ? { ...node, x: node.x + dx, y: node.y + dy }
        : node
    )));
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setTransform((prev) => ({ ...prev, scale: Math.min(2.5, Math.max(0.3, prev.scale * delta)) }));
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    element.addEventListener('wheel', handleWheel, { passive: false });
    return () => element.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest('[data-node-id]')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (edgeDraft) {
      const rect = containerRef.current?.getBoundingClientRect();
      const toX = rect ? (e.clientX - rect.left - transform.x) / transform.scale : edgeDraft.x;
      const toY = rect ? (e.clientY - rect.top - transform.y) / transform.scale : edgeDraft.y;
      setEdgeDraft((draft) => draft ? { ...draft, toX, toY } : null);
      return;
    }
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    panStart.current = { x: e.clientX, y: e.clientY };
    setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, [edgeDraft, transform]);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    setEdgeDraft(null);
  }, []);

  const zoomIn = () => setTransform((prev) => ({ ...prev, scale: Math.min(2.5, prev.scale * 1.2) }));
  const zoomOut = () => setTransform((prev) => ({ ...prev, scale: Math.max(0.3, prev.scale / 1.2) }));
  const resetView = () => setTransform({ x: 0, y: 0, scale: 1 });

  const hasSidebar = sidebarContext !== null || sidebarNode !== null;
  const hasExpanded = previewNodes.length > 0;

  return (
    <div className="flex w-full h-full gap-3">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border-2 border-[#333333] bg-[#F5F0EB] transition-all duration-300"
        style={{
          cursor: isPanning.current ? 'grabbing' : 'grab',
          flex: hasSidebar ? '1 1 calc(100% - 412px)' : '1 1 100%',
          minWidth: 300,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleCanvasContextMenu}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('[data-node-id]')) {
            setFocusedNodeId(null);
          }
          setContextMenu(null);
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #CCCCCC 1px, transparent 1px)',
            backgroundSize: `${30 * transform.scale}px ${30 * transform.scale}px`,
            backgroundPosition: `${transform.x}px ${transform.y}px`,
          }}
        />

        {workspaceLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#F5F0EB]/85 text-sm font-medium text-[#5A5C58]">
            Dang tai workspace hoc tap...
          </div>
        )}

        {!workspaceLoading && workspaceError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#F5F0EB]/85 px-6 text-center text-sm font-medium text-[#8B1E3F]">
            {workspaceError}
          </div>
        )}

        <div
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            position: 'absolute',
            width: CANVAS_W,
            height: CANVAS_H,
            willChange: 'transform',
          }}
        >
          <EdgeLayer edges={edges} nodes={nodes} isNodeHidden={() => false} width={CANVAS_W} height={CANVAS_H} />
          {edgeDraft && (
            <svg width={CANVAS_W} height={CANVAS_H} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'visible' }}>
              <path d={`M ${edgeDraft.x} ${edgeDraft.y} C ${(edgeDraft.x + edgeDraft.toX) / 2} ${edgeDraft.y}, ${(edgeDraft.x + edgeDraft.toX) / 2} ${edgeDraft.toY}, ${edgeDraft.toX} ${edgeDraft.toY}`} stroke="#6B2D3E" strokeWidth={2} fill="none" strokeDasharray="5 5" />
            </svg>
          )}

          <AnimatePresence>
            {nodes.map((node) => (
              <CanvasNodeComponent
                key={node.id}
                node={node}
                isExpanded={false}
                isFocused={focusedNodeId === node.id}
                onDrag={handleNodeDrag}
                onClick={handleNodeClick}
                onContextMenu={handleNodeContextMenu}
                onStartEdge={handleStartEdge}
                scale={transform.scale}
                collapsedChildCount={0}
              />
            ))}
          </AnimatePresence>
        </div>

        <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetView} />
        <ZoomIndicator scale={transform.scale} />
        {!hasExpanded && !hasSidebar && !workspaceLoading && !workspaceError && <CanvasHint />}
        <AnimatePresence>
          {contextMenu && (
            <ContextMenu
              menu={contextMenu}
              onAction={handleContextMenuAction}
              onClose={() => setContextMenu(null)}
              onShowAddUnit={() => {}}
              onAddUnitDirect={handleAddUnitDirect}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {hasExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPreviewNodes([]);
            }}
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPreviewNodes([])} />
            <div className="relative z-10 flex gap-4 w-full h-full max-w-[1400px] max-h-[85vh]">
              {previewNodes.map((node) => (
                <ExpandedNodeView
                  key={node.id}
                  node={node}
                  allNodes={nodes}
                  edges={edges}
                  onClose={() => setPreviewNodes((prev) => prev.filter((item) => item.id !== node.id))}
                  onCreateAINode={handleCreateAINode}
                  onUpdateContent={() => {}}
                  isPopup
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sidebarNode && (
        <div className="w-[400px] flex-shrink-0 h-full">
          <ExpandedNoteContent
            node={sidebarNode}
            onClose={() => setSidebarNode(null)}
            onUpdateContent={(nodeId, content) => {
              setNodes((prev) => prev.map((node) => node.id === nodeId ? { ...node, content } : node));
              setSidebarNode((prev) => prev && prev.id === nodeId ? { ...prev, content } : prev);
            }}
          />
        </div>
      )}

      <DocumentSidebar
        context={sidebarNode ? null : sidebarContext}
        sources={currentSources}
        loading={loadingSourcesFor === sidebarContext?.id}
        applying={applyingSourcesFor === sidebarContext?.id}
        selectedSourceIds={selectedSourceIds}
        appliedSourceIds={appliedSourceIds}
        onClose={() => setSidebarContext(null)}
        onToggleSource={handleToggleSource}
        onApplySources={handleApplySources}
      />
    </div>
  );
}
