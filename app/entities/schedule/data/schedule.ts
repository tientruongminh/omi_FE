// ─── Schedule Types & Data ─────────────────────────────────
export type SubjectKey = 'kinhTeViMo' | 'xacSuatTK' | 'baiTapLon' | 'marketing' | 'lapTrinh';

export interface SubjectInfo {
  label: string;
  color: string;
  dot: string;
  bg: string;
  /** Which unit ID in /learn this maps to */
  unitId?: string;
}

export interface DayInfo {
  key: string;
  label: string;
  date: string;
  today?: boolean;
  weekend?: boolean;
}

export type ScheduleCell = SubjectKey | null;

export const SUBJECTS: Record<SubjectKey, SubjectInfo> = {
  kinhTeViMo:  { label: 'KINH TẾ VI MÔ', color: '#16A34A', dot: '#4CD964', bg: '#DCFCE7', unitId: 'khai-niem' },
  xacSuatTK:   { label: 'XÁC SUẤT TK',   color: '#4338CA', dot: '#818CF8', bg: '#EEF2FF', unitId: 'kien-truc' },
  baiTapLon:   { label: 'BÀI TẬP LỚN',   color: '#DC2626', dot: '#F08080', bg: '#FEE2E2', unitId: 'quan-ly' },
  marketing:   { label: 'MARKETING',      color: '#C2410C', dot: '#F5A623', bg: '#FEF3C7', unitId: 'giao-dien' },
  lapTrinh:    { label: 'LẬP TRÌNH',      color: '#7E22CE', dot: '#A855F7', bg: '#F3E8FF', unitId: 'lap-trinh-shell' },
};

export const DAYS: DayInfo[] = [
  { key: 'T2', label: 'T2', date: '11/3' },
  { key: 'T3', label: 'T3', date: '12/3' },
  { key: 'T4', label: 'T4', date: '13/3', today: true },
  { key: 'T5', label: 'T5', date: '14/3' },
  { key: 'T6', label: 'T6', date: '15/3' },
  { key: 'T7', label: 'T7', date: '16/3' },
  { key: 'CN', label: 'CN', date: '17/3', weekend: true },
];

export const TIME_SLOTS = ['08–10h', '10–12h', '14–16h', '19–21h'];

// [timeSlot][dayIndex] — 4 rows × 7 columns
export const SCHEDULE: ScheduleCell[][] = [
  // 08–10h:  T2            T3           T4            T5           T6            T7    CN
  [ 'kinhTeViMo', null,        'baiTapLon', null,        'kinhTeViMo', null, null ],
  // 10–12h
  [ null,         'xacSuatTK', null,        'marketing', null,         'xacSuatTK', null ],
  // 14–16h
  [ 'lapTrinh',   null,        'marketing', null,        'lapTrinh',   null, null ],
  // 19–21h
  [ null,         null,        null,        null,        null,         null, null ],
];
