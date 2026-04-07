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
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
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
};
