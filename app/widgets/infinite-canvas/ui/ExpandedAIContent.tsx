'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import AIStreamText from '@/shared/ui/AIStreamText';
import { CanvasNode } from '../model/types';
import ExpandedHeader from './ExpandedHeader';

interface Props {
  node: CanvasNode;
  onClose: () => void;
}

type ChatMsg = { id: string; role: 'ai' | 'user'; text: string };

export default function ExpandedAIContent({ node, onClose }: Props) {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ id: 'init', role: 'ai', text: node.content ?? node.title }]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = () => {
    if (!input.trim() || streaming) return;
    const reply = `Đây là câu trả lời tiếp theo cho "${input.trim()}". AI đang xử lý thêm thông tin từ tài liệu...`;
    setMsgs((prev) => [
      ...prev,
      { id: Date.now() + '-u', role: 'user', text: input.trim() },
      { id: Date.now() + '-ai', role: 'ai', text: reply },
    ]);
    setInput('');
    setStreaming(true);
    setTimeout(() => setStreaming(false), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#EEF2FF]">
      <ExpandedHeader icon="AI" title="Câu trả lời AI" onClose={onClose} />
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {msgs.map((m, idx) => (
          <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'ai' && (
              <div className="w-7 h-7 rounded-xl bg-white border border-[#A5B4FC] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">AI</div>
            )}
            <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${m.role === 'user' ? 'bg-[#6B2D3E] text-white rounded-tr-sm' : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'}`}>
              {idx === 0 && m.role === 'ai' ? <AIStreamText text={m.text} speed={18} startDelay={200} /> : m.text}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="px-5 py-3 border-t border-[#818CF8]/20 bg-white/40 flex-shrink-0">
        <div className="flex gap-2 items-center bg-white border-2 border-[#E5E5DF] rounded-full px-4 py-2 focus-within:border-[#6B2D3E] transition-colors">
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Hỏi tiếp..." className="flex-1 text-[13px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]" />
          <button onClick={send} disabled={!input.trim() || streaming} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
            style={{ backgroundColor: input.trim() && !streaming ? '#6B2D3E' : '#E5E5DF' }}>
            <Send size={12} className={input.trim() && !streaming ? 'text-white' : 'text-[#9CA3AF]'} />
          </button>
        </div>
      </div>
    </div>
  );
}
