'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="fixed bottom-6 left-6 z-40"
          style={{ maxWidth: 220 }}
        >
          <div
            className="relative px-4 pt-3 pb-4 rounded-2xl"
            style={{
              backgroundColor: '#F5F0C8',
              boxShadow: '4px 4px 0px rgba(45,45,45,0.85)',
              borderRadius: 12,
            }}
          >
            {/* Dismiss X button — top right */}
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#5A5C58] hover:text-[#2D2D2D] transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X size={12} />
            </button>

            {/* Note text */}
            <p className="text-[13px] text-[#2D2D2D] leading-relaxed pr-4">
              <strong>Mẹo:</strong> Bạn có thể chọn nhiều file để AI tóm tắt cùng 1 lúc
            </p>

            {/* Push-pin icon — bottom right */}
            <div className="flex justify-end mt-3">
              <span className="text-[#5A5C58] text-base select-none" title="Ghi chú">
                📌
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
