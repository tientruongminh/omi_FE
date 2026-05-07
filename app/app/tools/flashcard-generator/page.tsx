import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Flashcard Generator AI - Tạo flashcard học tập',
  description: 'Tạo flashcard bằng AI từ ghi chú, slide và tài liệu học tập với Omilearn để ôn tập nhanh hơn.',
  alternates: { canonical: '/tools/flashcard-generator' },
};

export default function FlashcardGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-4xl">
        <Link href="/tools" className="text-sm font-bold text-[#6B2D3E]">← Công cụ AI học tập</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">Flashcard Generator AI</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Tạo flashcard từ tài liệu học tập giúp bạn ôn lại khái niệm, định nghĩa, công thức và ví dụ bằng active recall. Omilearn có thể tạo flashcard trực tiếp từ node tài liệu trong workspace.</p>
        <div className="mt-10 rounded-3xl border-2 border-[#333] bg-white p-7 shadow-[4px_4px_0_#333]">
          <h2 className="text-2xl font-black">Mẹo học với flashcard AI</h2>
          <p className="mt-4 leading-8 text-[#5A5C58]">Đừng chỉ đọc lại flashcard. Hãy che đáp án, tự trả lời, sau đó kiểm tra và đánh dấu thẻ sai để ôn lại nhiều hơn. Kết hợp flashcard với quiz AI sẽ giúp nhớ lâu hơn.</p>
        </div>
        <Link href="/register" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Tạo flashcard với Omilearn</Link>
      </article>
    </main>
  );
}
