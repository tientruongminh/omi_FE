'use client';

import Link from 'next/link';
import { StudySession } from '@/shared/types';
import SessionCard from './SessionCard';
import WeekCalendar from './WeekCalendar';

interface Props {
  sessions: StudySession[];
  projectId: string;
}

export default function SessionList({ sessions, projectId }: Props) {
  const activeDays = sessions.map((s) => s.day);

  return (
    <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6 mb-8">
      <h2 className="font-bold text-[#2D2D2D] text-lg mb-4">Lịch học sắp tới</h2>
      <WeekCalendar activeDays={activeDays} />
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} projectId={projectId} />
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-dashed border-[#CCCCCC]">
        <Link href={`/learn?project=${projectId}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] active:scale-[0.99] transition-all">
          Tiếp tục học
        </Link>
      </div>
    </div>
  );
}
