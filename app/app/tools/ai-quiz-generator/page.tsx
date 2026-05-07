import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Quiz Generator - Tạo câu hỏi trắc nghiệm bằng AI',
  description: 'Tạo câu hỏi trắc nghiệm, đáp án và giải thích từ tài liệu học tập bằng AI Quiz Generator của Omilearn.',
  alternates: { canonical: '/tools/ai-quiz-generator' },
};

export default function AIQuizGeneratorPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-4xl">
        <Link href="/tools" className="text-sm font-bold text-[#6B2D3E]">← Công cụ AI học tập</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">AI Quiz Generator cho sinh viên</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">AI Quiz Generator giúp biến slide, PDF, ghi chú hoặc đoạn văn học tập thành câu hỏi trắc nghiệm có đáp án và giải thích. Đây là cách nhanh để luyện active recall trước kỳ thi.</p>
        <section className="mt-10 rounded-3xl border-2 border-[#333] bg-white p-7 shadow-[4px_4px_0_#333]">
          <h2 className="text-2xl font-black">Cách dùng hiệu quả</h2>
          <ol className="mt-4 space-y-3 text-[#5A5C58] leading-7 list-decimal pl-5">
            <li>Dán nội dung bài học hoặc upload tài liệu vào Omilearn.</li>
            <li>Chọn node AI ôn tập hoặc AI hỏi đáp trong canvas.</li>
            <li>Yêu cầu tạo 10-30 câu hỏi theo mức độ dễ, vừa hoặc khó.</li>
            <li>Làm quiz, xem giải thích, rồi biến câu sai thành flashcard.</li>
          </ol>
        </section>
        <section className="mt-8 grid md:grid-cols-2 gap-5">
          <div className="rounded-3xl border-2 border-[#333] bg-[#FFFDE7] p-6">
            <h2 className="text-xl font-black">Phù hợp với</h2>
            <p className="mt-3 text-[#5A5C58] leading-7">Sinh viên ôn thi, học sinh luyện kiểm tra, giáo viên tạo ngân hàng câu hỏi, hoặc người tự học cần kiểm tra mức độ hiểu bài.</p>
          </div>
          <div className="rounded-3xl border-2 border-[#333] bg-[#EDFAF4] p-6">
            <h2 className="text-xl font-black">Keyword chính</h2>
            <p className="mt-3 text-[#5A5C58] leading-7">AI quiz generator, tạo câu hỏi bằng AI, AI học tập, trắc nghiệm tự động, ôn tập thông minh.</p>
          </div>
        </section>
        <Link href="/register" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Dùng Omilearn miễn phí</Link>
      </article>
    </main>
  );
}
