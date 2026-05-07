import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Omilearn cho sinh viên',
  description: 'Omilearn giúp sinh viên học hiệu quả hơn với AI học tập, roadmap cá nhân hóa, quiz, flashcard và hỏi đáp tài liệu.',
  alternates: { canonical: '/use-cases/students' },
};

export default function StudentsUseCasePage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <section className="mx-auto max-w-4xl">
        <Link href="/landing" className="text-sm font-bold text-[#6B2D3E]">← Về Omilearn</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">AI học tập cho sinh viên</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Omilearn giúp sinh viên quản lý tài liệu, tạo lộ trình học, hỏi đáp với AI, tạo quiz và flashcard để ôn thi hiệu quả hơn.</p>
        <Link href="/register" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Bắt đầu học với Omilearn</Link>
      </section>
    </main>
  );
}
