import { apiFetch } from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────

export interface ApiProject {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectsResponse {
  projects: ApiProject[];
  limit: number;
  offset: number;
}

export interface ProjectResponse {
  project: ApiProject;
}

export interface ProgressSummary {
  total_nodes: number;
  completed_nodes: number;
  percentage: number;
}

export interface ProgressDetail {
  node_id: string;
  title: string;
  status: string;
  completed_at: string | null;
}

export interface ProgressSummaryResponse {
  summary: ProgressSummary;
  details: ProgressDetail[];
}

export interface CalendarEntry {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  project_id?: string;
}

export interface CalendarEntriesResponse {
  entries: CalendarEntry[];
}

export interface SkillsSnapshot {
  skills: { name: string; level: number; category: string }[];
}

// ─── API ─────────────────────────────────────────────────────

export const projectApi = {
  list() {
    return apiFetch<ProjectsResponse>('/learning/projects');
  },

  get(id: string) {
    return apiFetch<ProjectResponse>(`/learning/projects/${id}`);
  },

  create(name: string, description: string) {
    return apiFetch<ProjectResponse>('/learning/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  update(id: string, data: Partial<{ name: string; description: string }>) {
    return apiFetch<ProjectResponse>(`/learning/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string) {
    return apiFetch<void>(`/learning/projects/${id}`, { method: 'DELETE' });
  },

  addMember(projectId: string, userId: string, role: string) {
    return apiFetch(`/learning/projects/${projectId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, role }),
    });
  },

  removeMember(projectId: string, userId: string) {
    return apiFetch(`/learning/projects/${projectId}/members/${userId}`, { method: 'DELETE' });
  },

  submitSurvey(projectId: string, answers: Record<string, string>) {
    return apiFetch(`/learning/projects/${projectId}/survey`, {
      method: 'POST',
      body: JSON.stringify(answers),
    });
  },

  getProgressSummary(projectId: string) {
    return apiFetch<ProgressSummaryResponse>(`/learning/progress/summary/${projectId}`);
  },

  getCalendarEntries() {
    return apiFetch<CalendarEntriesResponse>('/learning/calendar/entries');
  },

  getSkillsSnapshot() {
    return apiFetch<SkillsSnapshot>('/learning/skills/snapshot');
  },
};
