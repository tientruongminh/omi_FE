'use client';

import { useState, useEffect, use, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileVideo, FileText, Book, Trash2, Plus, Sparkles, ChevronRight, ChevronDown, ArrowLeft, Pencil, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { teacherApi, TeacherCourse, CourseUnit } from '@/entities/teacher/api';

/* ── Types ──────────────────────────────────────────────── */
interface Resource {
  id: string;
  name: string;
  type: 'video' | 'pdf' | 'book' | 'doc';
  size: string;
  uploadedAt: string;
}

interface RoadmapNode {
  id: string;
  title: string;
  type: 'chapter' | 'lesson' | 'quiz';
  children?: RoadmapNode[];
  duration?: string;
}

const FILE_ICONS: Record<Resource['type'], typeof FileVideo> = {
  video: FileVideo,
  pdf: FileText,
  book: Book,
  doc: FileText,
};

const FILE_COLORS: Record<Resource['type'], { bg: string; text: string }> = {
  video: { bg: '#FECDD3', text: '#884856' },
  pdf: { bg: '#FEF3C7', text: '#6A5B0C' },
  book: { bg: '#D1FAE5', text: '#3B644E' },
  doc: { bg: '#E8E6E0', text: '#5A5C58' },
};

const NODE_COLORS: Record<RoadmapNode['type'], { bg: string; border: string; text: string; dot: string }> = {
  chapter: { bg: '#F5F0EB', border: '#D5C8B8', text: '#2D2D2D', dot: '#6B2D3E' },
  lesson: { bg: '#FFFFFF', border: '#E5E7EB', text: '#2D2D2D', dot: '#3B644E' },
  quiz: { bg: '#FEF3C7', border: '#FCD34D', text: '#6A5B0C', dot: '#F59E0B' },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [course, setCourse] = useState<TeacherCourse | null>(null);
  const [units, setUnits] = useState<CourseUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'roadmap'>('resources');
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Roadmap built from units
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [courseRes, unitsRes] = await Promise.all([
          teacherApi.getCourse(id),
          teacherApi.getUnits(id),
        ]);
        setCourse(courseRes.course);
        const unitList = unitsRes.units ?? [];
        setUnits(unitList);
        // Build roadmap from units
        const chapters: RoadmapNode[] = unitList.map(u => ({
          id: u.id,
          title: u.title,
          type: 'chapter' as const,
          children: [],
        }));
        setRoadmap(chapters);
        setExpandedChapters(new Set(chapters.map(c => c.id)));
      } catch {
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpload = useCallback(() => {
    const newRes: Resource = {
      id: `r${Date.now()}`,
      name: `Tài liệu mới ${resources.length + 1}.pdf`,
      type: 'pdf',
      size: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    setResources(prev => [...prev, newRes]);
  }, [resources.length]);

  const handleDeleteResource = (rid: string) => {
    setResources(prev => prev.filter(r => r.id !== rid));
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) next.delete(chapterId);
      else next.add(chapterId);
      return next;
    });
  };

  const startEdit = (nodeId: string, title: string) => {
    setEditingNode(nodeId);
    setEditTitle(title);
  };

  const saveEdit = async (chapterIdx: number, lessonIdx?: number) => {
    if (!editTitle.trim()) return;
    if (lessonIdx === undefined) {
      // It's a unit — update via API
      const unitId = roadmap[chapterIdx]?.id;
      if (unitId) {
        try {
          // No direct update unit API — just update local state
          setRoadmap(prev => {
            const next = [...prev];
            next[chapterIdx] = { ...next[chapterIdx], title: editTitle };
            return next;
          });
        } catch {}
      }
    } else {
      setRoadmap(prev => {
        const next = [...prev];
        const children = [...(next[chapterIdx].children ?? [])];
        children[lessonIdx] = { ...children[lessonIdx], title: editTitle };
        next[chapterIdx] = { ...next[chapterIdx], children };
        return next;
      });
    }
    setEditingNode(null);
  };

  const addLesson = async (chapterIdx: number) => {
    const chapterId = roadmap[chapterIdx]?.id;
    if (!chapterId) return;
    try {
      const res = await teacherApi.addUnit(id, { title: 'Bài học mới' });
      const newLesson: RoadmapNode = {
        id: res.unit.id,
        title: res.unit.title,
        type: 'lesson',
        duration: '30 phút',
      };
      setRoadmap(prev => {
        const next = [...prev];
        const children = [...(next[chapterIdx].children ?? []), newLesson];
        next[chapterIdx] = { ...next[chapterIdx], children };
        return next;
      });
    } catch {}
  };

  const addChapter = async () => {
    try {
      const res = await teacherApi.addUnit(id, { title: `Chương ${roadmap.length + 1}: Chủ đề mới` });
      const newCh: RoadmapNode = {
        id: res.unit.id,
        title: res.unit.title,
        type: 'chapter',
        children: [],
      };
      setRoadmap(prev => [...prev, newCh]);
      setExpandedChapters(prev => new Set([...prev, newCh.id]));
    } catch {}
  };

  const deleteNode = (chapterIdx: number, lessonIdx?: number) => {
    setRoadmap(prev => {
      if (lessonIdx !== undefined) {
        const next = [...prev];
        next[chapterIdx] = {
          ...next[chapterIdx],
          children: next[chapterIdx].children?.filter((_, i) => i !== lessonIdx),
        };
        return next;
      }
      return prev.filter((_, i) => i !== chapterIdx);
    });
  };

  const handleGenerateRoadmap = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setExpandedChapters(new Set(roadmap.map(c => c.id)));
      setActiveTab('roadmap');
    }, 2500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#6B2D3E]" size={28} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div>
        <Link href="/admin/courses" className="flex items-center gap-1 text-[12px] text-[#6B2D3E] font-medium mb-4 hover:underline">
          <ArrowLeft size={14} /> Về danh sách khóa học
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error ?? 'Không tìm thấy khóa học.'}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/admin/courses" className="flex items-center gap-1 text-[12px] text-[#6B2D3E] font-medium mb-2 hover:underline">
            <ArrowLeft size={14} /> Về danh sách khóa học
          </Link>
          <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
            {course.title}
          </h1>
          <p className="text-[13px] text-[#5A5C58] mt-0.5">
            {course.student_count ?? 0} học viên · {units.length} đơn vị
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        {(['resources', 'roadmap'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[13px] font-semibold border-b-2 -mb-[2px] transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-[#6B2D3E] text-[#6B2D3E]'
                : 'border-transparent text-[#5A5C58] hover:text-[#2D2D2D]'
            }`}
          >
            {tab === 'resources' ? '📁 Tài nguyên' : '🗺️ Đơn vị học'}
          </button>
        ))}
      </div>

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div>
          <div
            onClick={handleUpload}
            className="border-2 border-dashed border-[#CCCCCC] rounded-2xl p-8 text-center mb-6 hover:border-[#6B2D3E] hover:bg-[#FAF9F7] transition-all cursor-pointer group"
          >
            <Upload size={32} className="mx-auto text-[#999] group-hover:text-[#6B2D3E] transition-colors mb-2" />
            <p className="text-[14px] font-semibold text-[#5A5C58] group-hover:text-[#6B2D3E]">
              Kéo thả hoặc nhấn để upload tài nguyên
            </p>
            <p className="text-[11px] text-[#999] mt-1">Video, PDF, sách, tài liệu — tối đa 500MB/file</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#5A5C58]">{resources.length} tài nguyên</p>
            <button
              onClick={handleGenerateRoadmap}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B2D3E] text-white text-[12px] font-semibold hover:bg-[#5A2534] transition-colors cursor-pointer disabled:opacity-60"
            >
              <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Đang tạo...' : 'AI Tạo Roadmap từ tài nguyên'}
            </button>
          </div>

          <div className="space-y-2">
            {resources.map((r, i) => {
              const Icon = FILE_ICONS[r.type];
              const colors = FILE_COLORS[r.type];
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="flex items-center gap-4 bg-white border-2 border-[#E5E7EB] rounded-xl px-4 py-3 hover:shadow-sm transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.bg }}>
                    <Icon size={18} style={{ color: colors.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#2D2D2D] truncate">{r.name}</p>
                    <p className="text-[11px] text-[#999]">{r.size} · {r.uploadedAt}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(r.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roadmap Tab */}
      {activeTab === 'roadmap' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] font-semibold text-[#5A5C58]">{roadmap.length} đơn vị</p>
            <button
              onClick={addChapter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#6B2D3E] hover:bg-[#F5F0EB] transition-colors cursor-pointer"
            >
              <Plus size={14} /> Thêm đơn vị
            </button>
          </div>

          <div className="space-y-3">
            {roadmap.map((chapter, chIdx) => {
              const isExpanded = expandedChapters.has(chapter.id);
              const chColor = NODE_COLORS[chapter.type];
              return (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: chIdx * 0.05, duration: 0.3 }}
                  className="border-2 rounded-2xl overflow-hidden"
                  style={{ borderColor: chColor.border, backgroundColor: chColor.bg }}
                >
                  <div className="flex items-center gap-2 px-4 py-3">
                    <button onClick={() => toggleChapter(chapter.id)} className="cursor-pointer">
                      {isExpanded ? <ChevronDown size={16} className="text-[#5A5C58]" /> : <ChevronRight size={16} className="text-[#5A5C58]" />}
                    </button>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: chColor.dot }} />

                    {editingNode === chapter.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(chIdx); if (e.key === 'Escape') setEditingNode(null); }}
                          className="flex-1 px-2 py-1 rounded-lg border border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(chIdx)} className="text-[#3B644E] cursor-pointer"><Save size={14} /></button>
                        <button onClick={() => setEditingNode(null)} className="text-[#999] cursor-pointer"><X size={14} /></button>
                      </div>
                    ) : (
                      <span className="text-[14px] font-bold text-[#2D2D2D] flex-1">{chapter.title}</span>
                    )}

                    <span className="text-[10px] text-[#999] font-medium">{chapter.children?.length ?? 0} bài</span>

                    {editingNode !== chapter.id && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(chapter.id, chapter.title)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/50 text-[#5A5C58] cursor-pointer">
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => deleteNode(chIdx)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && chapter.children && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-1.5">
                          {chapter.children.map((node, lIdx) => {
                            const nColor = NODE_COLORS[node.type];
                            return (
                              <div
                                key={node.id}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm"
                                style={{ borderColor: nColor.border, backgroundColor: nColor.bg }}
                              >
                                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: nColor.dot }} />
                                {editingNode === node.id ? (
                                  <div className="flex items-center gap-2 flex-1">
                                    <input
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(chIdx, lIdx); if (e.key === 'Escape') setEditingNode(null); }}
                                      className="flex-1 px-2 py-1 rounded-lg border border-[#E5E7EB] text-[12px] focus:outline-none focus:border-[#6B2D3E]"
                                      autoFocus
                                    />
                                    <button onClick={() => saveEdit(chIdx, lIdx)} className="text-[#3B644E] cursor-pointer"><Save size={12} /></button>
                                    <button onClick={() => setEditingNode(null)} className="text-[#999] cursor-pointer"><X size={12} /></button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-[12px] font-medium flex-1" style={{ color: nColor.text }}>{node.title}</span>
                                    {node.duration && <span className="text-[10px] text-[#999]">{node.duration}</span>}
                                    <button onClick={() => startEdit(node.id, node.title)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#F5F0EB] text-[#999] cursor-pointer">
                                      <Pencil size={10} />
                                    </button>
                                    <button onClick={() => deleteNode(chIdx, lIdx)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] cursor-pointer">
                                      <Trash2 size={10} />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                          <button
                            onClick={() => addLesson(chIdx)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-[#CCCCCC] text-[11px] font-medium text-[#999] hover:border-[#6B2D3E] hover:text-[#6B2D3E] transition-colors w-full cursor-pointer"
                          >
                            <Plus size={12} /> Thêm bài học
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
