'use client';

import { ProjectMember } from '@/shared/types';

interface Props {
  members: ProjectMember[];
}

export default function MemberList({ members }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333333]/10 bg-white/30">
      <span className="text-[10px] text-[#5A5C58] font-medium">Thành viên:</span>
      {members.map((m) => (
        <div key={m.id} className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: m.color }}>
            {m.initials[0]}
          </div>
          <span className="text-[10px] text-[#5A5C58]">{m.name.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}
