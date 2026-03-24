'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const DEMO_SUBJECTS = [
  { id: 'giai-tich', label: 'Giải Tích 1', chapters: ['Giới hạn và Liên tục', 'Đạo hàm', 'Tích phân', 'Chuỗi số'], stats: '4 chương • 12 bài • ~6 tuần' },
  { id: 'vat-ly', label: 'Vật Lý', chapters: ['Cơ học', 'Nhiệt động lực học', 'Điện từ', 'Quang học'], stats: '4 chương • 16 bài • ~8 tuần' },
  { id: 'ctdl', label: 'CTDL', chapters: ['Mảng & Danh sách', 'Stack & Queue', 'Cây & Đồ thị', 'Sắp xếp & Tìm kiếm'], stats: '4 chương • 14 bài • ~7 tuần' },
];

type DemoState = 'idle' | 'loading' | 'result';

export default function InteractiveDemo() {
  const [state, setState] = useState<DemoState>('idle');
  const [selected, setSelected] = useState<typeof DEMO_SUBJECTS[0] | null>(null);
  const [typeText, setTypeText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSelect = (sub: typeof DEMO_SUBJECTS[0]) => {
    setSelected(sub); setState('loading'); setTypeText('');
    const text = `Đang phân tích tài liệu ${sub.label}...`;
    let i = 0;
    const iv = setInterval(() => { setTypeText(text.slice(0, i + 1)); i++; if (i >= text.length) { clearInterval(iv); setTimeout(() => setState('result'), 600); } }, 40);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E5DDD5', boxShadow: '0 8px 40px rgba(0,0,0,0.07)', minHeight: 340 }}>
      {state === 'idle' && (
        <div className="flex flex-col items-center justify-center p-8 gap-6 h-full" style={{ minHeight: 340 }}>
          <div className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-8 px-4 transition-all"
            style={{ borderColor: isDragOver ? '#3DBE7A' : '#C8C4BF', background: isDragOver ? '#EDFAF4' : '#F9F6F2' }}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} onDragLeave={() => setIsDragOver(false)} onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}>
            <span className="text-3xl">◎</span>
            <p className="text-sm font-semibold text-center" style={{ color: '#5A5C58' }}>Kéo thả tài liệu vào đây</p>
            <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>PDF, PPTX, DOCX...</p>
          </div>
          <div className="flex flex-col items-center gap-3 w-full">
            <p className="text-xs" style={{ color: '#9CA3AF' }}>hoặc thử ngay với:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DEMO_SUBJECTS.map((s) => (
                <button key={s.id} onClick={() => handleSelect(s)}
                  className="px-4 py-2 rounded-full text-xs font-semibold border transition-all hover:border-[#2D2D2D] hover:text-[#2D2D2D] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  style={{ borderColor: '#E5DDD5', color: '#5A5C58', background: '#fff' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center justify-center p-8 gap-5 h-full" style={{ minHeight: 340 }}>
          <motion.div className="w-12 h-12 rounded-full border-4" style={{ borderColor: '#E5DDD5', borderTopColor: '#2D2D2D' }} animate={{ rotate: 360 }} transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }} />
          <p className="text-sm font-mono" style={{ color: '#5A5C58', minHeight: 24 }}>{typeText}<span className="animate-pulse">|</span></p>
        </div>
      )}

      {state === 'result' && selected && (
        <motion.div className="flex flex-col gap-4 p-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#3DBE7A', color: '#fff' }}>✓</div>
              <p className="text-sm font-bold" style={{ color: '#2D2D2D' }}>Lộ trình: {selected.label}</p>
            </div>
            <button onClick={() => { setState('idle'); setSelected(null); }} className="text-xs px-3 py-1 rounded-full border cursor-pointer transition-all hover:opacity-70" style={{ color: '#9CA3AF', borderColor: '#E5DDD5' }}>← Thử lại</button>
          </div>
          <div className="flex flex-col gap-1.5 rounded-xl p-4" style={{ background: '#F9F6F2', border: '1px solid #E5DDD5' }}>
            {selected.chapters.map((ch, i) => (
              <motion.div key={ch} className="flex items-center gap-3 py-1.5" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.09, duration: 0.3 }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: '#3DBE7A', color: '#fff' }}>{i + 1}</div>
                <span className="text-sm" style={{ color: '#2D2D2D' }}>{ch}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>{selected.stats}</p>
            <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: '#EDFAF4', color: '#1A6E3E' }}>Xong trong 30 giây</span>
          </div>
          <Link href="/" className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95" style={{ background: '#2D2D2D' }}>Bắt đầu học ngay →</Link>
        </motion.div>
      )}
    </div>
  );
}
