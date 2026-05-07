import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI học tập là gì? Cách học nhanh hơn với trí tuệ nhân tạo',
  description: 'AI học tập giúp cá nhân hóa lộ trình, hỏi đáp tài liệu, tạo quiz, flashcard và ghi chú thông minh cho sinh viên.',
  alternates: { canonical: '/blog/ai-hoc-tap' },
};

export default function AIHocTapPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-bold text-[#6B2D3E]">← Blog</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-black leading-tight">AI học tập là gì?</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">AI học tập là cách dùng trí tuệ nhân tạo để cá nhân hóa quá trình học: hiểu mục tiêu của người học, đọc tài liệu, tạo lộ trình, đặt câu hỏi ôn tập, tạo flashcard và hỗ trợ giải thích khái niệm khó.</p>
        <h2 className="mt-10 text-2xl font-black">AI học tập khác chatbot thường ở đâu?</h2>
        <p className="mt-4 leading-8 text-[#5A5C58]">Chatbot thường chỉ trả lời từng câu hỏi rời rạc. Một nền tảng AI học tập như Omilearn gắn câu trả lời với tài liệu, roadmap, node học tập, lịch học và lịch sử ôn tập của bạn.</p>
        <h2 className="mt-10 text-2xl font-black">Omilearn hỗ trợ gì?</h2>
        <ol className="mt-4 list-decimal pl-5 leading-8 text-[#5A5C58]">
          <li>Tạo lộ trình học cá nhân hóa.</li>
          <li>AI hỏi đáp dựa trên tài liệu.</li>
          <li>Tạo quiz, flashcard và câu tự luận.</li>
          <li>Ghi chú và tổng hợp kiến thức từ nhiều nguồn.</li>
          <li>Ghi nhớ sở thích học tập để hỗ trợ tốt hơn qua thời gian.</li>
        </ol>
        <Link href="/register" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Dùng thử Omilearn</Link>
      </article>
    </main>
  );
}
