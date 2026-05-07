import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Omilearn cho giáo viên',
  description: 'Omilearn hỗ trợ giáo viên tạo tài liệu, theo dõi tiến độ học tập, gợi ý quiz và phân tích dữ liệu học viên bằng AI.',
  alternates: { canonical: '/use-cases/teachers' },
};

export default function TeachersUseCasePage() {
  return (
    <main className="min-h-screen bg-[#F5F0EB] px-6 py-16 text-[#1A1A1A]">
      <section className="mx-auto max-w-4xl">
        <Link href="/landing" className="text-sm font-bold text-[#6B2D3E]">← Về Omilearn</Link>
        <h1 className="mt-8 text-4xl md:text-6xl font-black">AI hỗ trợ giáo viên và lớp học</h1>
        <p className="mt-5 text-lg leading-8 text-[#5A5C58]">Omilearn giúp giáo viên tổ chức nội dung học, tạo quiz, theo dõi tiến độ và dùng AI để phân tích dữ liệu học tập.</p>
        <Link href="/features" className="mt-10 inline-block rounded-full bg-[#6B2D3E] px-6 py-3 font-bold text-white">Xem tính năng</Link>
      </section>
    </main>
  );
}
