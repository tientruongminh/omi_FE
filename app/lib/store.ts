import { create } from 'zustand';
import { Project } from './data';

// Vietnamese projects (initial mock data)
const initialProjects: Project[] = [
  {
    id: 'os-linux',
    title: 'Hệ Điều Hành và Linux',
    description: 'Tìm hiểu về hệ điều hành, kiến trúc Linux và lập trình Shell cơ bản.',
    date: '24 Tháng 10, 2024',
    progress: 60,
  },
  {
    id: 'kinh-te-vi-mo',
    title: 'Kinh Tế Vi Mô',
    description: 'Nghiên cứu các nguyên lý kinh tế vi mô, cung cầu và thị trường.',
    date: '2 Tháng 11, 2024',
    isComplete: true,
  },
  {
    id: 'lap-trinh-web',
    title: 'Lập Trình Web',
    description: 'Học HTML, CSS, JavaScript và các framework hiện đại để xây dựng web.',
    date: '15 Tháng 10, 2024',
    progress: 75,
  },
];

interface OmiLearnState {
  projects: Project[];
  currentProject: Project | null;
  isCreateModalOpen: boolean;
  isPlanModalOpen: boolean;
  hasPlan: boolean;
  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createProject: (name: string, description: string) => string;
  setCurrentProject: (id: string) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  setPlanComplete: () => void;
}

export const useOmiLearnStore = create<OmiLearnState>((set, get) => ({
  projects: initialProjects,
  currentProject: null,
  isCreateModalOpen: false,
  isPlanModalOpen: false,
  hasPlan: false,

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  createProject: (name: string, description: string) => {
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

  setCurrentProject: (id: string) => {
    const project = get().projects.find((p) => p.id === id) ?? null;
    set({ currentProject: project });
  },

  openPlanModal: () => set({ isPlanModalOpen: true }),
  closePlanModal: () => set({ isPlanModalOpen: false }),
  setPlanComplete: () => set({ hasPlan: true, isPlanModalOpen: false }),
}));
