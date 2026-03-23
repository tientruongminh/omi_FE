// OmiLearn Data Types & Mock Data

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  progress?: number; // 0-100, undefined means complete
  isComplete?: boolean;
  isB2B?: boolean; // B2B/group course flag
}

export interface ProjectMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  role: 'owner' | 'editor' | 'viewer';
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
  unitId?: string; // links to a mindmap node id
}

// Dashboard Data
export const projects: Project[] = [
  {
    id: '1',
    title: 'Hệ Điều Hành và Linux',
    description: 'Nghiên cứu kiến trúc hệ điều hành, quản lý tiến trình, bộ nhớ và hệ thống file trên Linux.',
    date: '15 Tháng 3, 2025',
    progress: 65,
    isB2B: false,
  },
  {
    id: '2',
    title: 'Cấu Trúc Dữ Liệu và Giải Thuật',
    description: 'Tìm hiểu các cấu trúc dữ liệu cơ bản và nâng cao: mảng, danh sách liên kết, cây, đồ thị, và các thuật toán sắp xếp, tìm kiếm.',
    date: '2 Tháng 3, 2025',
    isComplete: true,
    isB2B: false,
  },
  {
    id: '3',
    title: 'Mạng Máy Tính',
    description: 'Mô hình OSI, TCP/IP, routing, switching, bảo mật mạng và thực hành cấu hình mạng LAN/WAN.',
    date: '20 Tháng 2, 2025',
    progress: 40,
    isB2B: true, // B2B group course
  },
  {
    id: '4',
    title: 'Trí Tuệ Nhân Tạo',
    description: 'Machine Learning cơ bản, neural networks, NLP và computer vision. Ứng dụng AI trong thực tế.',
    date: '10 Tháng 3, 2025',
    progress: 25,
    isB2B: false,
  },
];

// Project members mock data
export const projectMembers: ProjectMember[] = [
  { id: 'm1', name: 'Minh Anh', initials: 'MA', color: '#4CD964', role: 'editor' },
  { id: 'm2', name: 'Hoàng Nam', initials: 'HN', color: '#818CF8', role: 'viewer' },
  { id: 'm3', name: 'Thu Lan', initials: 'TL', color: '#F08080', role: 'editor' },
];

export const sharedCourses: SharedCourse[] = [
  {
    id: '1',
    title: 'Lập Trình Python Nâng Cao',
    sharedBy: 'Minh Anh',
    timeAgo: '2 giờ trước',
  },
  {
    id: '2',
    title: 'Thiết Kế Cơ Sở Dữ Liệu',
    sharedBy: 'Hoàng Nam',
    timeAgo: 'Hôm qua',
  },
  {
    id: '3',
    title: 'Phát Triển Web Full-Stack',
    sharedBy: 'Thu Hà',
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
    title: 'GUI vs CLI — So sánh chi tiết | Hệ Điều Hành và Linux',
    tags: [
      { label: 'AI hỏi đáp', color: 'green' },
      { label: 'Ôn tập', color: 'coral' },
    ],
  },
  {
    id: '2',
    type: 'pdf',
    title: 'Lịch sử phát triển giao diện: từ CLI đến AR/VR',
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
  { label: 'Phân tích', percentage: 78, color: '#818CF8' },
  { label: 'Tổng hợp', percentage: 65, color: '#4CD964' },
  { label: 'Phản biện', percentage: 52, color: '#F97316' },
  { label: 'Phỏng vấn', percentage: 40, color: '#A78BFA' },
];

// Upcoming study sessions
export const upcomingStudySessions: StudySession[] = [
  { id: 's1', title: 'Quản Lý Tiến Trình', date: 'Thứ 2, 08:00 - 10:00', duration: '2 giờ', day: 'T2', unitId: 'quan-ly' },
  { id: 's2', title: 'Hệ Thống File Linux', date: 'Thứ 4, 14:00 - 16:00', duration: '2 giờ', day: 'T4', unitId: 'khoi-dong' },
  { id: 's3', title: 'Lập Trình Shell Bash', date: 'Thứ 6, 10:00 - 12:00', duration: '2 giờ', day: 'T6', unitId: 'lap-trinh-shell' },
];
