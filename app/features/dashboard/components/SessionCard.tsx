'use client';

import Link from 'next/link';
import { StudySession } from '@/shared/types';

interface Props {
  session: StudySession;
  projectId: string;
}

export default function SessionCard({ session, projectId }: Props) {
  const href = session.unitId
    ? `/learn?unit=${session.unitId}&project=${projectId}`
    : `/learn?project=${projectId}`;

  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 bg-white border border-[#CCCCCC] rounded-xl hover:border-[#6B2D3E] hover:bg-[#FFF8F9] hover:shadow-sm active:scale-[0.99] transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#818CF8]/20 flex items-center justify-center">
          <span className="text-xs font-bold text-[#818CF8]">{session.day}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#2D2D2D] group-hover:text-[#6B2D3E] transition-colors">{session.title}</p>
          <p className="text-xs text-[#5A5C58]">{session.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-[#5A5C58] bg-[#F1F1EC] px-2 py-1 rounded-full">{session.duration}</span>
        <span className="text-xs text-[#6B2D3E] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Học →</span>
      </div>
    </Link>
  );
}
