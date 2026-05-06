import { apiFetch } from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────

export interface AdminDashboardData {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  avg_completion: number;
}

export interface AdminActivity {
  id: string;
  user_name: string;
  action: string;
  created_at: string;
}

export interface AdminActivitiesResponse {
  activities: AdminActivity[];
}

export interface AdminUser {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  created_at: string;
  course_count?: number;
  online?: boolean;
  last_seen_at?: string | null;
  active_seconds?: number;
  active_minutes?: number;
  current_path?: string | null;
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserActivitySession {
  session_id: string;
  first_seen_at: string;
  last_seen_at: string;
  active_seconds: number;
  last_path: string;
  is_active: boolean;
}

export interface UserActivityPath {
  path: string;
  active_seconds: number;
  sessions: number;
  last_seen_at: string;
}

export interface UserActivityAnalytics {
  user_id: string;
  total_active_seconds: number;
  session_count: number;
  first_seen_at: string | null;
  last_seen_at: string | null;
  online: boolean;
  sessions: UserActivitySession[];
  paths: UserActivityPath[];
}

export interface AdminTeacher {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  course_count: number;
  student_count: number;
  rating?: number;
  verified: boolean;
  status: 'active' | 'inactive';
}

export interface AdminTeachersResponse {
  teachers: AdminTeacher[];
}

export interface ServerStatusResponse {
  services: Array<{ name: string; status: string; ports?: string }>;
  frontend: { name: string; status: string };
}

export interface ServerLogsResponse {
  service: string;
  logs: string;
}

export interface RuntimeEnvResponse {
  env: Record<string, string>;
}

// ─── API ─────────────────────────────────────────────────────

export const adminApi = {
  getDashboard() {
    return apiFetch<AdminDashboardData>('/admin/dashboard');
  },

  getActivities() {
    return apiFetch<AdminActivitiesResponse>('/admin/dashboard/activity');
  },

  getUsers(limit = 50, offset = 0) {
    return apiFetch<AdminUsersResponse>(`/admin/users?limit=${limit}&offset=${offset}`);
  },

  getUserActivity(userId: string) {
    return apiFetch<UserActivityAnalytics>(`/admin/users/${userId}/activity`);
  },

  updateUserRole(userId: string, role: string) {
    return apiFetch(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  updateUserStatus(userId: string, status: string) {
    return apiFetch(`/admin/users/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  getTeachers() {
    return apiFetch<AdminTeachersResponse>('/admin/teachers');
  },

  verifyTeacher(teacherId: string) {
    return apiFetch(`/admin/teachers/${teacherId}/verify`, { method: 'PUT' });
  },

  sendAdminChat(message: string) {
    return apiFetch<{ session_id: string; response: string }>('/admin/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  heartbeat(sessionId: string, path: string, userName?: string) {
    return apiFetch('/admin/activity/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, path, user_name: userName ?? '' }),
    });
  },

  getServerStatus() {
    return apiFetch<ServerStatusResponse>('/admin/server/status');
  },

  getServerLogs(service: string, lines = 200) {
    return apiFetch<ServerLogsResponse>(`/admin/server/logs/${service}?lines=${lines}`);
  },

  getRuntimeEnv() {
    return apiFetch<RuntimeEnvResponse>('/admin/server/env');
  },

  updateRuntimeEnv(updates: Record<string, string>) {
    return apiFetch<{ updated: string[] }>('/admin/server/env', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  },
};
