'use client';

import { useState, use } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileVideo, FileText, Book, Trash2, Sparkles, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
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

/* ── Mock ─── */
const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', name: 'Bài giảng 01 - Giới thiệu HĐH.mp4', type: 'video', size: '245 MB' },
  { id: 'r2', name: 'Bài giảng 02 - Quản lý Tiến trình.mp4', type: 'video', size: '312 MB' },
  { id: 'r3', name: 'Slide - Kiến trúc Hệ thống.pdf', type: 'pdf', size: '8.2 MB' },
  { id: 'r4', name: 'Sách - Operating Systems Concepts.pdf', type: 'book', size: '45 MB' },
  { id: 'r5', name: 'Bài tập thực hành Linux.pdf', type: 'pdf', size: '2.1 MB' },
  { id: 'r6', name: 'Bài giảng 03 - Bộ nhớ & File System.mp4', type: 'video', size: '287 MB' },
];

const FILE_ICONS: Record<string, typeof FileVideo> = { video: FileVideo, pdf: FileText, book: Book };
const FILE_COLORS: Record<string, { bg: string; text: string }> = {
  video: { bg: '#FECDD3', text: '#884856' },
  pdf: { bg: '#FEF3C7', text: '#6A5B0C' },
  book: { bg: '#D1FAE5', text: '#3B644E' },
};

interface PageProps { params: Promise<{ id: string }> }

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [activeTab, setActiveTab] = useState<'resources' | 'roadmap' | 'students'>('resources');
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmapGenerated, setRoadmapGenerated] = useState(true);

  // Reuse existing roadmap data
  const [nodes, setNodes] = useState<RoadmapNode[]>(defaultRoadmapNodes);
  const [edges, setEdges] = useState<RoadmapEdge[]>(defaultRoadmapEdges);

  // Invite
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([
    'an.nguyen@email.com', 'binh.tran@email.com', 'cuong.le@email.com',
  ]);

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

  const handleInvite = () => {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) return;
    setInvitedEmails(prev => [...prev, inviteEmail.trim()]);
    setInviteEmail('');
  };

  const handleRemoveInvite = (email: string) => {
    setInvitedEmails(prev => prev.filter(e => e !== email));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/teacher/courses" className="flex items-center gap-1 text-[12px] text-[#6B2D3E] font-medium mb-2 hover:underline">
          <ArrowLeft size={14} /> Khóa học
        </Link>
        <h1 className="text-[28px] font-black text-[#1A1A1A]" style={{ fontFamily: 'Georgia, serif' }}>
          Hệ Điều Hành và Linux
        </h1>
        <p className="text-[13px] text-[#5A5C58]">342 học viên · 20 bài học</p>
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
          {/* Upload zone */}
          <div onClick={handleUpload} className="border-2 border-dashed border-[#CCC] rounded-2xl p-8 text-center mb-5 hover:border-[#6B2D3E] hover:bg-[#FAF9F7] transition-all cursor-pointer group">
            <Upload size={28} className="mx-auto text-[#999] group-hover:text-[#6B2D3E] mb-2" />
            <p className="text-[14px] font-semibold text-[#5A5C58] group-hover:text-[#6B2D3E]">Kéo thả hoặc nhấn để upload</p>
            <p className="text-[11px] text-[#999] mt-1">Video, PDF, sách — tối đa 500MB/file</p>
          </div>

          {/* Generate button */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[13px] text-[#5A5C58]">{resources.length} tài nguyên</p>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6B2D3E] text-white text-[12px] font-semibold hover:bg-[#5A2534] disabled:opacity-60 cursor-pointer">
              <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Đang tạo roadmap...' : 'AI Tạo Roadmap'}
            </button>
          </div>

          {/* File list */}
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

      {/* ── TAB: Roadmap (reuse mindmap) ────────────────── */}
      {activeTab === 'roadmap' && (
        <div>
          {roadmapGenerated ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] text-[#5A5C58]">Kéo thả để sắp xếp · Chuột phải để sửa/xóa · Click "+" để thêm</p>
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
                    onNodeClick={() => {}} // no navigation in teacher view
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white border-2 border-[#E5E7EB] rounded-2xl p-12 text-center">
              <Sparkles size={32} className="mx-auto text-[#CCC] mb-3" />
              <p className="text-[14px] text-[#5A5C58]">Chưa có roadmap. Upload tài nguyên rồi nhấn <b>"AI Tạo Roadmap"</b></p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Students (invite via email) ────────────── */}
      {activeTab === 'students' && (
        <div>
          {/* Invite box */}
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
              <button onClick={handleInvite} className="px-5 py-2.5 rounded-xl bg-[#6B2D3E] text-white text-[13px] font-semibold hover:bg-[#5A2534] cursor-pointer">
                Gửi lời mời
              </button>
            </div>
          </div>

          {/* Student list */}
          <h3 className="text-[14px] font-bold text-[#1A1A1A] mb-3">{invitedEmails.length} học viên được mời</h3>
          <div className="space-y-2">
            {invitedEmails.map((email, i) => (
              <motion.div key={email} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#6B2D3E]">
                      {email.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#2D2D2D]">{email}</p>
                    <p className="text-[10px] text-[#999]">{i < 2 ? 'Đã tham gia' : 'Đang chờ'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${i < 2 ? 'bg-[#D1FAE5] text-[#3B644E]' : 'bg-[#FEF3C7] text-[#6A5B0C]'}`}>
                    {i < 2 ? 'Hoạt động' : 'Chờ xác nhận'}
                  </span>
                  <button onClick={() => handleRemoveInvite(email)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-[#FEE2E2] text-[#DC2626] opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
