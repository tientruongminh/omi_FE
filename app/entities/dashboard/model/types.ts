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
