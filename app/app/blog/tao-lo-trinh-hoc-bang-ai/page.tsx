import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tạo lộ trình học bằng AI',
  description: 'Cách tạo lộ trình học bằng AI: chia mục tiêu, chọn tài liệu, tạo lịch học, quiz và checkpoint ôn tập.',
  alternates: { canonical: '/blog/tao-lo-trinh-hoc-bang-ai' },
};

export default function StudyRoadmapAIPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-bold text-[#6B2D3E]">← Blog</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-black leading-tight">Tạo lộ trình học bằng AI</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Một lộ trình học tốt giúp bạn biết học gì trước, học trong bao lâu, kiểm tra tiến độ thế nào và khi nào cần ôn lại. AI có thể giúp chia nhỏ mục tiêu thành roadmap rõ ràng.</p>
        <h2 className="mt-10 text-2xl font-black">Các bước tạo roadmap học tập</h2>
        <ol className="mt-4 list-decimal pl-5 leading-8 text-[#5A5C58]">
          <li>Xác định mục tiêu và deadline.</li>
          <li>Chia nội dung thành module nhỏ.</li>
          <li>Gắn tài liệu vào từng module.</li>
          <li>Tạo quiz và flashcard sau mỗi module.</li>
          <li>Lên lịch ôn lại trước kỳ thi.</li>
        </ol>
        <Link href="/tools/study-plan-generator" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Tạo kế hoạch học tập</Link>
      </article>
    </main>
  );
}
