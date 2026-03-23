'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingNote() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-6 left-6 z-40 max-w-[300px]"
          style={{
            backgroundColor: '#F7F5F0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
            borderRadius: 16,
            border: '1.5px solid rgba(51,51,51,0.12)',
          }}
        >
          <div className="relative px-4 py-3.5 pr-12">
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-[#E5E5DF] flex items-center justify-center text-[12px] text-[#5A5C58] hover:bg-[#CCCCCC] transition-colors leading-none cursor-pointer"
            >
              ×
            </button>
            <p className="text-[12.5px] text-[#5A5C58] leading-relaxed">
              💡 <strong className="text-[#2D2D2D]">Mẹo:</strong> Nhấn đúp vào node để mở tài liệu. Kéo canvas để di chuyển. Cuộn chuột để zoom.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
