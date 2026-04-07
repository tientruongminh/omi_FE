'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { adminApi } from '@/entities/admin/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI của OmiLearn. Hỏi tôi bất cứ điều gì về dữ liệu trong hệ thống — học viên, khóa học, tiến độ, giảng viên... 🤖',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: Message = {
      id: String(Date.now()),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await adminApi.sendAdminChat(userMsg.content);
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Xin lỗi, không thể kết nối đến AI lúc này. Vui lòng thử lại.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Có bao nhiêu học viên?',
    'Khóa học nào phổ biến nhất?',
    'Tiến độ trung bình ra sao?',
    'Thông tin giảng viên?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Chat AI</h1>
        <p className="text-[13px] text-[#5A5C58]">Hỏi đáp về mọi dữ liệu trong hệ thống</p>
      </div>

      {/* Quick questions */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => { setInput(q); }}
            className="px-3 py-1.5 rounded-full border border-[#E5E7EB] bg-white text-[11px] font-medium text-[#5A5C58] hover:border-[#6B2D3E] hover:text-[#6B2D3E] transition-colors cursor-pointer"
          >
            <Sparkles size={10} className="inline mr-1" />
            {q}
          </button>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white border-2 border-[#E5E7EB] rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'assistant' ? 'bg-[#6B2D3E]' : 'bg-[#E5E7EB]'
              }`}>
                {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-[#5A5C58]" />}
              </div>
              <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-[#F5F0EB] text-[#2D2D2D]'
                  : 'bg-[#6B2D3E] text-white'
              }`}>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-[#6B2D3E] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-[#F5F0EB] px-4 py-3 rounded-2xl">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#999] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Hỏi về dữ liệu hệ thống..."
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E] transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-[#6B2D3E] text-white flex items-center justify-center hover:bg-[#5A2534] transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
