'use client';

import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div>
      <h1 className="text-[28px] font-black text-[#1A1A1A] mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        Chi tiết khóa học
      </h1>
      <p className="text-[13px] text-[#5A5C58] mb-8">Upload tài nguyên, chỉnh sửa roadmap — ID: {id}</p>

      <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-8 text-center">
        <p className="text-[#999] text-[14px]">🚧 Trang này đang phát triển (Phase 2)</p>
        <p className="text-[#999] text-[12px] mt-1">Upload tài nguyên + Roadmap Editor sẽ có ở đây</p>
      </div>
    </div>
  );
}
