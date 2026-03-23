'use client';

import { Send } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: Props) {
  return (
    <div className="px-3 py-3 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
      <div className="flex gap-2 items-center bg-white border-2 border-[#E5E5DF] rounded-full px-3 py-1.5 focus-within:border-[#6B2D3E] transition-colors">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
          placeholder="Nhắn tin..."
          className="flex-1 text-[12px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]"
        />
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="w-6 h-6 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
          style={{ backgroundColor: value.trim() ? '#6B2D3E' : '#E5E5DF' }}
        >
          <Send size={10} className={value.trim() ? 'text-white' : 'text-[#9CA3AF]'} />
        </button>
      </div>
    </div>
  );
}
