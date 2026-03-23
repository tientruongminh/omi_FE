'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MessageCircle, ClipboardList, Pause } from 'lucide-react';
import { mindmapNodes, videoTranscripts } from '@/lib/learning-data';
import NodeAIChat from './NodeAIChat';
import NodeReview from './NodeReview';

interface Props {
  docId: string | null;
  nodeId: string | null;
  onClose: () => void;
}

export default function NodeVideoViewer({ docId, nodeId, onClose }: Props) {
  const [view, setView] = useState<'video' | 'ai' | 'review'>('video');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setView('video');
    setPlaying(false);
    setProgress(0);
  }, [docId]);

  // Fake progress animation when "playing"
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 0.5));
    }, 300);
    return () => clearInterval(interval);
  }, [playing]);

  const node = mindmapNodes.find((n) => n.id === nodeId);
  const doc = node?.documents.find((d) => d.id === docId);
  const transcript = videoTranscripts[docId ?? ''] ?? '...nội dung video đang được tải...';

  if (!doc || !docId) return null;

  const totalSeconds = parseInt(doc.duration ?? '45') * 60;
  const currentSeconds = Math.floor((progress / 100) * totalSeconds);
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="bg-[#F5F0EB] rounded-2xl border-2 border-[#333333] shadow-2xl overflow-hidden flex flex-col"
          style={{
            width: view === 'ai' ? '90vw' : '760px',
            maxWidth: view === 'ai' ? '1100px' : '760px',
            height: '82vh',
            maxHeight: 680,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-[#333333]/20 bg-white/40 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] flex items-center justify-center">
              <Play size={14} className="text-[#2563EB] fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-[#2D2D2D] text-[15px] leading-tight truncate">
                {doc.title}
              </h2>
              <p className="text-[11px] text-[#5A5C58]">Video • {doc.duration}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          {view === 'video' && (
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* Video area */}
              <div
                className="w-full rounded-2xl overflow-hidden relative group cursor-pointer"
                style={{ aspectRatio: '16/9', background: '#1A1A2E' }}
                onClick={() => setPlaying((p) => !p)}
              >
                {/* Fake thumbnail gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 50%, rgba(129,140,248,0.4) 0%, rgba(79,70,229,0.2) 50%, #1A1A2E 100%)',
                  }}
                />

                {/* Fake video content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className="text-6xl mb-3 opacity-30"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {'$ ls /dev/gui'}
                    </div>
                  </div>
                </div>

                {/* Play/Pause overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40 group-hover:bg-white/30 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {playing ? (
                      <Pause size={22} className="text-white fill-white" />
                    ) : (
                      <Play size={22} className="text-white fill-white ml-1" />
                    )}
                  </motion.div>
                </div>

                {/* Duration badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] font-mono">
                  {doc.duration}
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-[#5A5C58] font-mono mb-1.5">
                  <span>{formatTime(currentSeconds)}</span>
                  <span>{doc.duration}</span>
                </div>
                <div
                  className="h-2 bg-[#E5E5DF] rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = ((e.clientX - rect.left) / rect.width) * 100;
                    setProgress(Math.max(0, Math.min(100, pct)));
                  }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#818CF8] to-[#6366F1] rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Speed selector */}
                <div className="flex gap-2 mt-2">
                  {['0.75x', '1x', '1.25x', '1.5x', '2x'].map((speed) => (
                    <button
                      key={speed}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        speed === '1x'
                          ? 'bg-[#818CF8] text-white'
                          : 'bg-white text-[#5A5C58] border border-[#E5E5DF] hover:border-[#818CF8]'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transcript preview */}
              <div className="mt-5 p-4 bg-white rounded-xl border-2 border-[#E5E5DF]">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wide">
                    Nội dung chính
                  </span>
                  <div className="flex-1 h-px bg-[#E5E5DF]" />
                </div>
                <p className="text-[13px] text-[#5A5C58] leading-relaxed italic">{transcript}</p>
              </div>
            </div>
          )}

          {view === 'ai' && (
            <div className="flex-1 overflow-hidden">
              <NodeAIChat
                docId={docId}
                paragraphs={[transcript]}
                docTitle={doc.title}
                onBack={() => setView('video')}
              />
            </div>
          )}

          {view === 'review' && (
            <div className="flex-1 overflow-hidden">
              <NodeReview onBack={() => setView('video')} />
            </div>
          )}

          {/* Footer */}
          {view === 'video' && (
            <div className="flex gap-3 px-6 py-4 border-t-2 border-[#333333]/20 bg-white/40 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('ai')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D1FAE5] border-2 border-[#6EE7B7] text-[#065F46] font-bold text-sm hover:bg-[#A7F3D0] transition-colors cursor-pointer"
              >
                <MessageCircle size={14} />
                AI hỏi đáp
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('review')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FEE2E2] border-2 border-[#FCA5A5] text-[#991B1B] font-bold text-sm hover:bg-[#FECACA] transition-colors cursor-pointer"
              >
                <ClipboardList size={14} />
                Ôn tập
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
