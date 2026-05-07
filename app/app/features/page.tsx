import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Tính năng AI học tập',
  description: 'Khám phá các tính năng Omilearn: AI hỏi đáp tài liệu, AI ôn tập, flashcard, ghi chú thông minh, tổng hợp kiến thức và lộ trình học cá nhân hóa.',
  alternates: { canonical: '/features' },
};

const features = [
  ['AI hỏi đáp tài liệu', 'Đặt câu hỏi trực tiếp trên tài liệu, node học tập hoặc canvas và nhận câu trả lời có ngữ cảnh.'],
  ['AI ôn tập', 'Tạo quiz, flashcard, câu tự luận và prompt dạy lại AI để học bằng active recall.'],
  ['AI ghi chú', 'Biến nội dung rời rạc thành ghi chú học tập có cấu trúc, dễ ôn lại.'],
  ['AI tổng hợp', 'Kết nối nhiều tài liệu hoặc node học tập để tổng hợp insight và kiến thức trọng tâm.'],
  ['Lộ trình học cá nhân hóa', 'Tạo roadmap học tập theo mục tiêu, thời gian và trình độ của từng người học.'],
  ['Workspace canvas', 'Tổ chức tài liệu, node học, ghi chú và AI assistant trong một không gian học tập trực quan.'],
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] text-[#1A1A1A] px-6 py-16">
      <section className="mx-auto max-w-5xl">
        <Link href="/landing" className="text-sm font-bold text-[#6B2D3E]">← Về Omilearn</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black tracking-tight">Tính năng AI học tập của Omilearn</h1>
        <p className="mt-5 max-w-3xl text-lg text-[#5A5C58] leading-8">
          Omilearn giúp sinh viên học nhanh hơn bằng AI học tập cá nhân hóa: hỏi đáp tài liệu, tạo câu hỏi ôn tập, flashcard, ghi chú, tổng hợp kiến thức và lộ trình học thông minh.
        </p>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {features.map(([title, desc]) => (
            <article key={title} className="rounded-3xl border-2 border-[#333] bg-white p-6 shadow-[4px_4px_0_#333]">
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-3 text-[#5A5C58] leading-7">{desc}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/tools/ai-quiz-generator" className="rounded-full bg-[#6B2D3E] px-5 py-3 text-white font-bold">Dùng thử AI quiz generator</Link>
          <Link href="/blog/ai-hoc-tap" className="rounded-full border-2 border-[#333] px-5 py-3 font-bold">Đọc về AI học tập</Link>
        </div>
      </section>
    </main>
  );
}
