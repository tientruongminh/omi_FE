'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { mindmapNodes } from '../../data/learning-data';
import { CanvasNode } from '../InfiniteCanvas/types';

interface Props {
  node: CanvasNode;
}

export default function VideoPlayer({ node }: Props) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const chapterNode = mindmapNodes.find((n) => n.id === node.nodeId);
  const doc = chapterNode?.documents.find((d) => d.id === node.docId);
  const totalSeconds = parseInt(doc?.duration ?? '45') * 60;
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setProgress((p) => Math.min(100, p + 0.5)), 300);
    return () => clearInterval(interval);
  }, [playing]);

  return (
    <>
      <div
        className="w-full rounded-2xl overflow-hidden relative group cursor-pointer mb-4"
        style={{ aspectRatio: '16/9', background: '#1A1A2E' }}
        onClick={() => setPlaying((p) => !p)}
      >
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(129,140,248,0.4) 0%, rgba(79,70,229,0.2) 50%, #1A1A2E 100%)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <motion.div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            {playing ? <Pause size={20} className="text-white fill-white" /> : <Play size={20} className="text-white fill-white ml-1" />}
          </motion.div>
          <p className="text-white/80 text-[12px] font-medium px-4 text-center">{node.title}</p>
        </div>
        {doc && <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-[10px] font-mono">{doc.duration}</div>}
      </div>
      <div className="flex justify-between text-[11px] text-[#5A5C58] font-mono mb-1">
        <span>{fmt(currentSeconds)}</span>
        <span>{doc?.duration ?? '45 phút'}</span>
      </div>
      <div className="h-2 bg-[#E5E5DF] rounded-full overflow-hidden cursor-pointer mb-4"
        onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))); }}>
        <motion.div className="h-full bg-gradient-to-r from-[#818CF8] to-[#6366F1] rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </>
  );
}
