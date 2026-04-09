'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, Check, Youtube, Globe, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIStreamText } from '@/shared/ui/AIStreamText';
import { useOmiLearnStore } from '@/entities/project';
import { apiFetch, apiUpload } from '@/shared/api/client';

interface Props {
  onClose: () => void;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  streaming?: boolean;
}

type ResourceType = 'youtube' | 'website';

interface Resource {
  id: string;
  type: ResourceType;
  url: string;
  title: string;
}

const SUGGESTED_DOCS = [
  { id: 'd1', title: 'Giới thiệu về Hệ Điều Hành — Tanenbaum (PDF, 2.3MB)' },
  { id: 'd2', title: 'Linux Command Line Basics — Video Series (YouTube)' },
  { id: 'd3', title: 'Operating System Concepts — Silberschatz (PDF, 8.1MB)' },
];

const AI_SEARCH_RESPONSE = `Tôi tìm thấy 3 tài liệu liên quan:\n\nGiới thiệu về Hệ Điều Hành — Tanenbaum\nLinux Command Line Basics — Video Series\nOperating System Concepts — Silberschatz\n\nBạn có muốn thêm tài liệu nào khác không?`;

const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'youtube', label: 'YouTube', icon: <Youtube size={13} />, color: '#DC2626' },
  { value: 'website', label: 'Website', icon: <Globe size={13} />, color: '#0891B2' },
];

function resourceIcon(type: ResourceType) {
  if (type === 'youtube') return <Youtube size={14} />;
  return <Globe size={14} />;
}

export function CreateProjectModal({ onClose }: Props) {
  const router = useRouter();
  const addProject = useOmiLearnStore((s) => s.addProject); // Lấy action addProject từ store để thêm dự án mới vào state khi tạo thành công

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Tôi đã nhận được tài liệu của bạn. Bạn muốn tìm thêm tài liệu nào không?' },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(['d1', 'd2', 'd3']));
  const [showDocs, setShowDocs] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addEmptyResource = () => {
    setResources((prev) => [...prev, { id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'youtube' as ResourceType, url: '', title: '' }]);
  };

  const updateResource = (id: string, field: keyof Resource, value: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))); // Cập nhật trường cụ thể của resource có id trùng với id được truyền vào, nếu không thì giữ nguyên resource đó
  };

  const removeResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE_SIZE) {
        setCreateError(`File "${f.name}" vượt quá 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
        continue;
      }
      valid.push(f);
    }
    setUploadedFiles((prev) => [...prev, ...valid]);
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
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: 'ai', text: AI_SEARCH_RESPONSE, streaming: true }]);
    }, 600);
  };

  const handleStreamComplete = () => {
    setIsStreaming(false);
    setShowDocs(true);
    setChatMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m)));
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const validResources = resources.filter(r => r.url.trim());
  const totalResourceCount = selectedDocs.size + uploadedFiles.length + validResources.length;
  const hasSourceMaterial = uploadedFiles.length > 0 || validResources.length > 0;

  const handleCreateProject = async () => {
    setIsCreating(true);
    setCreateError(null);
    setUploadProgress(null);
    try {
      // 1. Upload files to MinIO
      const minioKeys: string[] = [];
      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          setUploadProgress(`Đang tải lên ${i + 1}/${uploadedFiles.length}...`);
          try {
            const result = await apiUpload(uploadedFiles[i]);
            if (result.object_name) {
              minioKeys.push(result.object_name);
            }
          } catch (uploadErr) {
            const ue = uploadErr as { error?: string; status?: number };
            setCreateError(`Upload file "${uploadedFiles[i].name}" thất bại: ${ue.error || 'Lỗi không xác định'} (status: ${ue.status || '?'})`);
            return; // Stop — do NOT proceed to create roadmap
          }
        }
        setUploadProgress(null);
      }

      // 2. Create roadmap with minio_keys + external_urls
      const externalUrls = validResources.map((r) => r.url.trim());

      if (minioKeys.length === 0 && externalUrls.length === 0) {
        setCreateError('Cần ít nhất 1 file hoặc URL. Upload có thể đã thất bại.');
        return;
      }

      const data = await apiFetch<{ roadmap: { project_id: string } }>('/roadmaps', {
        method: 'POST',
        body: JSON.stringify({
          project_name: projectName || 'Dự án mới',
          project_description: projectDesc || null,
          external_urls: externalUrls,
          minio_keys: minioKeys,
        }),
      });
      const projectId = data.roadmap.project_id;
      addProject({
        id: projectId,
        title: projectName,
        description: projectDesc,
        date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
        progress: 0,
      });
      router.push(`/roadmap?project=${projectId}`);
      onClose();
    } catch (e) {
      const apiErr = e as { error?: string; status?: number };
      setCreateError(apiErr.error || (e instanceof Error ? e.message : 'Đã có lỗi xảy ra.'));
    } finally {
      setIsCreating(false);
      setUploadProgress(null);
    }
  };

  const fileTypeIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return '▦';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return '▣';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '▶';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return '♫';
    return '◎';
  };

  const stepVariants = { enter: { opacity: 0, x: 30 }, center: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-2xl bg-[#F5F0EB] border-2 border-[#333333] rounded-2xl overflow-hidden shadow-2xl"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-dashed border-[#CCCCCC]">
          <div>
            <p className="text-xs text-[#5A5C58] uppercase tracking-widest mb-0.5">Tạo dự án mới</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${s === step ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]' : s < step ? 'bg-[#4CD964] text-[#2D2D2D] border-[#4CD964]' : 'bg-transparent text-[#5A5C58] border-[#CCCCCC]'}`}>
                    {s < step ? <Check size={10} strokeWidth={3} /> : s}
                  </div>
                  {s < 3 && <div className={`w-8 h-0.5 ${s < step ? 'bg-[#4CD964]' : 'bg-[#CCCCCC]'}`} />}
                </div>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full border-2 border-[#333333] flex items-center justify-center hover:bg-[#2D2D2D] hover:text-white transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#2D2D2D]">Thông tin dự án</h2>
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Tên dự án</label>
                  <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Ví dụ: Hệ Điều Hành và Linux" className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] placeholder:text-[#9CA3AF] outline-none focus:border-[#6B2D3E] transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Mô tả ngắn</label>
                  <textarea value={projectDesc} onChange={(e) => setProjectDesc(e.target.value)} placeholder="Mô tả mục tiêu học tập của bạn..." rows={3} className="w-full px-4 py-3 rounded-xl border-2 border-[#333333] bg-white text-[#2D2D2D] placeholder:text-[#9CA3AF] outline-none focus:border-[#6B2D3E] transition-colors resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-[#2D2D2D] mb-1.5 block">Tài liệu học tập</label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragging ? 'border-[#6B2D3E] bg-[#6B2D3E]/5' : 'border-[#CCCCCC] hover:border-[#333333]'}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                    <Upload size={24} className="mx-auto mb-2 text-[#5A5C58]" />
                    <p className="text-sm text-[#5A5C58]">Kéo thả tài liệu vào đây hoặc nhấn để chọn</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">PDF, DOCX, MP4, MP3...</p>
                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {uploadedFiles.map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#2D2D2D] text-white text-xs rounded-full">
                          <span>{fileTypeIcon(f.name)}</span>{f.name} <span className="text-[#9CA3AF]">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                          <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))}><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-[#2D2D2D]">Liên kết</label>
                    <button onClick={addEmptyResource} className="flex items-center gap-1 text-xs text-[#6B2D3E] font-semibold hover:opacity-80 transition-opacity cursor-pointer"><Plus size={12} />Thêm liên kết</button>
                  </div>
                  <AnimatePresence>
                    {resources.map((res) => (
                      <motion.div key={res.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-2">
                        <div className="bg-white border-2 border-[#E5E5DF] rounded-xl p-3 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5 flex-1">
                              {RESOURCE_TYPE_OPTIONS.map((opt) => (
                                <button key={opt.value} onClick={() => updateResource(res.id, 'type', opt.value)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all cursor-pointer" style={{ borderColor: res.type === opt.value ? opt.color : '#E5E5DF', backgroundColor: res.type === opt.value ? opt.color + '15' : 'white', color: res.type === opt.value ? opt.color : '#5A5C58' }}>
                                  {opt.icon}{opt.label}
                                </button>
                              ))}
                            </div>
                            <button onClick={() => removeResource(res.id)} className="w-7 h-7 rounded-full bg-[#FEE2E2] flex items-center justify-center hover:bg-[#FECACA] transition-all cursor-pointer flex-shrink-0"><Trash2 size={11} className="text-red-500" /></button>
                          </div>
                          <input type="url" value={res.url} onChange={(e) => updateResource(res.id, 'url', e.target.value)} placeholder={res.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/article'} className="w-full px-3 py-2 rounded-lg border-2 border-[#E5E5DF] text-sm text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
                          <input type="text" value={res.title} onChange={(e) => updateResource(res.id, 'title', e.target.value)} placeholder="Tiêu đề (tùy chọn)" className="w-full px-3 py-2 rounded-lg border-2 border-[#E5E5DF] text-sm text-[#2D2D2D] outline-none focus:border-[#6B2D3E] transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {resources.length === 0 && <p className="text-xs text-[#9CA3AF] text-center py-3">Thêm YouTube, website hoặc bất kỳ URL nào</p>}
                </div>
                <button onClick={() => setStep(2)} disabled={!projectName.trim()} className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Tiếp tục →</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6">
                <h2 className="text-xl font-bold text-[#2D2D2D] mb-4">Tìm kiếm tài liệu</h2>
                <div className="bg-white border-2 border-[#333333] rounded-xl h-72 overflow-y-auto p-4 space-y-3 mb-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <div className="flex items-start gap-2 max-w-[85%]">
                          <div className="w-7 h-7 rounded-full bg-[#6B2D3E] flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-white text-xs font-bold">AI</span></div>
                          <div className="bg-[#F1F1EC] border border-[#CCCCCC] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#2D2D2D] leading-relaxed">
                            {msg.streaming ? <AIStreamText text={msg.text} speed={25} onComplete={handleStreamComplete} /> : <span className="whitespace-pre-line">{msg.text}</span>}
                          </div>
                        </div>
                      )}
                      {msg.role === 'user' && <div className="max-w-[75%] bg-[#2D2D2D] text-white rounded-2xl rounded-tr-sm px-3 py-2 text-sm">{msg.text}</div>}
                    </div>
                  ))}
                  {showDocs && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-9 space-y-2">
                      {SUGGESTED_DOCS.map((doc) => (
                        <label key={doc.id} className="flex items-start gap-2 cursor-pointer group">
                          <div onClick={() => toggleDoc(doc.id)} className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selectedDocs.has(doc.id) ? 'bg-[#4CD964] border-[#4CD964]' : 'border-[#CCCCCC]'}`}>
                            {selectedDocs.has(doc.id) && <Check size={8} strokeWidth={3} className="text-[#2D2D2D]" />}
                          </div>
                          <span className="text-xs text-[#2D2D2D] leading-relaxed group-hover:text-[#6B2D3E] transition-colors">{doc.title}</span>
                        </label>
                      ))}
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="flex gap-2 mb-4">
                  <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Nhập yêu cầu tìm tài liệu..." className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#333333] bg-white text-sm outline-none focus:border-[#6B2D3E] transition-colors" disabled={isStreaming} />
                  <button onClick={handleSendMessage} disabled={isStreaming || !userInput.trim()} className="w-10 h-10 rounded-full bg-[#2D2D2D] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors disabled:opacity-40">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
                <button onClick={() => setStep(3)} className="w-full py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer">Đã đủ tài liệu ✓</button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="p-6 space-y-5">
                <h2 className="text-xl font-bold text-[#2D2D2D]">Xác nhận dự án</h2>
                <div className="bg-white border-2 border-[#333333] rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-1">Tên dự án</p>
                    <p className="font-bold text-[#2D2D2D] text-lg">{projectName}</p>
                  </div>
                  {projectDesc && <div><p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-1">Mô tả</p><p className="text-sm text-[#2D2D2D]">{projectDesc}</p></div>}
                  <div className="border-t border-dashed border-[#CCCCCC] pt-3">
                    <p className="text-xs text-[#5A5C58] uppercase tracking-wider mb-2">Tài liệu đã chọn</p>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-[#2D2D2D]">{totalResourceCount} tài liệu</span>
                      {resources.length > 0 && <span className="text-xs text-[#5A5C58] bg-[#F1F1EC] px-2 py-0.5 rounded-full">{resources.length} liên kết</span>}
                    </div>
                    {resources.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {resources.map((res) => (
                          <div key={res.id} className="flex items-center gap-2 text-xs text-[#5A5C58]">
                            <span>{resourceIcon(res.type)}</span>
                            <span className="truncate">{res.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-[#F1F1EC] border-2 border-[#CCCCCC] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#6B2D3E] flex items-center justify-center flex-shrink-0"><span className="text-white text-xs font-bold">AI</span></div>
                  <div>
                    <AIStreamText text={`Bạn đã sẵn sàng bắt đầu chưa? Tôi sẽ tạo lộ trình học tập cho dự án **${projectName}** với ${totalResourceCount} tài liệu. Hãy nhấn "Tạo dự án" để tiếp tục!`} speed={18} className="text-sm text-[#2D2D2D] leading-relaxed" />
                  </div>
                </div>
                <button onClick={handleCreateProject} disabled={isCreating || !hasSourceMaterial} className="w-full py-3.5 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold text-base hover:bg-[#3bc453] transition-colors shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isCreating ? (uploadProgress || 'Đang tạo roadmap...') : 'Tạo dự án 🎉'}
                </button>
                {!hasSourceMaterial && !isCreating && <p className="text-xs text-amber-600 text-center">Vui lòng tải lên ít nhất 1 file hoặc thêm 1 URL ở bước 1 để AI tạo roadmap.</p>}
                {createError && <p className="text-xs text-red-500 text-center">{createError}</p>}
                <button onClick={() => setStep(2)} className="w-full py-2 text-sm text-[#5A5C58] hover:text-[#2D2D2D] transition-colors cursor-pointer">← Quay lại</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default CreateProjectModal;
