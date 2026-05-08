'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, Check, Youtube, Globe, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AIStreamText } from '@/shared/ui/AIStreamText';
import { useOmiLearnStore } from '@/entities/project';
import { apiFetch, apiFetchEventStream, apiUpload, type SseEventPayload } from '@/shared/api/client';
import {
  calculateOverallRoadmapProgress,
  type RoadmapCreationReport,
  saveRoadmapCreationReport,
} from '@/features/create-project/model/roadmapCreationReport';

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

interface SearchResult {
  id: string;
  title: string;
  authors: string;
  year: number | null;
  cited_by: number;
  abstract: string;
  url: string;
  source: string;
}

interface UploadedFilePayload {
  minio_key: string;
  original_name: string;
  mimetype: string;
}

interface RoadmapStreamProgressEvent {
  stage: string;
  status: 'started' | 'completed';
  progress: number;
  message: string;
  elapsed_ms?: number;
  meta?: Record<string, unknown>;
}

interface RoadmapCreateStreamResult {
  roadmap: { project_id: string };
  extracted_sources: number;
  total_nodes: number;
}

interface ProgressStageState {
  key: string;
  label: string;
  status: 'pending' | 'active' | 'done';
  elapsedMs?: number;
  message?: string;
}

const ROADMAP_STAGE_LABELS: Record<string, string> = {
  queued: 'Tiếp nhận yêu cầu',
  extracting_sources: 'Trích xuất tài liệu',
  creating_project: 'Khởi tạo project',
  persisting_passages: 'Lưu evidence passages',
  building_chunks: 'Chia semantic chunks',
  embedding_chunks: 'Embedding chunks',
  labeling_modules: 'Đặt tên modules',
  labeling_learning_units: 'Đặt tên learning units',
  labeling_branches_root: 'Đặt tên branches và roadmap',
  persisting_roadmap: 'Lưu roadmap cuối cùng',
  loading_result: 'Tải kết quả trả về',
};

const ROADMAP_STAGE_ORDER = Object.keys(ROADMAP_STAGE_LABELS);

const RESOURCE_TYPE_OPTIONS: { value: ResourceType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'youtube', label: 'YouTube', icon: <Youtube size={13} />, color: '#DC2626' },
  { value: 'website', label: 'Website', icon: <Globe size={13} />, color: '#0891B2' },
];

function resourceIcon(type: ResourceType) {
  if (type === 'youtube') return <Youtube size={14} />;
  return <Globe size={14} />;
}

function formatElapsed(ms?: number) {
  if (!ms || ms <= 0) return null;
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function createStageSnapshot(): ProgressStageState[] {
  return ROADMAP_STAGE_ORDER.map((key) => ({
    key,
    label: ROADMAP_STAGE_LABELS[key],
    status: 'pending',
  }));
}

const MAX_TOTAL_UPLOAD_BYTES = 50 * 1024 * 1024;

function formatFileSizeMB(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function CreateProjectModal({ onClose }: Props) {
  const router = useRouter();
  const addProject = useOmiLearnStore((s) => s.addProject);

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  // Accumulate ALL search results across searches (keyed by id to dedupe)
  const [allSearchResults, setAllSearchResults] = useState<Map<string, SearchResult>>(new Map());
  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());
  const [showDocs, setShowDocs] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [roadmapPercent, setRoadmapPercent] = useState(0);
  const [roadmapStatusMessage, setRoadmapStatusMessage] = useState<string | null>(null);
  const [progressStages, setProgressStages] = useState<ProgressStageState[]>(createStageSnapshot);
  const [createStartedAt, setCreateStartedAt] = useState<number | null>(null);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [uploadElapsedMs, setUploadElapsedMs] = useState(0);
  const progressStagesRef = useRef<ProgressStageState[]>(createStageSnapshot());
  const roadmapPercentRef = useRef(0);
  const roadmapStatusMessageRef = useRef<string | null>(null);
  const uploadPercentRef = useRef(0);
  const uploadProgressRef = useRef<string | null>(null);
  const totalElapsedMsRef = useRef(0);
  const uploadElapsedMsRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [step2Initialized, setStep2Initialized] = useState(false);

  // Sorted search results list (selected first, then by order added)
  const searchResultsList = useMemo(() => {
    const all = Array.from(allSearchResults.values());
    // Selected on top
    const selected = all.filter(r => selectedDocs.has(r.id));
    const unselected = all.filter(r => !selectedDocs.has(r.id));
    return [...selected, ...unselected];
  }, [allSearchResults, selectedDocs]);

  const totalUploadedBytes = useMemo(
    () => uploadedFiles.reduce((sum, file) => sum + file.size, 0),
    [uploadedFiles],
  );

  const overallRoadmapProgress = useMemo(
    () => calculateOverallRoadmapProgress(uploadPercent, roadmapPercent, uploadedFiles.length > 0),
    [roadmapPercent, uploadPercent, uploadedFiles.length],
  );

  useEffect(() => {
    if (step !== 1) {
      setUploadError(null);
      return;
    }

    if (
      createError &&
      (createError.includes('50 MB') ||
        createError.includes('Tổng dung lượng file') ||
        createError.includes('File "'))
    ) {
      setUploadError(createError);
    }
  }, [createError, step]);

  const addEmptyResource = () => {
    setResources((prev) => [...prev, { id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type: 'youtube' as ResourceType, url: '', title: '' }]);
  };

  const updateResource = (id: string, field: keyof Resource, value: string) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // When entering Step 2 for the first time, send context-aware greeting
  useEffect(() => {
    if (step === 2 && !step2Initialized) {
      setStep2Initialized(true);
      const fileNames = uploadedFiles.map(f => f.name).join(', ');
      const urlList = resources.filter(r => r.url.trim()).map(r => r.url).join(', ');

      let greeting = `Chào bạn! Tôi là trợ lý OmiLearn AI 🎓\n\n`;
      greeting += `📋 **Dự án:** ${projectName}\n`;
      if (projectDesc) greeting += `📝 **Mô tả:** ${projectDesc}\n`;
      if (fileNames) greeting += `📎 **Tài liệu đã tải:** ${fileNames}\n`;
      if (urlList) greeting += `🔗 **Liên kết:** ${urlList}\n`;
      greeting += `\nBạn muốn tìm thêm tài liệu gì? Tôi sẽ tìm cả **bài báo khoa học** lẫn **tài liệu web** (PDF, khóa học, slides...) cho bạn.`;

      setChatMessages([{ role: 'ai', text: greeting }]);
    }
  }, [step, step2Initialized, projectName, projectDesc, uploadedFiles, resources]);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB per file

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const valid: File[] = [];
    let nextTotalBytes = totalUploadedBytes;
    let nextUploadError: string | null = null;
    for (const f of Array.from(files)) {
      if (f.size > MAX_FILE_SIZE) {
        nextUploadError = `File "${f.name}" vượt quá 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB).`;
        setCreateError(`File "${f.name}" vượt quá 50 MB (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
        continue;
      }
      if (nextTotalBytes + f.size > MAX_TOTAL_UPLOAD_BYTES) {
        nextUploadError = `Tổng dung lượng file vượt quá 50 MB. Hiện tại đã chọn ${formatFileSizeMB(totalUploadedBytes)}, thêm "${f.name}" sẽ thành ${formatFileSizeMB(nextTotalBytes + f.size)}.`;
        setCreateError(
          `Tổng dung lượng file vượt quá 50 MB. Hiện tại đã chọn ${formatFileSizeMB(totalUploadedBytes)}, thêm "${f.name}" sẽ thành ${formatFileSizeMB(nextTotalBytes + f.size)}.`,
        );
        continue;
      }
      valid.push(f);
      nextTotalBytes += f.size;
    }
    setUploadError(nextUploadError);
    if (valid.length > 0) {
      setCreateError(null);
      setUploadedFiles((prev) => [...prev, ...valid]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isStreaming) return;
    const query = userInput.trim();
    setUserInput('');
    setChatMessages((prev) => [...prev, { role: 'user', text: query }]);
    setIsStreaming(true);

    try {
      const context = [projectName, projectDesc].filter(Boolean).join(' — ');

      const res = await apiFetch<{
        results: { title: string; url: string; snippet: string; source: string }[];
        ai_summary: string;
      }>('/ai/search/web', {
        method: 'POST',
        body: JSON.stringify({ query, context, limit: 10 }),
      });

      setAllSearchResults((prev) => {
        const next = new Map(prev);
        for (const r of res.results) {
          const key = r.url;
          if (!next.has(key)) {
            next.set(key, {
              id: key,
              title: r.title,
              authors: '',
              year: null,
              cited_by: 0,
              abstract: r.snippet,
              url: r.url,
              source: r.source || 'web_search',
            });
          }
        }
        return next;
      });

      setShowDocs(true);

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: res.ai_summary + (res.results.length > 0
            ? `\n\n📚 Tìm thấy **${res.results.length}** tài liệu mới. Tick chọn những tài liệu bạn muốn dùng nhé!`
            : ''),
          streaming: true,
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Xin lỗi, không thể tìm kiếm lúc này. Vui lòng thử lại.' },
      ]);
      setIsStreaming(false);
    }
  };

  const handleStreamComplete = () => {
    setIsStreaming(false);
    setChatMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m)));
  };

  const toggleDoc = (id: string) => {
    setSelectedDocs((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const validResources = resources.filter(r => r.url.trim());
  // Count includes: uploaded files + manual links + selected search results
  const totalResourceCount = selectedDocs.size + uploadedFiles.length + validResources.length;
  const hasSourceMaterial = uploadedFiles.length > 0 || validResources.length > 0 || selectedDocs.size > 0;

  const resetRoadmapProgress = () => {
    const nextStages = createStageSnapshot();
    setRoadmapPercent(0);
    setRoadmapStatusMessage(null);
    setProgressStages(nextStages);
    progressStagesRef.current = nextStages;
    roadmapPercentRef.current = 0;
    roadmapStatusMessageRef.current = null;
  };

  useEffect(() => {
    if (!isCreating || !createStartedAt) return;

    setTotalElapsedMs(Date.now() - createStartedAt);
    totalElapsedMsRef.current = Date.now() - createStartedAt;
    const timer = window.setInterval(() => {
      const nextElapsed = Date.now() - createStartedAt;
      totalElapsedMsRef.current = nextElapsed;
      setTotalElapsedMs(nextElapsed);
    }, 250);

    return () => window.clearInterval(timer);
  }, [isCreating, createStartedAt]);

  const buildCreationReport = (
    projectId: string,
    status: RoadmapCreationReport['status'],
    errorMessage?: string | null,
  ): RoadmapCreationReport => ({
    projectId,
    projectName: projectName || 'Du an moi',
    projectDescription: projectDesc || null,
    sourceCount: totalResourceCount,
    uploadPercent: uploadPercentRef.current,
    uploadMessage: uploadProgressRef.current,
    roadmapPercent: roadmapPercentRef.current,
    roadmapStatusMessage: roadmapStatusMessageRef.current,
    progressStages: progressStagesRef.current,
    startedAt: createStartedAt ?? Date.now(),
    completedAt: status === 'running' ? undefined : Date.now(),
    totalElapsedMs: totalElapsedMsRef.current,
    uploadElapsedMs: uploadElapsedMsRef.current,
    status,
    errorMessage: errorMessage ?? null,
  });

  const applyRoadmapProgressEvent = (payload: SseEventPayload) => {
    if (payload.event !== 'progress') return;
    const data = payload.data as RoadmapStreamProgressEvent;
    roadmapPercentRef.current = data.progress ?? 0;
    roadmapStatusMessageRef.current = data.message || null;
    const nextStages: ProgressStageState[] = progressStagesRef.current.map((stage) => {
      if (stage.key !== data.stage) {
        if (data.status === 'started' && stage.status === 'active') {
          return { ...stage, status: 'done' };
        }
        return stage;
      }
      return {
        ...stage,
        status: data.status === 'completed' ? 'done' : 'active',
        elapsedMs: data.elapsed_ms,
        message: data.message,
      };
    });
    progressStagesRef.current = nextStages;
    setRoadmapPercent(data.progress ?? 0);
    setRoadmapStatusMessage(data.message || null);
    setProgressStages(nextStages);
  };

  const handleCreateProject = async () => {
    if (totalUploadedBytes > MAX_TOTAL_UPLOAD_BYTES) {
      setCreateError(
        `Tổng dung lượng file đang là ${formatFileSizeMB(totalUploadedBytes)}, vượt quá giới hạn 50 MB.`,
      );
      return;
    }

    const startedAt = Date.now();
    setIsCreating(true);
    setCreateStartedAt(startedAt);
    setTotalElapsedMs(0);
    setUploadElapsedMs(0);
    totalElapsedMsRef.current = 0;
    uploadElapsedMsRef.current = 0;
    setCreateError(null);
    setUploadError(null);
    setUploadProgress(null);
    setUploadPercent(0);
    uploadProgressRef.current = null;
    uploadPercentRef.current = 0;
    resetRoadmapProgress();
    try {
      // 1. Upload files to MinIO
      const uploadedFilePayloads: UploadedFilePayload[] = [];
      const uploadStartedAt = Date.now();
      if (uploadedFiles.length > 0) {
        for (let i = 0; i < uploadedFiles.length; i++) {
          const nextUploadMessage = `Đang tải lên ${i + 1}/${uploadedFiles.length}...`;
          const nextUploadPercent = Math.round((i / uploadedFiles.length) * 100);
          uploadProgressRef.current = nextUploadMessage;
          uploadPercentRef.current = nextUploadPercent;
          setUploadProgress(nextUploadMessage);
          setUploadPercent(nextUploadPercent);
          try {
            const result = await apiUpload(uploadedFiles[i]);
            if (result.object_name) {
              uploadedFilePayloads.push({
                minio_key: result.object_name,
                original_name: uploadedFiles[i].name,
                mimetype: uploadedFiles[i].type,
              });
            }
          } catch (uploadErr) {
            const ue = uploadErr as { error?: string; status?: number };
            setCreateError(`Upload file "${uploadedFiles[i].name}" thất bại: ${ue.error || 'Lỗi không xác định'} (status: ${ue.status || '?'})`);
            return; // Stop — do NOT proceed to create roadmap
          }
        }
        uploadPercentRef.current = 100;
        uploadProgressRef.current = null;
        setUploadPercent(100);
        setUploadProgress(null);
      }
      uploadElapsedMsRef.current = Date.now() - uploadStartedAt;
      setUploadElapsedMs(uploadElapsedMsRef.current);

      // 2. Collect ALL external URLs: manual resources + selected search results
      const manualUrls = validResources.map((r) => r.url.trim());
      const searchUrls = Array.from(selectedDocs)
        .map(id => allSearchResults.get(id))
        .filter((r): r is SearchResult => !!r && !!r.url)
        .map(r => r.url);

      const allExternalUrls = [...manualUrls, ...searchUrls];

      if (uploadedFilePayloads.length === 0 && allExternalUrls.length === 0) {
        setCreateError('Cần ít nhất 1 file hoặc URL. Upload có thể đã thất bại.');
        return;
      }

      // 3. Create roadmap
      setRoadmapStatusMessage('Đang mở kết nối realtime tạo roadmap...');
      const data = await apiFetchEventStream<RoadmapCreateStreamResult>('/roadmaps/stream', {
        method: 'POST',
        body: JSON.stringify({
          project_name: projectName || 'Dự án mới',
          project_description: projectDesc || null,
          external_urls: allExternalUrls,
          uploaded_files: uploadedFilePayloads,
        }),
        onEvent: applyRoadmapProgressEvent,
      });
      roadmapPercentRef.current = 100;
      roadmapStatusMessageRef.current = 'Da tao xong roadmap.';
      setRoadmapPercent(100);
      setRoadmapStatusMessage('Đã tạo xong roadmap.');
      const projectId = data.roadmap.project_id;
      const completedAt = Date.now();
      totalElapsedMsRef.current = completedAt - startedAt;
      setTotalElapsedMs(completedAt - startedAt);
      addProject({
        id: projectId,
        title: projectName,
        description: projectDesc,
        date: new Date().toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
        progress: 0,
      });
      saveRoadmapCreationReport({
        ...buildCreationReport(projectId, 'completed'),
        completedAt,
        totalElapsedMs: completedAt - startedAt,
        roadmapPercent: 100,
        roadmapStatusMessage: 'Da tao xong roadmap.',
      });
      router.push(`/roadmap?project=${projectId}`);
      onClose();
    } catch (e) {
      const apiErr = e as { error?: string; status?: number };
      setCreateError(apiErr.error || (e instanceof Error ? e.message : 'Đã có lỗi xảy ra.'));
    } finally {
      setIsCreating(false);
      setUploadProgress(null);
      setUploadPercent(0);
      uploadProgressRef.current = null;
      uploadPercentRef.current = 0;
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
                  <p className={`mt-2 text-xs ${totalUploadedBytes > MAX_TOTAL_UPLOAD_BYTES ? 'text-red-600' : 'text-[#9CA3AF]'}`}>
                    Tổng dung lượng file tối đa là 50 MB. Hiện tại: {formatFileSizeMB(totalUploadedBytes)} / {formatFileSizeMB(MAX_TOTAL_UPLOAD_BYTES)}
                  </p>
                  {uploadError && (
                    <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {uploadError}
                    </p>
                  )}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {uploadedFiles.map((f, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#2D2D2D] text-white text-xs rounded-full">
                          <span>{fileTypeIcon(f.name)}</span>{f.name} <span className="text-[#9CA3AF]">({(f.size / 1024 / 1024).toFixed(1)} MB)</span>
                          <button onClick={() => {
                            setUploadedFiles((prev) => prev.filter((_, j) => j !== i));
                            setCreateError(null);
                            setUploadError(null);
                          }}><X size={10} /></button>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[#2D2D2D]">Tìm kiếm tài liệu</h2>
                  {selectedDocs.size > 0 && (
                    <span className="text-xs font-semibold bg-[#4CD964] text-[#2D2D2D] px-3 py-1 rounded-full">
                      ✓ {selectedDocs.size} đã chọn
                    </span>
                  )}
                </div>

                {/* Chat area */}
                <div className="bg-white border-2 border-[#333333] rounded-xl h-64 overflow-y-auto p-4 space-y-3 mb-3">
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
                  <div ref={chatEndRef} />
                </div>

                {/* Search results — always visible once we have any */}
                {searchResultsList.length > 0 && (
                  <div className="border-2 border-[#E5E5DF] rounded-xl p-3 mb-3 max-h-48 overflow-y-auto bg-white">
                    <p className="text-xs font-semibold text-[#5A5C58] mb-2 uppercase tracking-wider">
                      Tài liệu tìm được ({searchResultsList.length}) — tick để thêm vào dự án
                    </p>
                    <div className="space-y-2">
                      {searchResultsList.map((doc) => (
                        <label key={doc.id} className="flex items-start gap-2 cursor-pointer group p-1.5 rounded-lg hover:bg-[#F5F0EB] transition-colors">
                          <div onClick={() => toggleDoc(doc.id)} className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selectedDocs.has(doc.id) ? 'bg-[#4CD964] border-[#4CD964]' : 'border-[#CCCCCC] group-hover:border-[#999]'}`}>
                            {selectedDocs.has(doc.id) && <Check size={8} strokeWidth={3} className="text-[#2D2D2D]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${doc.source === 'openalex' ? 'bg-blue-100 text-blue-700' : doc.source === 'web_search' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                {doc.source === 'openalex' ? '📚 Academic' : doc.source === 'web_search' ? '🔎 AI Search' : '🌐 Web'}
                              </span>
                              <span className="text-xs text-[#2D2D2D] font-medium truncate group-hover:text-[#6B2D3E] transition-colors">{doc.title}</span>
                            </div>
                            <span className="text-[10px] text-[#5A5C58] block mt-0.5">
                              {doc.authors && <>{doc.authors} • </>}
                              {doc.year && <>{doc.year} • </>}
                              {doc.cited_by > 0 && <>Cited: {doc.cited_by}</>}
                            </span>
                            {doc.url && (
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[10px] text-[#6B2D3E] hover:underline inline-flex items-center gap-0.5 mt-0.5">
                                <ExternalLink size={8} /> Xem
                              </a>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2 mb-4">
                  <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Nhập yêu cầu tìm tài liệu..." className="flex-1 px-4 py-2.5 rounded-full border-2 border-[#333333] bg-white text-sm outline-none focus:border-[#6B2D3E] transition-colors" disabled={isStreaming} />
                  <button onClick={handleSendMessage} disabled={isStreaming || !userInput.trim()} className="w-10 h-10 rounded-full bg-[#2D2D2D] flex items-center justify-center hover:bg-[#1a1a1a] transition-colors disabled:opacity-40">
                    <Send size={14} className="text-white" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-full border-2 border-[#333333] text-[#2D2D2D] font-semibold hover:bg-[#2D2D2D] hover:text-white transition-colors cursor-pointer">← Quay lại</button>
                  <button onClick={() => setStep(3)} className="flex-1 py-3 rounded-full bg-[#2D2D2D] text-white font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer">
                    Đã đủ tài liệu ✓
                  </button>
                </div>
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
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {uploadedFiles.length > 0 && <span className="text-xs bg-[#F1F1EC] px-2 py-0.5 rounded-full">📎 {uploadedFiles.length} file</span>}
                      {validResources.length > 0 && <span className="text-xs bg-[#F1F1EC] px-2 py-0.5 rounded-full">🔗 {validResources.length} liên kết</span>}
                      {selectedDocs.size > 0 && <span className="text-xs bg-[#E8F5E9] px-2 py-0.5 rounded-full">🔍 {selectedDocs.size} từ tìm kiếm</span>}
                      <span className="font-semibold text-[#2D2D2D]">= {totalResourceCount} tài liệu</span>
                    </div>
                    {/* Show selected search docs */}
                    {selectedDocs.size > 0 && (
                      <div className="space-y-1 mt-2">
                        {Array.from(selectedDocs).map(id => {
                          const doc = allSearchResults.get(id);
                          if (!doc) return null;
                          return (
                            <div key={id} className="flex items-center gap-2 text-xs text-[#5A5C58]">
                              <span>{doc.source === 'openalex' ? '📚' : '🌐'}</span>
                              <span className="truncate">{doc.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {validResources.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {validResources.map((res) => (
                          <div key={res.id} className="flex items-center gap-2 text-xs text-[#5A5C58]">
                            <span>{resourceIcon(res.type)}</span>
                            <span className="truncate">{res.title || res.url}</span>
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
                {isCreating && (
                  <div className="space-y-3 rounded-xl border-2 border-[#333333] bg-white p-4">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5A5C58]">
                        <span>Tao roadmap</span>
                        <span>{overallRoadmapProgress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#E5E5DF]">
                        <div
                          className="h-full rounded-full bg-[#4CD964] transition-all duration-300"
                          style={{ width: `${overallRoadmapProgress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] text-[#5A5C58]">
                        He thong dang xu ly tai lieu va tao roadmap cho ban...
                      </p>
                    </div>

                    <div className="hidden grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg border border-[#E5E5DF] bg-[#F9F8F5] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A5C58]">
                          Tong thoi gian
                        </p>
                        <p className="text-sm font-bold text-[#2D2D2D]">
                          {formatElapsed(totalElapsedMs) ?? 'Dang tinh...'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-[#E5E5DF] bg-[#F9F8F5] px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5A5C58]">
                          Thoi gian upload
                        </p>
                        <p className="text-sm font-bold text-[#2D2D2D]">
                          {formatElapsed(uploadElapsedMs) ?? 'Dang upload...'}
                        </p>
                      </div>
                    </div>

                    <div className="hidden">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5A5C58]">
                        <span>Upload tài liệu</span>
                        <span>{uploadPercent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#E5E5DF]">
                        <div
                          className="h-full rounded-full bg-[#2D2D2D] transition-all duration-300"
                          style={{ width: `${uploadPercent}%` }}
                        />
                      </div>
                      {uploadProgress && (
                        <p className="mt-1.5 text-[11px] text-[#5A5C58]">{uploadProgress}</p>
                      )}
                    </div>

                    <div className="hidden">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#5A5C58]">
                        <span>Tạo roadmap realtime</span>
                        <span>{roadmapPercent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#E5E5DF]">
                        <div
                          className="h-full rounded-full bg-[#4CD964] transition-all duration-300"
                          style={{ width: `${roadmapPercent}%` }}
                        />
                      </div>
                      {roadmapStatusMessage && (
                        <p className="mt-1.5 text-[11px] text-[#2D2D2D]">{roadmapStatusMessage}</p>
                      )}
                    </div>

                    <div className="hidden space-y-1.5">
                      {progressStages.map((stage) => (
                        <div
                          key={stage.key}
                          className="flex items-center justify-between rounded-lg border border-[#E5E5DF] px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                stage.status === 'done'
                                  ? 'bg-[#4CD964]'
                                  : stage.status === 'active'
                                    ? 'bg-[#F59E0B]'
                                    : 'bg-[#D1D5DB]'
                              }`}
                            />
                            <div>
                              <p className="font-semibold text-[#2D2D2D]">{stage.label}</p>
                              {stage.message && (
                                <p className="text-[10px] text-[#5A5C58]">{stage.message}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-[#5A5C58]">
                              {stage.status === 'done' ? 'Xong' : stage.status === 'active' ? 'Đang chạy' : 'Chờ'}
                            </p>
                            {stage.elapsedMs ? (
                              <p className="text-[10px] text-[#9CA3AF]">{formatElapsed(stage.elapsedMs)}</p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={handleCreateProject} disabled={isCreating || !hasSourceMaterial} className="w-full py-3.5 rounded-full bg-[#4CD964] text-[#2D2D2D] font-bold text-base hover:bg-[#3bc453] transition-colors shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                  {isCreating ? 'Đang tạo roadmap...' : 'Tạo dự án 🎉'}
                </button>
                {!hasSourceMaterial && !isCreating && <p className="text-xs text-amber-600 text-center">Vui lòng tải lên ít nhất 1 file, thêm 1 URL, hoặc chọn tài liệu từ tìm kiếm.</p>}
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
