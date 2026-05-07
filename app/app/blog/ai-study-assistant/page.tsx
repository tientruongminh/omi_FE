import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Study Assistant cho sinh viên',
  description: 'AI Study Assistant giúp sinh viên hỏi đáp tài liệu, tạo lộ trình học, quiz, flashcard và ghi chú thông minh.',
  alternates: { canonical: '/blog/ai-study-assistant' },
};

export default function AIStudyAssistantPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-bold text-[#6B2D3E]">← Blog</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-black leading-tight">AI Study Assistant: trợ lý học tập AI cho sinh viên</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Một AI Study Assistant tốt không chỉ trả lời câu hỏi. Nó hiểu bạn đang học môn gì, tài liệu nào quan trọng, phần nào bạn chưa chắc và nên ôn lại bằng câu hỏi nào.</p>
        <h2 className="mt-10 text-2xl font-black">Vì sao cần AI Study Assistant?</h2>
        <p className="mt-4 leading-8 text-[#5A5C58]">Sinh viên thường bị quá tải bởi slide, PDF, video, deadline và lịch thi. Omilearn gom mọi thứ vào workspace học tập, sau đó AI hỗ trợ hỏi đáp, ôn tập và tổng hợp kiến thức theo đúng ngữ cảnh.</p>
        <h2 className="mt-10 text-2xl font-black">Tính năng quan trọng</h2>
        <ol className="mt-4 list-decimal pl-5 leading-8 text-[#5A5C58]">
          <li>Chat với tài liệu.</li>
          <li>Tạo quiz tự động.</li>
          <li>Flashcard và active recall.</li>
          <li>Lộ trình học cá nhân hóa.</li>
          <li>Memory để càng dùng càng hiểu người học.</li>
        </ol>
        <Link href="/features" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Xem tính năng Omilearn</Link>
      </article>
    </main>
  );
}
