'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type SubjectKey = 'kinhTeViMo' | 'xacSuatTK' | 'baiTapLon' | 'marketing' | 'lapTrinh';

interface SubjectInfo {
  label: string;
  color: string;
  dot: string;
  bg: string;
}

const SUBJECTS: Record<SubjectKey, SubjectInfo> = {
  kinhTeViMo:  { label: 'KINH TẾ VI MÔ', color: '#16A34A', dot: '#4CD964', bg: '#DCFCE7' },
  xacSuatTK:   { label: 'XÁC SUẤT TK',   color: '#4338CA', dot: '#818CF8', bg: '#EEF2FF' },
  baiTapLon:   { label: 'BÀI TẬP LỚN',   color: '#DC2626', dot: '#F08080', bg: '#FEE2E2' },
  marketing:   { label: 'MARKETING',      color: '#C2410C', dot: '#F5A623', bg: '#FEF3C7' },
  lapTrinh:    { label: 'LẬP TRÌNH',      color: '#7E22CE', dot: '#A855F7', bg: '#F3E8FF' },
};

type ScheduleCell = SubjectKey | null;

const DAYS = [
  { key: 'T2', label: 'T2', date: '11/3' },
  { key: 'T3', label: 'T3', date: '12/3' },
  { key: 'T4', label: 'T4', date: '13/3', today: true },
  { key: 'T5', label: 'T5', date: '14/3' },
  { key: 'T6', label: 'T6', date: '15/3' },
  { key: 'T7', label: 'T7', date: '16/3' },
  { key: 'CN', label: 'CN', date: '17/3', weekend: true },
];

const TIME_SLOTS = ['08–10h', '10–12h', '14–16h', '19–21h'];

// [timeSlot][dayIndex]
const SCHEDULE: ScheduleCell[][] = [
  // 08–10h: T2            T3           T4            T5           T6            T7    CN
  [ 'kinhTeViMo', null,        'baiTapLon', null,        'kinhTeViMo', null, null ],
  // 10–12h
  [ null,         'xacSuatTK', null,        'marketing', null,         'xacSuatTK', null ],
  // 14–16h
  [ 'lapTrinh',   null,        'marketing', null,        'lapTrinh',   null, null ],
  // 19–21h
  [ null,         null,        null,        null,        null,         null, null ],
];

export default function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      {/* Header Banner */}
      <div className="relative mb-8">
        <div className="bg-[#2D2D2D] rounded-2xl px-6 md:px-8 py-6 flex items-center justify-between overflow-hidden">
          {/* Gold decorative rect - top-left overlap */}
          <div
            className="absolute -top-3 left-4 w-16 h-10 bg-[#F5C542] rounded-lg z-0"
            style={{ transform: 'rotate(-4deg)' }}
          />

          {/* Title */}
          <div className="flex items-center gap-3 z-10 relative">
            <div className="w-5 h-5 bg-[#F5C542] rounded-sm flex-shrink-0" />
            <h1 className="text-white text-lg md:text-2xl font-black uppercase tracking-widest">
              LỊCH HỌC TUẦN NÀY
            </h1>
          </div>

          {/* Week indicator + nav buttons */}
          <div className="flex items-center gap-2 md:gap-3 z-10 relative">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="px-4 md:px-6 py-2 rounded-full border-2 border-white text-white text-sm font-black uppercase tracking-wider hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
            >
              PREV
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="px-4 md:px-6 py-2 rounded-full border-2 border-[#2D2D2D] bg-[#F5C542] text-[#2D2D2D] text-sm font-black uppercase tracking-wider hover:bg-[#E6B830] active:scale-95 transition-all cursor-pointer"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid border-b-2 border-[#333333]" style={{ gridTemplateColumns: '64px repeat(7, 1fr)' }}>
          {/* Time spine label */}
          <div className="px-2 py-4 text-center border-r-2 border-[#333333]" />
          {DAYS.map((day) => (
            <div
              key={day.key}
              className={`px-1 py-3 text-center border-r-2 border-[#333333] last:border-r-0 ${
                day.weekend ? 'bg-[#FEE2E2]' : day.today ? 'bg-[#FFF9E6]' : ''
              }`}
            >
              <div
                className={`text-xs font-black uppercase tracking-wider ${
                  day.weekend ? 'text-[#DC2626]' : 'text-[#2D2D2D]'
                }`}
              >
                {day.label}
              </div>
              <div
                className={`text-sm font-bold mt-0.5 ${
                  day.weekend ? 'text-[#DC2626]' : 'text-[#5A5C58]'
                }`}
              >
                {day.date}
              </div>
              {day.today && (
                <div className="mt-1.5 flex items-center justify-center gap-1">
                  {/* Pulsing dot */}
                  <span
                    className="w-2 h-2 rounded-full bg-[#F5A623] today-pulse flex-shrink-0"
                  />
                  <div className="inline-block bg-[#F5C542] text-[#2D2D2D] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider">
                    HÔM NAY
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time rows */}
        {TIME_SLOTS.map((slot, rowIdx) => (
          <div
            key={slot}
            className="grid border-b-2 border-[#CCCCCC] last:border-b-0 hover:bg-[#2D2D2D]/[0.02] transition-colors group/row"
            style={{ gridTemplateColumns: '64px repeat(7, 1fr)', minHeight: '80px' }}
          >
            {/* Time label */}
            <div className="flex items-center justify-end pr-2 border-r-2 border-[#2D2D2D]">
              <span className="text-[10px] md:text-xs font-bold text-[#5A5C58] text-right leading-tight">
                {slot}
              </span>
            </div>

            {DAYS.map((day, colIdx) => {
              const subject = SCHEDULE[rowIdx][colIdx];
              const info = subject ? SUBJECTS[subject] : null;
              return (
                <div
                  key={day.key}
                  className={`flex items-center justify-center p-1.5 border-r-2 last:border-r-0 transition-colors ${
                    day.today ? 'bg-[#FFFBEB]/60' : ''
                  }`}
                  style={{ borderColor: '#E5E7EB' }}
                >
                  {info && (
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-2 py-1.5 rounded-full border-2 border-[#2D2D2D] text-center cursor-pointer w-full bg-white"
                    >
                      <span
                        className="text-[10px] md:text-xs font-black uppercase tracking-wide leading-tight block text-[#2D2D2D]"
                      >
                        {info.label}
                      </span>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-2 border-[#333333] rounded-2xl px-5 py-4 bg-[#F1F1EC]">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-xs font-black uppercase tracking-widest text-[#5A5C58] mr-1">
            Chú thích:
          </span>
          {(Object.entries(SUBJECTS) as [SubjectKey, SubjectInfo][]).map(([key, info]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: info.dot }}
              />
              <span className="text-sm font-semibold" style={{ color: info.color }}>{info.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
