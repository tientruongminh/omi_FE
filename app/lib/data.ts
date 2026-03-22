// OmiLearn Data Types & Mock Data

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  progress?: number; // 0-100, undefined means complete
  isComplete?: boolean;
}

export interface SharedCourse {
  id: string;
  title: string;
  sharedBy: string;
  timeAgo: string;
}

export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'child';
  expanded?: boolean;
}

export interface ContentCard {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  tags: Array<{ label: string; color: 'green' | 'coral' }>;
}

// Dashboard Data
export const projects: Project[] = [
  {
    id: '1',
    title: 'Sustainable Branding',
    description: 'Brand identity development focused on eco-conscious design principles and sustainable visual language.',
    date: 'OCT 24, 2024',
    progress: 60,
  },
  {
    id: '2',
    title: 'Urban Oasis 2024',
    description: 'Urban landscape design project exploring green spaces and community-centered environments.',
    date: 'NOV 02, 2024',
    isComplete: true,
  },
  {
    id: '3',
    title: 'Mindful Motion App',
    description: 'Mobile application design for mindfulness and wellness, featuring calm animations and intuitive UI.',
    date: 'OCT 15, 2024',
    progress: 75,
  },
];

export const sharedCourses: SharedCourse[] = [
  {
    id: '1',
    title: 'Character Design Masterclass',
    sharedBy: 'Elena Sketch',
    timeAgo: '2 hours ago',
  },
  {
    id: '2',
    title: 'Winter Palette Guide',
    sharedBy: 'Color Lab',
    timeAgo: 'Yesterday',
  },
  {
    id: '3',
    title: 'Isometric Layout Templates',
    sharedBy: 'Studio Grid',
    timeAgo: '3 days ago',
  },
];

// Mind Map Data
export const mindMapNodes: MindMapNode[] = [
  { id: 'root', label: 'Hệ Điều Hành và Linux', type: 'root' },
  { id: '1', label: 'Khái Niệm Cơ Bản', type: 'child' },
  { id: '2', label: 'Kiến Trúc Hệ Thống', type: 'child' },
  { id: '3', label: 'Quản Lý Tài Nguyên', type: 'child' },
  { id: '4', label: 'Giao Diện Người Dùng (UI)', type: 'child', expanded: true },
  { id: '5', label: 'Hệ Điều Hành Phổ Biến', type: 'child' },
  { id: '6', label: 'Lập Trình Shell (BASH)', type: 'child' },
  { id: '7', label: 'Khởi Động và Debug', type: 'child' },
];

export const contentCards: ContentCard[] = [
  {
    id: '1',
    type: 'video',
    title: 'Quy trình thiết kế kiến trúc | 8 bước CHUẨN HÓA kiến...',
    tags: [
      { label: 'AI hỏi đáp', color: 'green' },
      { label: 'Ôn tập', color: 'coral' },
    ],
  },
  {
    id: '2',
    type: 'pdf',
    title: 'Quy trình thiết kế kiến trúc | 8 bước CHUẨN HÓA kiến...',
    tags: [
      { label: 'AI hỏi đáp', color: 'green' },
      { label: 'Ôn tập', color: 'coral' },
    ],
  },
];
