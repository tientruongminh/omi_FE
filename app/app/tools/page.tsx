import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Công cụ AI học tập miễn phí',
  description: 'Bộ công cụ AI học tập của Omilearn: tạo quiz, flashcard và kế hoạch học tập bằng AI cho sinh viên.',
  alternates: { canonical: '/tools' },
};

const tools = [
  ['AI Quiz Generator', '/tools/ai-quiz-generator', 'Tạo câu hỏi trắc nghiệm và đáp án từ bất kỳ nội dung học tập nào.'],
  ['Flashcard Generator', '/tools/flashcard-generator', 'Biến ghi chú thành flashcard để ôn tập nhanh bằng active recall.'],
  ['Study Plan Generator', '/tools/study-plan-generator', 'Tạo kế hoạch học tập theo mục tiêu, deadline và thời gian rảnh.'],
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <section className="mx-auto max-w-5xl">
        <Link href="/landing" className="text-sm font-bold text-[#6B2D3E]">← Về Omilearn</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">Công cụ AI học tập miễn phí</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5A5C58]">Dùng các công cụ AI học tập của Omilearn để tạo quiz, flashcard và kế hoạch học tập. Các trang này cũng giúp Google hiểu rõ Omilearn là nền tảng AI học tập.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-5">
          {tools.map(([title, href, desc]) => (
            <Link key={href} href={href} className="rounded-3xl border-2 border-[#333] bg-white p-6 shadow-[4px_4px_0_#333] hover:-translate-y-1 transition-transform">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-[#5A5C58] leading-7">{desc}</p>
              <span className="mt-5 inline-block font-bold text-[#6B2D3E]">Mở công cụ →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
