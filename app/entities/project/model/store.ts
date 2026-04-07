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
  projectsLoaded: boolean;
  _isFetchingProjects: boolean;
  isLoadingProjects: boolean;
  projectsError: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createProject: (name: string, description: string) => Promise<string>;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => Promise<void>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
  setCurrentProject: (id: string) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  setPlanComplete: () => void;
  resetProjects: () => void;
}

export const useOmiLearnStore = create<OmiLearnState>((set, get) => ({
  projects: [],
  currentProject: null,
  isCreateModalOpen: false,
  isPlanModalOpen: false,
  hasPlan: false,
  projectsLoaded: false,
  _isFetchingProjects: false,
  isLoadingProjects: false,
  projectsError: null,

  fetchProjects: async () => {
    if (get()._isFetchingProjects || get().projectsLoaded) return;
    set({ _isFetchingProjects: true, isLoadingProjects: true, projectsError: null });
    try {
      const data = await projectApi.list();
      // Backend returns array directly, not { projects: [...] }
      const raw = Array.isArray(data) ? data : (data as any).projects ?? [];
      const projects = raw.map(apiProjectToProject);
      set({ projects, projectsLoaded: true, _isFetchingProjects: false, isLoadingProjects: false });
    } catch (e) {
      const err = e as { error?: string };
      console.error('[Store] Failed to fetch projects:', err);
      set({
        _isFetchingProjects: false,
        isLoadingProjects: false,
        projectsError: err.error ?? 'Không thể tải dự án',
      });
      // Don't set projectsLoaded=true on failure — allow retry when auth is ready
    }
  },

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  createProject: async (name: string, description: string) => {
    try {
      const data = await projectApi.create(name, description);
      const newProject = apiProjectToProject(data.project);
      set((state) => ({
        projects: [newProject, ...state.projects],
        isCreateModalOpen: false,
      }));
      return newProject.id;
    } catch (err) {
      console.error('[Store] Failed to create project:', err);
      throw err;
    }
  },

  deleteProject: async (id: string) => {
    const prev = get().projects;
    // Optimistic remove
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
    try {
      await projectApi.delete(id);
    } catch (err) {
      console.error('[Store] Failed to delete project:', err);
      set({ projects: prev }); // rollback
      throw err;
    }
  },

  renameProject: async (id: string, newName: string) => {
    const prev = get().projects;
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, title: newName } : p,
      ),
    }));
    try {
      await projectApi.update(id, { name: newName });
    } catch (err) {
      console.error('[Store] Failed to rename project:', err);
      set({ projects: prev }); // rollback
      throw err;
    }
  },

  updateProject: async (id: string, data: Partial<Project>) => {
    const prev = get().projects;
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) => p.id === id ? { ...p, ...data } : p),
    }));
    try {
      await projectApi.update(id, {
        name: data.title,
        description: data.description,
      });
    } catch (err) {
      console.error('[Store] Failed to update project:', err);
      set({ projects: prev }); // rollback
      throw err;
    }
  },

  addProject: (project: Project) => {
    set((state) => ({
      projects: [project, ...state.projects],
      isCreateModalOpen: false,
    }));
  },

  setCurrentProject: (id: string) => {
    const project = get().projects.find((p) => p.id === id) ?? null;
    set({ currentProject: project });
  },

  openPlanModal: () => set({ isPlanModalOpen: true }),
  closePlanModal: () => set({ isPlanModalOpen: false }),
  setPlanComplete: () => set({ hasPlan: true, isPlanModalOpen: false }),

  resetProjects: () => set({
    projects: [],
    projectsLoaded: false,
    currentProject: null,
    _isFetchingProjects: false,
    isLoadingProjects: false,
    projectsError: null,
  }),
}));
