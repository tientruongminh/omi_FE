import { create } from 'zustand';
import { Project } from '@/shared/types';

// Vietnamese CS projects (initial mock data)
const initialProjects: Project[] = [
  {
    id: '1',
    title: 'Hệ Điều Hành và Linux',
    description: 'Nghiên cứu kiến trúc hệ điều hành, quản lý tiến trình, bộ nhớ và hệ thống file trên Linux.',
    date: '15 Tháng 3, 2025',
    progress: 65,
  },
  {
    id: '2',
    title: 'Cấu Trúc Dữ Liệu và Giải Thuật',
    description: 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao: mảng, danh sách liên kết, cây, đồ thị, và các thuật toán sắp xếp, tìm kiếm.',
    date: '2 Tháng 3, 2025',
    isComplete: true,
  },
  {
    id: '3',
    title: 'Mạng Máy Tính',
    description: 'Mô hình OSI, TCP/IP, routing, switching, bảo mật mạng và thực hành cấu hình mạng LAN/WAN.',
    date: '20 Tháng 2, 2025',
    progress: 40,
  },
  {
    id: '4',
    title: 'Trí Tuệ Nhân Tạo',
    description: 'Machine Learning cơ bản, neural networks, NLP và computer vision. Ứng dụng AI trong thực tế.',
    date: '10 Tháng 3, 2025',
    progress: 25,
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
