'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Sparkles, Database, History } from 'lucide-react';
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
      content: 'Xin chào! Tôi là AI phân tích admin của OmiLearn. Tôi có thể đọc context DB an toàn theo yêu cầu của admin: users, hoạt động, feedback, khóa học, project, roadmap, tài liệu... rồi đưa insight và đề xuất hành động. 🤖',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Array<{ id: string; title: string; message_count: number; updated_at: string }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem('omilearn_admin_chat_session_id');
    if (stored) setSessionId(stored);
    adminApi.getAdminChatSessions().then((res) => setSessions(res.sessions)).catch(() => setSessions([]));
  }, []);

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
      const res = await adminApi.sendAdminChat(userMsg.content, sessionId);
      if (res.session_id) {
        setSessionId(res.session_id);
        window.localStorage.setItem('omilearn_admin_chat_session_id', res.session_id);
      }
      const aiMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: res.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      adminApi.getAdminChatSessions().then((r) => setSessions(r.sessions)).catch(() => {});
    } catch {
      const errMsg: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Không thể phân tích dữ liệu lúc này. Hãy kiểm tra quyền admin/backend AI rồi thử lại.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const QUICK_QUESTIONS = [
    'Tổng quan hệ thống hôm nay thế nào?',
    'Người dùng nào hoạt động nhiều nhất?',
    'Feedback/bug gần đây có gì đáng chú ý?',
    'Phân tích project, roadmap và tài liệu học tập',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      <div className="mb-4">
        <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>Chat AI</h1>
        <p className="text-[13px] text-[#5A5C58]">Admin-only: đọc DB theo whitelist để phân tích users, usage, feedback, learning data</p>
      </div>

      {/* Chat history */}
      {sessions.length > 0 && (
        <div className="mb-4 rounded-2xl border border-[#E5E7EB] bg-white p-3">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-black text-[#2D2D2D]"><History size={14} /> Conversation đã lưu</div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sessions.map((s) => (
              <button key={s.id} onClick={async () => {
                const detail = await adminApi.getAdminChatSession(s.id);
                setSessionId(s.id);
                window.localStorage.setItem('omilearn_admin_chat_session_id', s.id);
                setMessages(detail.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: new Date(m.created_at) })));
              }} className={`min-w-[220px] rounded-xl border px-3 py-2 text-left text-[11px] ${sessionId === s.id ? 'border-[#6B2D3E] bg-[#F5F0EB]' : 'border-[#E5E7EB] bg-white hover:bg-[#F9FAFB]'}`}>
                <div className="truncate font-bold text-[#2D2D2D]">{s.title || 'Untitled session'}</div>
                <div className="mt-1 text-[#6B7280]">{s.message_count} tin nhắn · {new Date(s.updated_at).toLocaleString('vi-VN')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

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
                {msg.role === 'assistant' ? <Database size={16} className="text-white" /> : <User size={16} className="text-[#5A5C58]" />}
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
                <Database size={16} className="text-white" />
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
              placeholder="VD: phân tích feedback gần đây và đề xuất ưu tiên fix..."
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
