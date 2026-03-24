'use client';

import { motion, Variants } from 'framer-motion';
import CTAButton from './CTAButton';
import InteractiveDemo from './InteractiveDemo';

const fadeLeft: Variants = { hidden: { opacity: 0, x: -28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as const } } };
const fadeRight: Variants = { hidden: { opacity: 0, x: 28 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease: 'easeOut' as const } } };

export default function HeroSection() {
  return (
    <section className="w-full max-w-[1100px] mx-auto px-5 pt-16 pb-24 flex flex-col md:flex-row items-start gap-14 md:gap-10">
      {/* Left */}
      <motion.div className="flex-1 flex flex-col items-start pt-2" variants={fadeLeft} initial="hidden" animate="visible">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6" style={{ background: '#EDFAF4', color: '#1A6E3E', border: '1.5px solid #3DBE7A' }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#3DBE7A' }} />
          AI đang thay đổi cách học
        </div>
        <h1 className="font-extrabold leading-[1.2] mb-6" style={{ fontSize: 'clamp(34px, 4.5vw, 50px)', color: '#2D2D2D' }}>
          Sinh viên giỏi<br />không học nhiều hơn.<br />
          Họ học{' '}<span style={{ color: '#E8887A', fontStyle: 'italic' }}>thông minh hơn.</span>
        </h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: '#5A5C58', maxWidth: 420 }}>
          Upload tài liệu → AI tạo lộ trình cá nhân → quiz, flashcard, mindmap sẵn sàng.{' '}
          <strong style={{ color: '#2D2D2D' }}>Trong 30 giây.</strong>
        </p>
        <CTAButton className="mb-4 text-base py-4 px-8" />
        <p className="text-sm" style={{ color: '#9CA3AF' }}>
          Được sinh viên từ <strong style={{ color: '#5A5C58' }}>Bách Khoa</strong>, <strong style={{ color: '#5A5C58' }}>Kinh Tế</strong>, <strong style={{ color: '#5A5C58' }}>FPT</strong>... tin dùng
        </p>
      </motion.div>

      {/* Right */}
      <motion.div className="flex-shrink-0 w-full md:w-[420px]" variants={fadeRight} initial="hidden" animate="visible">
        <InteractiveDemo />
      </motion.div>
    </section>
  );
}
