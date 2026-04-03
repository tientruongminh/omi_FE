import { apiFetch, ApiError } from '@/shared/api/client';

export interface RoadmapNode {
  id: string;
  roadmap_id: string;
  parent_id: string | null;
  title: string;
  status: string;
  position_x: number | null;
  position_y: number | null;
  sort_order: number;
  is_expanded: boolean;
  is_completed: boolean;
  completed_at: string | null;
  children: RoadmapNode[];
  created_at: string;
  updated_at: string;
}

export interface Roadmap {
  id: string;
  project_id: string;
  created_by: string;
  title: string;
  description: string | null;
  canvas_state: Record<string, unknown>;
  roadmap_nodes: RoadmapNode[];
  created_at: string;
  updated_at: string;
}

export async function fetchRoadmapByProject(projectId: string): Promise<Roadmap | null> {
  try {
    return await apiFetch<Roadmap>(`/roadmaps/by-project/${projectId}`);
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) return null;
    throw e;
  }
}
