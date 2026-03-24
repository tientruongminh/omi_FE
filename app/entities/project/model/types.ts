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
