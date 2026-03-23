'use client';

import { useState, useEffect } from 'react';
import { Send, X, Upload, Cloud } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  size: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  checked: boolean;
}

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  links?: { label: string; href: string }[];
}

const INITIAL_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Kế hoạch triển khai.xlsx',
    size: '1.1 MB',
    time: 'Hôm qua',
    icon: '📊',
    iconBg: '#D1FAE5',
    iconColor: '#065F46',
    checked: false,
  },
  {
    id: '2',
    name: 'Báo cáo tiến độ.docx',
    size: '2.3 MB',
    time: '2 ngày trước',
    icon: '📝',
    iconBg: '#DBEAFE',
    iconColor: '#1E40AF',
    checked: false,
  },
  {
    id: '3',
    name: 'Phác thảo UI/UX.png',
    size: '5.8 MB',
    time: '3 ngày trước',
    icon: '🖼️',
    iconBg: '#FCE7F3',
    iconColor: '#9D174D',
    checked: false,
  },
  {
    id: '4',
    name: 'Ghi chú họp.txt',
    size: '12 KB',
    time: 'Tuần trước',
    icon: '📄',
    iconBg: '#F3F4F6',
    iconColor: '#374151',
    checked: false,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'ai',
    content:
      'Chào bạn! Tôi có thể giúp gì cho đồ án omilearn của bạn hôm nay? Tôi có thể giúp tìm tài liệu tham khảo hoặc phân tích các tệp bạn vừa tải lên.',
  },
  {
    id: '2',
    role: 'user',
    content:
      'Tìm cho tôi thêm các tài liệu về xu hướng thiết kế học tập điện tử (e-learning) năm 2024.',
  },
  {
    id: '3',
    role: 'ai',
    content:
      'Tất nhiên! Tôi đã tìm thấy 3 tài liệu liên quan đến xu hướng E-learning 2024. Tôi đang đóng bộ chúng vào Tài liệu dự án cho bạn:',
    links: [
      { label: '✅ Gamification in 2024.pdf', href: '#' },
      { label: '✅ Microlearning Trends.pdf', href: '#' },
    ],
  },
];

export default function WorkspacePage() {
  const [files, setFiles] = useState<FileItem[]>(INITIAL_FILES);
  const [messages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Show floating note after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowNote(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleFile = (id: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, checked: !f.checked } : f))
    );
  };

  const checkedCount = files.filter((f) => f.checked).length;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 relative">
      <div className="flex gap-6" style={{ height: 'calc(100vh - 160px)', minHeight: '600px' }}>
        {/* ── Left Panel: File Manager ── */}
        <div
          className="flex flex-col bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden"
          style={{ flex: '0 0 58%' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[#333333]">
            <h2 className="text-lg font-black text-[#2D2D2D]">Tệp dự án</h2>
            <div className="flex items-center gap-3">
              {checkedCount > 0 && (
                <span className="text-xs bg-[#6B2D3E] text-white px-3 py-1 rounded-full font-bold">
                  {checkedCount} đã chọn
                </span>
              )}
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#4CD964] text-[#2D2D2D] text-sm font-bold rounded-full border-2 border-[#2D2D2D] hover:bg-[#3DC954] transition-colors">
                <Upload size={14} />
                Upload
              </button>
            </div>
          </div>

          {/* File list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => toggleFile(file.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                  file.checked
                    ? 'border-[#6B2D3E] bg-[#FFF5F7]'
                    : 'border-[#CCCCCC] bg-white hover:border-[#333333]'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                    file.checked ? 'bg-[#6B2D3E] border-[#6B2D3E]' : 'border-[#CCCCCC] bg-white'
                  }`}
                >
                  {file.checked && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                {/* File icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: file.iconBg }}
                >
                  {file.icon}
                </div>

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[#2D2D2D] text-sm truncate">{file.name}</p>
                  <p className="text-[#5A5C58] text-xs mt-0.5">
                    {file.size} • {file.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Upload drop zone */}
          <div className="px-4 pb-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors ${
                isDragging ? 'border-[#6B2D3E] bg-[#FFF5F7]' : 'border-[#CCCCCC]'
              }`}
            >
              <Cloud size={28} className="text-[#9CA3AF]" />
              <p className="text-sm text-[#5A5C58] font-medium text-center">
                Kéo thả thêm tệp vào đây
              </p>
            </div>
          </div>
        </div>

        {/* ── Right Panel: AI Chat ── */}
        <div
          className="flex flex-col bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden"
          style={{ flex: '1' }}
        >
          {/* Chat header */}
          <div className="px-5 py-4 border-b-2 border-[#333333]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2D2D2D] flex items-center justify-center text-xl flex-shrink-0">
                🤖
              </div>
              <div>
                <h2 className="font-black text-[#2D2D2D] text-base">Trợ lý AI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-[#4CD964]" />
                  <span className="text-xs text-[#5A5C58]">Đang trực tuyến để hỗ trợ bạn</span>
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-[#2D2D2D] flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-0.5">
                    🤖
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#6B2D3E] text-white rounded-tr-none'
                      : 'bg-white border-2 border-[#CCCCCC] text-[#2D2D2D] rounded-tl-none'
                  }`}
                >
                  {msg.content}
                  {msg.links && (
                    <div className="mt-2 flex flex-col gap-1">
                      {msg.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.href}
                          className="text-[#6B2D3E] font-semibold hover:underline text-sm"
                          onClick={(e) => e.preventDefault()}
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 bg-white border-2 border-[#333333] rounded-full px-4 py-2">
              <input
                type="text"
                placeholder="Nhập câu hỏi..."
                className="flex-1 bg-transparent text-sm text-[#2D2D2D] outline-none placeholder:text-[#9CA3AF]"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setInputValue('');
                }}
              />
              <button
                className="w-8 h-8 rounded-full bg-[#6B2D3E] flex items-center justify-center hover:bg-[#5A2233] transition-colors flex-shrink-0"
                onClick={() => setInputValue('')}
              >
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Action Note ── */}
      <div
        className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
          showNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className="flex items-start gap-3 p-4 rounded-2xl max-w-[260px]"
          style={{
            backgroundColor: '#FFF8EC',
            border: '2px solid #F5C542',
            boxShadow: '4px 4px 0 #2D2D2D',
          }}
        >
          <div className="flex-1">
            <p className="text-xs text-[#2D2D2D] font-medium leading-relaxed">
              💡 <strong>Mẹo:</strong> Bạn có thể chọn nhiều file để AI tóm tắt cùng 1 lúc
            </p>
          </div>
          <button
            onClick={() => setShowNote(false)}
            className="w-5 h-5 rounded-full bg-[#2D2D2D]/10 flex items-center justify-center hover:bg-[#2D2D2D]/20 transition-colors flex-shrink-0 text-[#5A5C58]"
          >
            <X size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
