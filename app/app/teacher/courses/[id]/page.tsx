'use client';

import { useState, use, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo, FileText, Book, Trash2, Sparkles, ArrowLeft, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { teacherApi, TeacherCourse, CourseUnit, CourseStudent } from '@/entities/teacher/api';
import { RoadmapNode, RoadmapEdge, defaultRoadmapNodes, defaultRoadmapEdges } from '@/entities/node';
import dynamic from 'next/dynamic';

const RoadmapGraph = dynamic(() => import('@/widgets/roadmap-graph/ui/RoadmapGraph'), { ssr: false });

/* ── Types ─── */
interface Resource {
  id: string;
  name: string;
  type: 'video' | 'pdf' | 'book';
  size: string;
}

const FILE_ICONS: Record<Resource['type'], typeof FileVideo> = { video: FileVideo, pdf: FileText, book: Book };
const FILE_COLORS: Record<Resource['type'], { bg: string; text: string }> = {
  video: { bg: '#FECDD3', text: '#884856' },
  pdf: { bg: '#FEF3C7', text: '#6A5B0C' },
  book: { bg: '#D1FAE5', text: '#3B644E' },
};

interface PageProps { params: Promise<{ id: string }> }

export default function TeacherCourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [course, setCourse] = useState<TeacherCourse | null>(null);
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'roadmap' | 'students'>('resources');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(false);
  const [nodes, setNodes] = useState<RoadmapNode[]>(defaultRoadmapNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(defaultRoadmapEdges);

  // Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const [courseRes, studentsRes] = await Promise.all([
          teacherApi.getCourse(id),
          teacherApi.getStudents(id).catch(() => ({ students: [] as CourseStudent[] })),
        ]);
        setCourse(courseRes.course);
        setStudents(studentsRes.students ?? []);
      } catch {
        setError('Không thể tải thông tin khóa học.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const handleUpload = () => {
    setResources(prev => [...prev, {
      id: `r${Date.now()}`,
      name: `Tài liệu mới ${prev.length + 1}.pdf`,
      type: 'pdf' as const,
      size: `${(Math.random() * 50 + 1).toFixed(1)} MB`,
    }]);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setRoadmapGenerated(true);
      setActiveTab('roadmap');
    }, 2500);
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;
    setInviteLoading(true);
    try {
      // Try to enroll by email — backend may handle lookup
      // teacherApi.enrollStudent expects userId, so we optimistically add
      setStudents(prev => [...prev, {
        id: String(Date.now()),
        user_id: '',
        name: inviteEmail.split('@')[0],
        email: inviteEmail.trim(),
        progress: 0,
        enrolled_at: new Date().toISOString(),
        status: 'pending',
      }]);
      setInviteEmail('');
    } catch {
      setError('Không thể mời học viên.');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
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
        <Link href="/teacher/courses" className="flex items-center gap-1 text-[12px] text-[#6B2D3E] font-medium mb-4 hover:underline">
          <ArrowLeft size={14} /> Khóa học
        </Link>
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error ?? 'Không tìm thấy khóa học.'}</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/teacher/courses" className="flex items-center gap-1 text-[12px] text-[#6B2D3E] font-medium mb-2 hover:underline">
          <ArrowLeft size={14} /> Khóa học
        </Link>
        <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          {course.title}
        </h1>
        <p className="text-[13px] text-[#5A5C58]">{course.student_count ?? students.length} học viên · {course.unit_count ?? 0} bài học</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b-2 border-[#E5E7EB]">
        {([
          { key: 'resources' as const, label: '📁 Tài nguyên' },
          { key: 'roadmap' as const, label: '🗺️ Roadmap' },
          { key: 'students' as const, label: '👥 Học viên' },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-[13px] font-semibold border-b-2 -mb-[2px] transition-colors cursor-pointer ${
              activeTab === tab.key ? 'border-[#6B2D3E] text-[#6B2D3E]' : 'border-transparent text-[#5A5C58] hover:text-[#2D2D2D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Resources ──────────────────────────────── */}
      {activeTab === 'resources' && (
        <div>
          <div onClick={handleUpload} className="border-2 border-dashed border-[#CCC] rounded-2xl p-8 text-center mb-5 hover:border-[#6B2D3E] hover:bg-[#FAF9F7] transition-all cursor-pointer group">
            <Upload size={28} className="mx-auto text-[#999] group-hover:text-[#6B2D3E] mb-2" />
            <p className="text-[14px] font-semibold text-[#5A5C58] group-hover:text-[#6B2D3E]">Kéo thả hoặc nhấn để upload</p>
            <p className="text-[11px] text-[#999] mt-1">Video, PDF, sách — tối đa 500MB/file</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-[#5A5C58]">{resources.length} tài nguyên</p>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B2D3E] text-white text-[12px] font-semibold hover:bg-[#5A2534] disabled:opacity-60 cursor-pointer">
              <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Đang tạo roadmap...' : 'AI Tạo Roadmap'}
            </button>
          </div>

          <div className="space-y-2">
            {resources.map((r, i) => {
              const Icon = FILE_ICONS[r.type] ?? FileText;
              const c = FILE_COLORS[r.type] ?? FILE_COLORS.pdf;
              return (
                <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 group hover:shadow-sm transition-all">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: c.bg }}>
                    <Icon size={16} style={{ color: c.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#2D2D2D] truncate">{r.name}</p>
                    <p className="text-[10px] text-[#999]">{r.size}</p>
                  </div>
                  <button onClick={() => setResources(prev => prev.filter(x => x.id !== r.id))}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Roadmap ────────────────────────────────── */}
      {activeTab === 'roadmap' && (
        <div>
          {roadmapGenerated ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-[#5A5C58]">Kéo thả để sắp xếp · Chuột phải để sửa/xóa · Click &ldquo;+&rdquo; để thêm</p>
                <button onClick={handleGenerate} disabled={isGenerating}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#6B2D3E] hover:bg-[#F5F0EB] cursor-pointer">
                  <Sparkles size={12} /> Tạo lại
                </button>
              </div>
              <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-6 min-h-[550px] relative overflow-hidden">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: 'radial-gradient(circle, #CCCCCC 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }} />
                <div className="relative z-10">
                  <RoadmapGraph
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={setNodes}
                    onEdgesChange={setEdges}
                    onNodeClick={() => {}}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-12 text-center">
              <Sparkles size={32} className="mx-auto text-[#CCC] mb-3" />
              <p className="text-[14px] text-[#5A5C58]">Chưa có roadmap. Upload tài nguyên rồi nhấn <b>&ldquo;AI Tạo Roadmap&rdquo;</b></p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Students ────────────────────────────── */}
      {activeTab === 'students' && (
        <div>
          <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-5 mb-6">
            <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
              <Mail size={16} className="text-[#6B2D3E]" /> Mời học viên qua email
            </h3>
            <div className="flex items-center gap-3">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
                placeholder="email@example.com"
                className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-[#E5E7EB] text-[13px] focus:outline-none focus:border-[#6B2D3E]"
              />
              <button onClick={handleInvite} disabled={inviteLoading} className="px-5 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer disabled:opacity-60 flex items-center gap-2">
                {inviteLoading && <Loader2 size={12} className="animate-spin" />}
                Gửi lời mời
              </button>
            </div>
          </div>

          <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-3">{students.length} học viên</h3>
          <div className="space-y-2">
            {students.map((student, i) => (
              <motion.div key={student.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#6B2D3E]">
                      {(student.name || student.email).slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#2D2D2D]">{student.name || student.email}</p>
                    <p className="text-[10px] text-[#999]">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <div className="h-full rounded-full bg-[#3B644E]" style={{ width: `${student.progress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#3B644E]">{student.progress}%</span>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${student.status === 'active' ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEF3C7] text-[#6A5B0C]'}`}>
                    {student.status === 'active' ? 'Hoạt động' : 'Chờ'}
                  </span>
                  <button onClick={() => handleRemoveStudent(student.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
            {students.length === 0 && (
              <div className="text-center py-8 text-[#999] text-[13px]">Chưa có học viên nào</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
