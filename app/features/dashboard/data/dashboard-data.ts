// Dashboard feature data
import { DashboardStat, StudySession } from '@/shared/types';

export type { DashboardStat, StudySession };

export const dashboardStats: DashboardStat[] = [
  { label: 'Phân tích', percentage: 78, color: '#818CF8' },
  { label: 'Tổng hợp', percentage: 65, color: '#4CD964' },
  { label: 'Phản biện', percentage: 52, color: '#F97316' },
  { label: 'Phỏng vấn', percentage: 40, color: '#A78BFA' },
];

export const upcomingStudySessions: StudySession[] = [
  { id: 's1', title: 'Quản Lý Tiến Trình', date: 'Thứ 2, 08:00 - 10:00', duration: '2 giờ', day: 'T2', unitId: 'quan-ly' },
  { id: 's2', title: 'Hệ Thống File Linux', date: 'Thứ 4, 14:00 - 16:00', duration: '2 giờ', day: 'T4', unitId: 'khoi-dong' },
  { id: 's3', title: 'Lập Trình Shell Bash', date: 'Thứ 6, 10:00 - 12:00', duration: '2 giờ', day: 'T6', unitId: 'lap-trinh-shell' },
];
