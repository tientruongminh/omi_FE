'use client';

import { useState } from 'react';
import { Loader2, Search, ExternalLink, BookOpen, Sparkles } from 'lucide-react';
import { materialSearchApi, type MaterialSearchResult } from '@/entities/material-search/api';

function resultUrl(item: MaterialSearchResult) {
  return item.url || item.link || '';
}

export default function MaterialSearchPage() {
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('');
  const [language, setLanguage] = useState<'vi' | 'en' | 'both'>('both');
  const [maxResults, setMaxResults] = useState(6);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [results, setResults] = useState<MaterialSearchResult[]>([]);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setError('');
    setSummary('');
    setResults([]);
    try {
      const res = await materialSearchApi.search({
        query: query.trim(),
        topic: query.trim(),
        course: course.trim() || undefined,
        language,
        learnerLevel: 'intermediate',
        maxResults,
        preferredTypes: ['video', 'article', 'pdf', 'course', 'github'],
      });
      const rows = res.results || res.materials || [];
      setResults(rows);
      setSummary(res.summary || res.answer || '');
      if (res.error) setError(res.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tìm tài liệu lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#F5F0EB] px-6 py-8 text-[#1A1A1A]">
      <section className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#6B2D3E]"><Sparkles size={14} /> AI Material Search</p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black">Tìm tài liệu học tập bằng AI</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5A5C58]">Nhập chủ đề/môn học, Omilearn sẽ dùng OpenClaw bridge để tìm tài liệu phù hợp: bài viết, video, PDF, course hoặc repo tham khảo.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border-2 border-[#333] bg-white p-5 shadow-[5px_5px_0_#333]">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_120px_110px]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void search(); }}
                placeholder="VD: machine learning cơ bản, giải tích 1, operating system scheduling..."
                className="w-full rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFAF8] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#6B2D3E]"
              />
            </div>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Môn học (tuỳ chọn)"
              className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFAF8] px-4 py-3 text-sm outline-none focus:border-[#6B2D3E]"
            />
            <select value={language} onChange={(e) => setLanguage(e.target.value as 'vi' | 'en' | 'both')} className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFAF8] px-3 py-3 text-sm outline-none focus:border-[#6B2D3E]">
              <option value="both">VI + EN</option>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
            <input type="number" min={1} max={10} value={maxResults} onChange={(e) => setMaxResults(Math.max(1, Math.min(10, Number(e.target.value) || 6)))} className="rounded-2xl border-2 border-[#E5E7EB] bg-[#FAFAF8] px-3 py-3 text-sm outline-none focus:border-[#6B2D3E]" />
          </div>
          <button onClick={search} disabled={!query.trim() || loading} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#6B2D3E] px-5 py-3 text-sm font-black text-white disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Tìm tài liệu
          </button>
        </div>

        {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
        {summary && <div className="mt-5 rounded-2xl border-2 border-[#E5E7EB] bg-white p-5 text-sm leading-7 text-[#2D2D2D]"><b>AI summary:</b><br />{summary}</div>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((item, index) => {
            const url = resultUrl(item);
            return (
              <article key={`${url}-${index}`} className="rounded-3xl border-2 border-[#E5E7EB] bg-white p-5 hover:border-[#6B2D3E] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#F5F0EB] text-[#6B2D3E]"><BookOpen size={17} /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-black text-[#111827]">{item.title || item.source || `Tài liệu ${index + 1}`}</h2>
                      {item.type && <span className="rounded-full bg-[#EEF2FF] px-2 py-1 text-[10px] font-black uppercase text-[#4338CA]">{item.type}</span>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[#5A5C58]">{item.description || item.snippet || item.why || 'Không có mô tả.'}</p>
                    {url && <a href={url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-black text-[#6B2D3E]">Mở tài liệu <ExternalLink size={13} /></a>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
