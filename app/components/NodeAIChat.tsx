'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X } from 'lucide-react';
import AIStreamText from './AIStreamText';
import { aiResponses, suggestedQuestions } from '@/lib/learning-data';

interface Props {
  docId?: string | null;
  paragraphs?: string[];
  docTitle?: string;
  onBack?: () => void;
  // standalone (from learn/page.tsx)
  title?: string;
  content?: string;
  onClose?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  streaming?: boolean;
}

const SUGGESTED = suggestedQuestions.slice(0, 3);

export default function NodeAIChat({ docId, paragraphs, docTitle, onBack, title, content, onClose }: Props) {
  const displayTitle = docTitle ?? title ?? 'Tài liệu';
  const displayContent = paragraphs
    ? paragraphs.join('\n\n')
    : content ?? '';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'ai',
      text: 'Tôi đã đọc tài liệu này. Bạn có câu hỏi gì không?',
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showSuggested, setShowSuggested] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getAIResponse = (q: string): string => {
    const found = aiResponses.find(
      (r) => r.question.toLowerCase().trim() === q.toLowerCase().trim()
    );
    if (found) return found.answer;
    // Fuzzy match
    const partial = aiResponses.find((r) =>
      q.toLowerCase().includes(r.question.toLowerCase().slice(0, 8)) ||
      r.question.toLowerCase().includes(q.toLowerCase().slice(0, 8))
    );
    if (partial) return partial.answer;
    return 'Câu hỏi hay! Theo tài liệu, ' + displayTitle + ' có nhiều khía cạnh thú vị. Bạn có thể hỏi cụ thể hơn về GUI, CLI, Xerox PARC, hay Desktop Metaphor không?';
  };

  const sendMessage = (text: string) => {
    if (!text.trim() || streaming) return;
    setShowSuggested(false);
    const userMsg: Message = { id: Date.now() + '-u', role: 'user', text: text.trim() };
    const aiMsgId = Date.now() + '-ai';
    const aiText = getAIResponse(text.trim());

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: aiMsgId, role: 'ai', text: aiText, streaming: true },
    ]);
    setInput('');
    setStreaming(true);
  };

  const handleStreamComplete = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, streaming: false } : m))
    );
    setStreaming(false);
  };

  const isStandalone = !onBack;

  return (
    <div className="flex h-full">
      {/* Left — Content */}
      <div className="flex-1 overflow-y-auto border-r-2 border-[#333333]/15 bg-white/30 px-6 py-5">
        <div className="text-[11px] font-bold text-[#5A5C58] uppercase tracking-wider mb-3">
          Nội dung tài liệu
        </div>
        <h3 className="font-bold text-[#2D2D2D] text-[14px] mb-4 leading-snug">{displayTitle}</h3>
        {displayContent ? (
          <div className="space-y-4">
            {displayContent.split('\n\n').map((para, i) => (
              <p key={i} className="text-[13px] text-[#2D2D2D] leading-[1.8] font-serif">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-[13px] text-[#5A5C58] italic">Nội dung đang được tải...</p>
        )}
      </div>

      {/* Right — Chat */}
      <div className="w-[360px] flex-shrink-0 flex flex-col bg-[#F5F0EB]">
        {/* Chat header */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
          <span className="text-xl">AI</span>
          <span className="font-bold text-[#2D2D2D] text-[14px]">Trợ lý AI</span>
          <div className="w-2 h-2 rounded-full bg-[#4CD964] ml-1" />
          {isStandalone && onClose && (
            <button
              onClick={onClose}
              className="ml-auto w-7 h-7 rounded-full bg-white border-2 border-[#333333]/30 flex items-center justify-center hover:border-[#333333] transition-colors"
            >
              <X size={12} />
            </button>
          )}
          {!isStandalone && onBack && (
            <button
              onClick={onBack}
              className="ml-auto text-[11px] text-[#5A5C58] hover:text-[#2D2D2D] transition-colors font-medium cursor-pointer"
            >
              ← Quay lại
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg) => (
            <AnimatePresence key={msg.id}>
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-[#EEF2FF] border border-[#A5B4FC] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6B2D3E] text-white rounded-tr-sm'
                      : 'bg-white border border-[#E5E5DF] text-[#2D2D2D] rounded-tl-sm'
                  }`}
                >
                  {msg.streaming ? (
                    <AIStreamText
                      text={msg.text}
                      speed={16}
                      onComplete={() => handleStreamComplete(msg.id)}
                    />
                  ) : (
                    msg.text
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          ))}

          {/* Suggested questions */}
          <AnimatePresence>
            {showSuggested && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-1.5 pt-1"
              >
                {SUGGESTED.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-left px-3 py-2 rounded-xl bg-[#EEF2FF] border border-[#A5B4FC] text-[12px] text-[#4338CA] font-medium hover:bg-[#E0E7FF] transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t-2 border-[#333333]/15 bg-white/40 flex-shrink-0">
          <div className="flex gap-2 items-center bg-white border-2 border-[#E5E5DF] rounded-full px-4 py-2 focus-within:border-[#6B2D3E] transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(input); }}
              placeholder="Đặt câu hỏi..."
              className="flex-1 text-[13px] text-[#2D2D2D] bg-transparent outline-none placeholder-[#9CA3AF]"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || streaming}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer disabled:cursor-not-allowed"
              style={{
                backgroundColor: input.trim() && !streaming ? '#6B2D3E' : '#E5E5DF',
              }}
            >
              <Send size={12} className={input.trim() && !streaming ? 'text-white' : 'text-[#9CA3AF]'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
