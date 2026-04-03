'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF9F7' }}>
      {/* Minimal navbar */}
      <nav
        className="w-full border-b"
        style={{
          background: 'rgba(250,249,247,0.97)',
          backdropFilter: 'blur(14px)',
          borderColor: '#e5e7eb',
        }}
      >
        <div className="max-w-[1100px] mx-auto px-5 h-[60px] flex items-center justify-between">
          <Link href="/landing">
            <span
              className="text-xl font-black italic"
              style={{
                color: '#6B2D3E',
                fontFamily: 'Georgia, serif',
                letterSpacing: '-0.01em',
              }}
            >
              omilearn
            </span>
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-[440px]"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
