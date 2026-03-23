'use client';

import { motion } from 'framer-motion';
import CTAButton from './CTAButton';

export default function FooterCTA() {
  return (
    <div className="flex justify-center">
      <motion.div
        whileHover={{ y: -4, boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
        className="w-full max-w-[520px] rounded-3xl px-10 py-14 flex flex-col items-center text-center gap-6 transition-all duration-300"
        style={{ background: '#2D2D2D', boxShadow: '0 24px 64px rgba(0,0,0,0.18)', willChange: 'transform' }}
      >
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">Sẵn sàng học thông minh hơn?</h2>
        <CTAButton light className="text-base py-4 px-8" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Miễn phí. Không cần thẻ tín dụng.</p>
      </motion.div>
    </div>
  );
}
