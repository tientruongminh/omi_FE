'use client';

import { motion } from 'framer-motion';

interface ManifestoLineProps {
  text: string;
  bold?: boolean;
  inView: boolean;
  delay: number;
  highlight?: { text: string; color: string; underline?: boolean; scale?: boolean };
}

export default function ManifestoLine({ text, bold, inView, delay, highlight }: ManifestoLineProps) {
  if (!text) return <div className="h-6" />;
  return (
    <motion.p
      className="italic"
      style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(20px, 2.5vw, 28px)', color: '#2D2D2D', lineHeight: 2, fontWeight: bold ? 600 : 400 }}
      initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, delay, ease: 'easeOut' } } : { opacity: 0, y: 30, filter: 'blur(8px)' }}
    >
      {text}
      {highlight && (
        <motion.strong
          style={{ fontStyle: 'normal', color: highlight.color, position: 'relative', display: 'inline-block' }}
          initial={{ opacity: 0, scale: highlight.scale ? 0.8 : 1 }}
          animate={inView ? { opacity: 1, scale: 1, transition: { duration: 0.5, delay: delay + 0.6, ease: highlight.scale ? 'backOut' : 'easeOut' } } : { opacity: 0 }}
        >
          {highlight.text}
          {highlight.underline && (
            <motion.span className="absolute -bottom-1 left-0 h-[3px] rounded-full" style={{ background: highlight.color }}
              initial={{ width: '0%' }}
              animate={inView ? { width: '100%', transition: { duration: 0.6, delay: delay + 0.9, ease: 'easeOut' } } : { width: '0%' }}
            />
          )}
        </motion.strong>
      )}
    </motion.p>
  );
}
