import { apiFetch, ApiError } from '@/shared/api/client';

export interface LearningUnit {
  id: string;
  roadmap_node_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LearningUnitSource {
  source_id: string;
  source_label: string;
  source_type: string;
  source_ref: string;
  passage_count: number;
}

export interface LearningUnitPassage {
  passage_id: string;
  source_id: string;
  source_label: string;
  source_type: string;
  text: string;
  locator_type: string;
  locator: Record<string, unknown>;
  sort_order: number;
}

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
  learning_units?: LearningUnit[];
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

export async function fetchLearningUnitsForRoadmapNode(roadmapNodeId: string): Promise<LearningUnit[]> {
  return apiFetch<LearningUnit[]>(`/roadmaps/nodes/${roadmapNodeId}/learning-units`);
}

export async function fetchSourcesForLearningUnit(learningNodeId: string): Promise<LearningUnitSource[]> {
  return apiFetch<LearningUnitSource[]>(`/roadmaps/learning-units/${learningNodeId}/sources`);
}

export async function fetchPassagesForLearningUnitSource(
  learningNodeId: string,
  sourceId: string,
): Promise<LearningUnitPassage[]> {
  return apiFetch<LearningUnitPassage[]>(
    `/roadmaps/learning-units/${learningNodeId}/sources/${sourceId}/passages`,
  );
}

export function findRoadmapNodeById(nodes: RoadmapNode[], nodeId: string): RoadmapNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    const found = findRoadmapNodeById(node.children ?? [], nodeId);
    if (found) return found;
  }
  return null;
}
