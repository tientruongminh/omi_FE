import { create } from 'zustand';
import { Project } from './types';
import { apiFetch } from '@/shared/api/client';

// Backend project shape
interface BackendProject {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

function backendToProject(bp: BackendProject): Project {
  const d = new Date(bp.created_at);
  return {
    id: bp.id,
    title: bp.name,
    description: bp.description || '',
    date: d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
    progress: 0,
  };
}

interface OmiLearnState {
  projects: Project[];
  currentProject: Project | null;
  isCreateModalOpen: boolean;
  isPlanModalOpen: boolean;
  hasPlan: boolean;
  projectsLoaded: boolean;
  _isFetchingProjects: boolean;
  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createProject: (name: string, description: string) => Promise<string>;
  addProject: (project: Project) => void;
  setCurrentProject: (id: string) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  setPlanComplete: () => void;
  fetchProjects: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, newName: string) => Promise<void>;
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

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  fetchProjects: async () => {
    if (get()._isFetchingProjects || get().projectsLoaded) return;
    set({ _isFetchingProjects: true });
    try {
      const data = await apiFetch<BackendProject[]>('/learning/projects');
      const projects = data.map(backendToProject);
      set({ projects, projectsLoaded: true, _isFetchingProjects: false });
    } catch (err) {
      console.error('[Store] Failed to fetch projects:', err);
      set({ _isFetchingProjects: false });
      // Don't set projectsLoaded=true on failure — allow retry when auth is ready
    }
  },

  createProject: async (name: string, description: string) => {
    try {
      const data = await apiFetch<BackendProject>('/learning/projects', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      const newProject = backendToProject(data);
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
      await apiFetch(`/learning/projects/${id}`, { method: 'DELETE' });
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
      await apiFetch(`/learning/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName }),
      });
    } catch (err) {
      console.error('[Store] Failed to rename project:', err);
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

  resetProjects: () => set({ projects: [], projectsLoaded: false, currentProject: null, _isFetchingProjects: false }),
}));
