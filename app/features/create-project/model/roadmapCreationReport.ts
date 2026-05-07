'use client';

export interface RoadmapStreamProgressEvent {
  stage: string;
  status: 'started' | 'completed';
  progress: number;
  message: string;
  elapsed_ms?: number;
  meta?: Record<string, unknown>;
}

export interface ProgressStageState {
  key: string;
  label: string;
  status: 'pending' | 'active' | 'done';
  elapsedMs?: number;
  message?: string;
}

export interface RoadmapCreationReport {
  projectId: string;
  projectName: string;
  projectDescription?: string | null;
  sourceCount: number;
  uploadPercent: number;
  uploadMessage: string | null;
  roadmapPercent: number;
  roadmapStatusMessage: string | null;
  progressStages: ProgressStageState[];
  startedAt: number;
  completedAt?: number;
  totalElapsedMs: number;
  uploadElapsedMs?: number;
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string | null;
}

export const ROADMAP_STAGE_LABELS: Record<string, string> = {
  queued: 'Tiep nhan yeu cau',
  extracting_sources: 'Trich xuat tai lieu',
  creating_project: 'Khoi tao project',
  persisting_passages: 'Luu evidence passages',
  building_chunks: 'Chia semantic chunks',
  embedding_chunks: 'Embedding chunks',
  labeling_modules: 'Dat ten modules',
  labeling_learning_units: 'Dat ten learning units',
  labeling_branches_root: 'Dat ten branches va roadmap',
  persisting_roadmap: 'Luu roadmap cuoi cung',
  loading_result: 'Tai ket qua tra ve',
};

export const ROADMAP_STAGE_ORDER = Object.keys(ROADMAP_STAGE_LABELS);

const STORAGE_KEY_PREFIX = 'omilearn:roadmap-creation-report:';

export function createInitialProgressStages(): ProgressStageState[] {
  return ROADMAP_STAGE_ORDER.map((key) => ({
    key,
    label: ROADMAP_STAGE_LABELS[key],
    status: 'pending',
  }));
}

export function formatElapsed(ms?: number): string | null {
  if (!ms || ms <= 0) return null;
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export function calculateOverallRoadmapProgress(
  uploadPercent: number,
  roadmapPercent: number,
  hasUploadStage: boolean,
): number {
  const safeUploadPercent = Math.max(0, Math.min(100, uploadPercent));
  const safeRoadmapPercent = Math.max(0, Math.min(100, roadmapPercent));

  // We keep upload as a smaller portion of the total bar so the roadmap phase
  // still visually represents most of the journey without exposing internals.
  if (!hasUploadStage) {
    return safeRoadmapPercent;
  }

  return Math.round(safeUploadPercent * 0.35 + safeRoadmapPercent * 0.65);
}

export function saveRoadmapCreationReport(report: RoadmapCreationReport): void {
  if (typeof window === 'undefined' || !report.projectId) return;
  window.sessionStorage.setItem(
    `${STORAGE_KEY_PREFIX}${report.projectId}`,
    JSON.stringify(report),
  );
}

export function loadRoadmapCreationReport(projectId: string): RoadmapCreationReport | null {
  if (typeof window === 'undefined' || !projectId) return null;
  const raw = window.sessionStorage.getItem(`${STORAGE_KEY_PREFIX}${projectId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RoadmapCreationReport;
  } catch {
    return null;
  }
}
