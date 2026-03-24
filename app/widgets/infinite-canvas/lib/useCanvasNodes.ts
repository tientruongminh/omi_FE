'use client';

import { useCallback, useState } from 'react';
import { CanvasNode, CanvasEdge } from '../model/types';

export function useCanvasNodes(
  initialNodes: CanvasNode[],
  initialEdges: CanvasEdge[],
) {
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

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
