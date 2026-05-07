import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Study Plan Generator AI - Tạo kế hoạch học tập bằng AI',
  description: 'Tạo kế hoạch học tập cá nhân hóa bằng AI theo mục tiêu, deadline và thời gian rảnh với Omilearn.',
  alternates: { canonical: '/tools/study-plan-generator' },
};

export default function StudyPlanGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-4xl">
        <Link href="/tools" className="text-sm font-bold text-[#6B2D3E]">← Công cụ AI học tập</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">Study Plan Generator AI</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Omilearn giúp tạo lộ trình học bằng AI: chia nhỏ mục tiêu, sắp xếp bài học, gợi ý tài liệu, lịch ôn tập và checkpoint theo deadline.</p>
        <div className="mt-10 rounded-3xl border-2 border-[#333] bg-white p-7 shadow-[4px_4px_0_#333]">
          <h2 className="text-2xl font-black">Một kế hoạch học tốt cần gì?</h2>
          <ol className="mt-4 list-decimal pl-5 text-[#5A5C58] leading-8">
            <li>Mục tiêu rõ ràng.</li>
            <li>Deadline thực tế.</li>
            <li>Chia nhỏ thành module học.</li>
            <li>Có quiz và flashcard để kiểm tra hiểu bài.</li>
            <li>Có lịch ôn lại để chống quên.</li>
          </ol>
        </div>
        <Link href="/register" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Tạo lộ trình học với Omilearn</Link>
      </article>
    </main>
  );
}
