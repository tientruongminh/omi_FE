import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog AI học tập',
  description: 'Bài viết về AI học tập, phương pháp ôn tập, tạo lộ trình học, quiz AI, flashcard và productivity cho sinh viên.',
  alternates: { canonical: '/blog' },
};

const posts = [
  ['AI học tập là gì?', '/blog/ai-hoc-tap', 'Cách AI cá nhân hóa việc học, tạo lộ trình, quiz, flashcard và hỏi đáp tài liệu.'],
  ['AI Study Assistant', '/blog/ai-study-assistant', 'Vì sao sinh viên cần một trợ lý học tập AI thay vì chỉ dùng chatbot chung chung.'],
  ['AI Quiz Generator', '/blog/ai-quiz-generator', 'Cách dùng AI để tạo câu hỏi ôn tập và luyện active recall.'],
  ['Tạo lộ trình học bằng AI', '/blog/tao-lo-trinh-hoc-bang-ai', 'Cách biến mục tiêu lớn thành roadmap học tập thực tế.'],
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <section className="mx-auto max-w-5xl">
        <Link href="/landing" className="text-sm font-bold text-[#6B2D3E]">← Về Omilearn</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">Blog AI học tập</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5A5C58]">Kiến thức thực tế về AI học tập, active recall, spaced repetition, lộ trình học cá nhân hóa và cách dùng Omilearn để học nhanh hơn.</p>
        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {posts.map(([title, href, desc]) => (
            <Link key={href} href={href} className="rounded-3xl border-2 border-[#333] bg-white p-6 shadow-[4px_4px_0_#333] hover:-translate-y-1 transition-transform">
              <h2 className="text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-[#5A5C58]">{desc}</p>
              <span className="mt-5 inline-block font-bold text-[#6B2D3E]">Đọc bài →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
