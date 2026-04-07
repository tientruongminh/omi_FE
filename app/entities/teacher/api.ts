import { apiFetch } from '@/shared/api/client';

// ─── Types ────────────────────────────────────────────────────

export interface TeacherCourse {
  id: string;
  title: string;
  description: string | null;
  subject: string | null;
  level: string | null;
  teacher_id: string;
  status?: string;
  student_count?: number;
  unit_count?: number;
  created_at: string;
  updated_at: string;
}

export interface TeacherCoursesResponse {
  courses: TeacherCourse[];
  total: number;
  limit: number;
  offset: number;
}

export interface CourseResponse {
  course: TeacherCourse;
}

export interface CourseUnit {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: string;
}

export interface UnitsResponse {
  units: CourseUnit[];
}

export interface CourseStudent {
  id: string;
  user_id: string;
  name: string;
  email: string;
  progress: number;
  enrolled_at: string;
  status: string;
}

export interface StudentsResponse {
  students: CourseStudent[];
}

export interface CourseAnalytics {
  total_students: number;
  completion_rate: number;
  avg_progress: number;
  active_students: number;
}

// ─── API ─────────────────────────────────────────────────────

export const teacherApi = {
  getCourses() {
    return apiFetch<TeacherCoursesResponse>('/teacher/courses');
  },

  getCourse(id: string) {
    return apiFetch<CourseResponse>(`/teacher/courses/${id}`);
  },

  createCourse(data: { title: string; description?: string; subject?: string; level?: string }) {
    return apiFetch<CourseResponse>('/teacher/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateCourse(id: string, data: Partial<{ title: string; description: string; subject: string; level: string }>) {
    return apiFetch<CourseResponse>(`/teacher/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteCourse(id: string) {
    return apiFetch<void>(`/teacher/courses/${id}`, { method: 'DELETE' });
  },

  getUnits(courseId: string) {
    return apiFetch<UnitsResponse>(`/teacher/courses/${courseId}/units`);
  },

  addUnit(courseId: string, data: { title: string; description?: string }) {
    return apiFetch<{ unit: CourseUnit }>(`/teacher/courses/${courseId}/units`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStudents(courseId: string) {
    return apiFetch<StudentsResponse>(`/teacher/courses/${courseId}/students`);
  },

  enrollStudent(courseId: string, userId: string) {
    return apiFetch(`/teacher/courses/${courseId}/enroll`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  getAnalytics(courseId: string) {
    return apiFetch<CourseAnalytics>(`/teacher/courses/${courseId}/analytics`);
  },
};
