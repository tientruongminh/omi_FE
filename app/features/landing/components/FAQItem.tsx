'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Props {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden transition-all" style={{ border: '1.5px solid #E5DDD5', background: '#FFFFFF' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F9F6F2]">
        <span className="text-sm font-bold" style={{ color: '#2D2D2D' }}>{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25, ease: 'easeOut' }} className="flex-shrink-0 ml-3">
          <ChevronDown size={18} color="#9CA3AF" />
        </motion.div>
      </button>
      <motion.div initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ duration: 0.28, ease: 'easeOut' }} style={{ overflow: 'hidden' }}>
        <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#5A5C58' }}>{answer}</p>
      </motion.div>
    </div>
  );
}
