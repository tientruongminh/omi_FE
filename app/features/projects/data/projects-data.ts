// Projects feature data
import { Project, ProjectMember, SharedCourse } from '@/shared/types';

export type { Project, ProjectMember, SharedCourse };

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
    isB2B: true,
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

export const projectMembers: ProjectMember[] = [
  { id: 'm1', name: 'Minh Anh', initials: 'MA', color: '#4CD964', role: 'editor' },
  { id: 'm2', name: 'Hoàng Nam', initials: 'HN', color: '#818CF8', role: 'viewer' },
  { id: 'm3', name: 'Thu Lan', initials: 'TL', color: '#F08080', role: 'editor' },
];

export const sharedCourses: SharedCourse[] = [
  { id: '1', title: 'Lập Trình Python Nâng Cao', sharedBy: 'Minh Anh', timeAgo: '2 giờ trước' },
  { id: '2', title: 'Thiết Kế Cơ Sở Dữ Liệu', sharedBy: 'Hoàng Nam', timeAgo: 'Hôm qua' },
  { id: '3', title: 'Phát Triển Web Full-Stack', sharedBy: 'Thu Hà', timeAgo: '3 ngày trước' },
];
