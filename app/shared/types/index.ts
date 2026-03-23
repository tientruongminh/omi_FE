// OmiLearn Shared Type Definitions

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
  unitId?: string;
}
