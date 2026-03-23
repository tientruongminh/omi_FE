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

export interface RoadmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface RoadmapEdge {
  id: string;
  from: string;
  to: string;
}

export interface DashboardStat {
  label: string;
  percentage: number;
  color: string;
}

export interface StudySession {
  id: string;
  title: string;
  date: string;
  duration: string;
  day: string;
}

// Dashboard Data
export const projects: Project[] = [
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

export const sharedCourses: SharedCourse[] = [
  {
    id: '1',
    title: 'Thiết kế nhân vật nâng cao',
    sharedBy: 'Minh Anh',
    timeAgo: '2 giờ trước',
  },
  {
    id: '2',
    title: 'Hướng dẫn bảng màu mùa đông',
    sharedBy: 'Color Lab',
    timeAgo: 'Hôm qua',
  },
  {
    id: '3',
    title: 'Mẫu bố cục Isometric',
    sharedBy: 'Studio Grid',
    timeAgo: '3 ngày trước',
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

// Roadmap data for OS & Linux project
export const defaultRoadmapNodes: RoadmapNode[] = [
  { id: 'n1', label: 'Khái Niệm Cơ Bản', x: 300, y: 60 },
  { id: 'n2', label: 'Kiến Trúc Hệ Thống', x: 300, y: 160 },
  { id: 'n3', label: 'Quản Lý Tài Nguyên', x: 100, y: 280 },
  { id: 'n4', label: 'Giao Diện Người Dùng', x: 500, y: 280 },
  { id: 'n5', label: 'Hệ Điều Hành Phổ Biến', x: 100, y: 400 },
  { id: 'n6', label: 'Lập Trình Shell', x: 500, y: 400 },
  { id: 'n7', label: 'Khởi Động và Debug', x: 300, y: 500 },
];

export const defaultRoadmapEdges: RoadmapEdge[] = [
  { id: 'e1-2', from: 'n1', to: 'n2' },
  { id: 'e2-3', from: 'n2', to: 'n3' },
  { id: 'e2-4', from: 'n2', to: 'n4' },
  { id: 'e3-5', from: 'n3', to: 'n5' },
  { id: 'e4-6', from: 'n4', to: 'n6' },
  { id: 'e5-7', from: 'n5', to: 'n7' },
  { id: 'e6-7', from: 'n6', to: 'n7' },
];

// Dashboard stats
export const dashboardStats: DashboardStat[] = [
  { label: 'Phân tích', percentage: 85, color: '#818CF8' },
  { label: 'Tổng hợp', percentage: 70, color: '#4CD964' },
  { label: 'Phản biện', percentage: 45, color: '#F97316' },
  { label: 'Phỏng vấn', percentage: 30, color: '#A78BFA' },
];

// Upcoming study sessions
export const upcomingStudySessions: StudySession[] = [
  { id: 's1', title: 'Quản Lý Tài Nguyên', date: 'Thứ 2, 25 Tháng 11', duration: '2 giờ', day: 'T2' },
  { id: 's2', title: 'Lập Trình Shell', date: 'Thứ 4, 27 Tháng 11', duration: '1.5 giờ', day: 'T4' },
  { id: 's3', title: 'Khởi Động và Debug', date: 'Thứ 6, 29 Tháng 11', duration: '2 giờ', day: 'T6' },
];
