'use client';

import { useCallback } from 'react';
import { CanvasNode } from '../model/types';

export function useNodeDrag(
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>,
) {
  const handleNodeDrag = useCallback((id: string, dx: number, dy: number) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: n.x + dx, y: n.y + dy } : n))
    );
  }, [setNodes]);

  return { handleNodeDrag };
}
