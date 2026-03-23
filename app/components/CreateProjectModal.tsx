'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, Check, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AIStreamText from './AIStreamText';
import { useOmiLearnStore } from '@/lib/store';

interface Props {
  onClose: () => void;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  streaming?: boolean;
}

const SUGGESTED_DOCS = [
  { id: 'd1', title: 'Giới thiệu về Hệ Điều Hành — Tanenbaum (PDF, 2.3MB)' },
  { id: 'd2', title: 'Linux Command Line Basics — Video Series (YouTube)' },
  { id: 'd3', title: 'Operating System Concepts — Silberschatz (PDF, 8.1MB)' },
];

const AI_SEARCH_RESPONSE = `Tôi tìm thấy 3 tài liệu liên quan:\n\n📄 Giới thiệu về Hệ Điều Hành — Tanenbaum\n🎥 Linux Command Line Basics — Video Series\n📚 Operating System Concepts — Silberschatz\n\nBạn có muốn thêm tài liệu nào khác không?`;

export default function CreateProjectModal({ onClose }: Props) {
  const router = useRouter();
  const createProject = useOmiLearnStore((s) => s.createProject);

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Tôi đã nhận được tài liệu của bạn. Bạn muốn tìm thêm tài liệu nào không?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(['d1', 'd2', 'd3']));
  const [showDocs, setShowDocs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setUploadedFiles((prev) => [...prev, ...names]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || isStreaming) return;
    const msg = userInput.trim();
    setUserInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: msg }]);
    setIsStreaming(true);
    setShowDocs(false);
    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: 'ai', text: AI_SEARCH_RESPONSE, streaming: true }]);
    }, 600);
  };

  const handleStreamComplete = () => {
    setIsStreaming(false);
    setShowDocs(true);
    setChatMessages((prev) =>
      prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
    );
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateProject = () => {
    const id = createProject(projectName || 'Hệ Điều Hành và Linux', projectDesc);
    router.push(`/roadmap?project=${id}`);
    onClose();
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl bg-[#F5F0EB] border-2 border-[#333333] rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-[#CCCCCC]">
          <div>
            <p className="text-xs text-[#5A5C58] uppercase tracking-widest mb-0.5">Tạo dự án mới</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      s === step
                        ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]'
                        : s < step
                        ? 'bg-[#4CD964] text-[#2D2D2D] border-[#4CD964]'
                        : 'bg-transparent text-[#5A5C58] border-[#CCCCCC]'
                    }`}
                  >
                    {s < step ? <Check size={10} strokeWidth={3} /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-[#4CD964]' : 'bg-[#CCCCCC]'}`} />}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#2D2D2D] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <AnimatePresence mode="wait">
            {/* STEP 1 */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6 space-y-4"
              >
                <h2 className="text-xl font-bold text-[#2D2D2D]">Thông tin dự án</h2>

                {/* Project name */}
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Tên dự án</label>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ví dụ: Hệ Điều Hành và Linux"
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] placeholder:text-[#9CA3AF] outline-none focus:border-[#6B2D3E] transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Mô tả ngắn</label>
                  <textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    placeholder="Mô tả mục tiêu học tập của bạn..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] placeholder:text-[#9CA3AF] outline-none focus:border-[#6B2D3E] transition-colors resize-none"
                  />
                </div>

                {/* File upload */}
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Tài liệu học tập</label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                      isDragging ? 'border-[#6B2D3E] bg-[#6B2D3E]/5' : 'border-[#CCCCCC] hover:border-[#333333]'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={24} className="mx-auto mb-2 text-[#5A5C58]" />
                    <p className="text-sm text-[#5A5C58]">Kéo thả tài liệu vào đây hoặc nhấn để chọn</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">PDF, DOCX, MP4, MP3...</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>
                  {/* Uploaded files as pills */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {uploadedFiles.map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#2D2D2D] text-white text-xs rounded-full">
                          <FileText size={10} />
                          {f}
                          <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!projectName.trim()}
                  className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tiếp tục →
                </button>
              </motion.div>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Tìm kiếm tài liệu</h2>

                {/* Chat area */}
                <div className="bg-white border-2 border-[#333333] rounded-xl h-72 overflow-y-auto p-4 space-y-3 mb-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-start gap-2 max-w-[85%]">
                          <div className="w-7 h-7 rounded-full bg-[#6B2D3E] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">AI</span>
                          </div>
                          <div className="bg-[#F1F1EC] border border-[#CCCCCC] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#2D2D2D] leading-relaxed">
                            {msg.streaming ? (
                              <AIStreamText
                                text={msg.text}
                                speed={25}
                                onComplete={handleStreamComplete}
                              />
                            ) : (
                              <span className="whitespace-pre-line">{msg.text}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="max-w-[75%] bg-[#2D2D2D] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm">
                          {msg.text}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Suggested docs with checkboxes */}
                  {showDocs && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="ml-9 space-y-2"
                    >
                      {SUGGESTED_DOCS.map((doc) => (
                        <label key={doc.id} className="flex items-start gap-2 cursor-pointer group">
                          <div
                            onClick={() => toggleDoc(doc.id)}
                            className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                              selectedDocs.has(doc.id) ? 'bg-[#4CD964] border-[#4CD964]' : 'border-[#CCCCCC]'
                            }`}
                          >
                            {selectedDocs.has(doc.id) && <Check size={8} strokeWidth={3} className="text-[#2D2D2D]" />}
                          </div>
                          <span className="text-xs text-[#2D2D2D] leading-relaxed group-hover:text-[#6B2D3E] transition-colors">
                            {doc.title}
                          </span>
                        </label>
                      ))}
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Chat input */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Nhập yêu cầu tìm tài liệu..."
                    className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#333333] bg-white text-sm outline-none focus:border-[#6B2D3E] transition-colors"
                    disabled={isStreaming}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isStreaming || !userInput.trim()}
                    className="w-10 h-10 rounded-full bg-[#2D2D2D] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors disabled:opacity-40"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors"
                >
                  Đã đủ tài liệu ✓
                </button>
              </motion.div>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2 }}
                className="p-6 space-y-5"
              >
                <h2 className="text-xl font-bold text-[#2D2D2D]">Xác nhận dự án</h2>

                {/* Summary card */}
                <div className="bg-white border-2 border-[#333333] rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-1">Tên dự án</p>
                    <p className="font-bold text-[#2D2D2D] text-lg">{projectName}</p>
                  </div>
                  {projectDesc && (
                    <div>
                      <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-1">Mô tả</p>
                      <p className="text-sm text-[#2D2D2D]">{projectDesc}</p>
                    </div>
                  )}
                  <div className="border-t border-dashed border-[#CCCCCC] pt-3">
                    <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-1">Tài liệu đã chọn</p>
                    <p className="font-semibold text-[#2D2D2D]">
                      {selectedDocs.size + uploadedFiles.length} tài liệu
                    </p>
                  </div>
                </div>

                {/* AI confirmation */}
                <div className="flex items-start gap-3 p-4 bg-[#F1F1EC] border-2 border-[#CCCCCC] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#6B2D3E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <AIStreamText
                      text={`Bạn đã sẵn sàng bắt đầu chưa? Tôi sẽ tạo lộ trình học tập cho dự án **${projectName}** với ${selectedDocs.size + uploadedFiles.length} tài liệu. Hãy nhấn "Tạo dự án" để tiếp tục! 🚀`}
                      speed={18}
                      className="text-sm text-[#2D2D2D] leading-relaxed"
                    />
                  </div>
                </div>

                <button
                  onClick={handleCreateProject}
                  className="w-full py-3.5 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold text-base hover:bg-[#3bc453] transition-colors shadow-lg"
                >
                  Tạo dự án 🎉
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-2 text-sm text-[#5A5C58] hover:text-[#2D2D2D] transition-colors"
                >
                  ← Quay lại
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
