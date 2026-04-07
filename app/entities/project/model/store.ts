import { create } from 'zustand';
import { Project } from './types';
import { projectApi } from '../api/project';

// ─── Helper ─────────────────────────────────────────────────
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function apiProjectToProject(p: { id: string; name: string; description: string | null; created_at: string }): Project {
  return {
    id: p.id,
    title: p.name,
    description: p.description ?? '',
    date: formatDate(p.created_at),
    progress: 0,
  };
}

// ─── State ──────────────────────────────────────────────────
interface OmiLearnState {
  projects: Project[];
  currentProject: Project | null;
  isCreateModalOpen: boolean;
  isPlanModalOpen: boolean;
  hasPlan: boolean;
  isLoadingProjects: boolean;
  projectsError: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createProject: (name: string, description: string) => string;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  setCurrentProject: (id: string) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  setPlanComplete: () => void;
}

export const useOmiLearnStore = create<OmiLearnState>((set, get) => ({
  projects: [],
  currentProject: null,
  isCreateModalOpen: false,
  isPlanModalOpen: false,
  hasPlan: false,
  isLoadingProjects: false,
  projectsError: null,

  fetchProjects: async () => {
    set({ isLoadingProjects: true, projectsError: null });
    try {
      const data = await projectApi.list();
      const projects = data.projects.map(apiProjectToProject);
      set({ projects, isLoadingProjects: false });
    } catch (e) {
      const err = e as { error?: string };
      set({ isLoadingProjects: false, projectsError: err.error ?? 'Không thể tải dự án' });
    }
  },

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  createProject: (name: string, description: string) => {
    // Optimistic local ID — real project creation is async in CreateProjectModal
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
    const newProject: Project = {
      id,
      title: name,
      description,
      date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
      progress: 0,
    };
    set((state) => ({
      projects: [newProject, ...state.projects],
      isCreateModalOpen: false,
    }));
    return id;
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [project, ...state.projects],
      isCreateModalOpen: false,
    }));
  },

  deleteProject: async (id: string) => {
    // Optimistic delete
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
    try {
      await projectApi.delete(id);
    } catch {
      // Re-fetch on failure
      get().fetchProjects();
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? { ...p, ...data } : p),
    }));
    try {
      await projectApi.update(id, {
        name: data.title,
        description: data.description,
      });
    } catch {
      // Re-fetch on failure
      get().fetchProjects();
    }
  },

  setCurrentProject: (id: string) => {
    const project = get().projects.find((p) => p.id === id) ?? null;
    set({ currentProject: project });
  },

  openPlanModal: () => set({ isPlanModalOpen: true }),
  closePlanModal: () => set({ isPlanModalOpen: false }),
  setPlanComplete: () => set({ hasPlan: true, isPlanModalOpen: false }),
}));
