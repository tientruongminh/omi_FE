import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AI Quiz Generator: tạo câu hỏi ôn tập bằng AI',
  description: 'Hướng dẫn dùng AI Quiz Generator để tạo câu hỏi trắc nghiệm, đáp án và giải thích từ tài liệu học tập.',
  alternates: { canonical: '/blog/ai-quiz-generator' },
};

export default function AIQuizBlogPage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <article className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm font-bold text-[#6B2D3E]">← Blog</Link>
        <h1 className="mt-8 text-4xl md:text-5xl font-black leading-tight">AI Quiz Generator: tạo câu hỏi ôn tập bằng AI</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">AI Quiz Generator giúp biến tài liệu học tập thành câu hỏi trắc nghiệm có đáp án và giải thích. Đây là cách hiệu quả để luyện active recall thay vì chỉ đọc lại slide.</p>
        <h2 className="mt-10 text-2xl font-black">Công thức prompt đơn giản</h2>
        <p className="mt-4 leading-8 text-[#5A5C58]">Hãy yêu cầu AI tạo 15 câu hỏi, chia theo mức dễ-vừa-khó, mỗi câu có 4 lựa chọn và giải thích vì sao đáp án đúng. Trong Omilearn, bạn có thể chỉnh số lượng câu hỏi trực tiếp trong node AI hỏi đáp.</p>
        <Link href="/tools/ai-quiz-generator" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Mở AI Quiz Generator</Link>
      </article>
    </main>
  );
}
