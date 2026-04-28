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

export interface RenderedDocumentSection {
  section_id: string;
  heading: string;
  content: string;
  passage_ids: string[];
  references: RenderedDocumentReference[];
}

export interface RenderedDocumentReference {
  passage_id: string;
  source_ref: string;
  source_type: string;
  source_label: string;
  locator_type: string;
  locator: Record<string, unknown>;
  excerpt: string;
}

export interface RenderedDocumentView {
  source_id: string;
  source_label: string;
  source_type: string;
  source_ref: string;
  summary: string;
  sections: RenderedDocumentSection[];
}

export interface SourceDisplayInfo {
  source_label: string;
  source_ref: string;
}

function normalizeRenderedDocumentView(payload: unknown): RenderedDocumentView {
  const raw = (payload ?? {}) as Partial<RenderedDocumentView> & {
    sections?: Array<Partial<RenderedDocumentSection> | null> | null;
  };

  return {
    source_id: typeof raw.source_id === 'string' ? raw.source_id : '',
    source_label: typeof raw.source_label === 'string' ? raw.source_label : '',
    source_type: typeof raw.source_type === 'string' ? raw.source_type : 'text',
    source_ref: typeof raw.source_ref === 'string' ? raw.source_ref : '',
    summary: typeof raw.summary === 'string' ? raw.summary : '',
    sections: Array.isArray(raw.sections)
      ? raw.sections
          .filter((section) => Boolean(section))
          .map((section, index) => {
            const safeSection = (section ?? {}) as Partial<RenderedDocumentSection>;
            return ({
            section_id:
              typeof safeSection.section_id === 'string' && safeSection.section_id
                ? safeSection.section_id
                : `section-${index}`,
            heading:
              typeof safeSection.heading === 'string' && safeSection.heading
                ? safeSection.heading
                : `Muc ${index + 1}`,
            content: typeof safeSection.content === 'string' ? safeSection.content : '',
            passage_ids: Array.isArray(safeSection.passage_ids)
              ? safeSection.passage_ids.filter((value): value is string => typeof value === 'string')
              : [],
            references: Array.isArray(safeSection.references)
              ? safeSection.references.filter(
                  (reference): reference is RenderedDocumentReference =>
                    Boolean(reference) && typeof reference.passage_id === 'string',
                )
              : [],
          });
        })
      : [],
  };
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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function stripSourcePrefix(value: string): string {
  return value
    .trim()
    .replace(/^.*[\\/]/, '')
    .replace(/^\d{10,16}-/, '')
    .replace(/^[0-9a-f-]{32,40}-/i, '');
}

function prettifySourceCandidate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const pathName = stripSourcePrefix(decodeURIComponent(url.pathname));
      return pathName || url.hostname || trimmed;
    } catch {
      return trimmed;
    }
  }

  return stripSourcePrefix(decodeURIComponent(trimmed));
}

export function getSourceDisplayLabel(
  source: SourceDisplayInfo,
): string {
  const rawLabel = (source.source_label || '').trim();
  if (rawLabel && !UUID_RE.test(rawLabel)) {
    return prettifySourceCandidate(rawLabel) || rawLabel;
  }

  const rawRef = (source.source_ref || '').trim();
  return prettifySourceCandidate(rawRef) || rawLabel || 'Tai lieu';
}

export function getLearningSourceDisplayLabel(
  source: Pick<LearningUnitSource, 'source_label' | 'source_ref'>,
): string {
  return getSourceDisplayLabel(source);
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

export async function fetchRenderedDocumentView(
  sourceId: string,
  passageIds: string[],
): Promise<RenderedDocumentView> {
  const result = await apiFetch<RenderedDocumentView>('/roadmaps/rendered-documents', {
    method: 'POST',
    body: JSON.stringify({
      source_id: sourceId,
      passage_ids: passageIds,
    }),
  });
  return normalizeRenderedDocumentView(result);
}

export function findRoadmapNodeById(nodes: RoadmapNode[], nodeId: string): RoadmapNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    const found = findRoadmapNodeById(node.children ?? [], nodeId);
    if (found) return found;
  }
  return null;
}
