'use client';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface Props {
  activeDays: string[];
}

export default function WeekCalendar({ activeDays }: Props) {
  return (
    <div className="grid grid-cols-7 gap-1.5 mb-6">
      {DAYS.map((day) => {
        const hasSession = activeDays.includes(day);
        return (
          <div
            key={day}
            className={`rounded-xl p-2 text-center transition-all ${hasSession ? 'bg-[#2D2D2D] hover:bg-[#1a1a1a]' : 'bg-white border border-[#CCCCCC] hover:border-[#6B2D3E]/40'}`}
          >
            <p className={`text-xs font-semibold ${hasSession ? 'text-white' : 'text-[#5A5C58]'}`}>{day}</p>
            {hasSession && <div className="w-1.5 h-1.5 rounded-full bg-[#4CD964] mx-auto mt-1" />}
          </div>
        );
      })}
    </div>
  );
}
