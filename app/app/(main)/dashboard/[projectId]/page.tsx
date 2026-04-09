'use client';

import React, { useState, useEffect, use, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, TrendingUp, CalendarDays, Loader2, Map as MapIcon } from 'lucide-react';
import { useOmiLearnStore } from '@/entities/project';
import { projectApi } from '@/entities/project/api/project';
import AIStreamText from '@/shared/ui/AIStreamText';
import { apiFetch } from '@/shared/api/client';

// ─── Types for schedule entries from API ─────────────────────
interface ScheduleEntry {
  id: string;
  user_id: string;
  project_id: string;
  roadmap_node_id: string;
  node_title: string | null;
  color_hex: string;
  starts_at: string;
  ends_at: string;
  is_cancelled: boolean;
  created_at: string;
}

// ─── Constants for the weekly grid ───────────────────────────
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// All 24 hour slots (0h - 23h)
const ALL_HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  return `${String(h).padStart(2, '0')}:00`;
}

const ANALYSIS_TEXT = `Analyzing your progress...

This analysis will be personalized based on your learning data once you start studying the scheduled topics.

Tips:
- Follow the weekly schedule consistently
- Complete each topic before moving to the next
- Use the modification feature in the plan survey to adjust your schedule anytime`;

interface PageProps {
  params: Promise<{ projectId: string }>;
}

// ─── Helper: get Monday of a given week offset (UTC-based) ──
function getWeekMonday(offset: number): Date {
  const now = new Date();
  // getUTCDay: 0=Sunday, 1=Monday...
  const utcDay = now.getUTCDay();
  const diff = utcDay === 0 ? -6 : 1 - utcDay; // days to Monday
  const monday = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + diff + offset * 7,
  ));
  return monday;
}

// ─── Helper: format date for display ────────────────────────
function formatDayDate(monday: Date, dayIndex: number): string {
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + dayIndex);
  return `${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
}

// ─── Helper: check if a date is today (UTC) ─────────────────
function isToday(monday: Date, dayIndex: number): boolean {
  const d = new Date(monday);
  d.setUTCDate(d.getUTCDate() + dayIndex);
  const now = new Date();
  return d.getUTCDate() === now.getUTCDate() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCFullYear() === now.getUTCFullYear();
}

// ─── Build grid from schedule entries ───────────────────────
interface GridCell {
  title: string;
  color: string;
  bg: string;
  nodeId: string;
  span: number; // how many hour rows this entry spans
  entryId: string;    // schedule_entries.id for DnD
  startsAt: string;   // original ISO timestamp
  endsAt: string;     // original ISO timestamp
}

function buildScheduleGrid(
  entries: ScheduleEntry[],
  monday: Date,
): (GridCell | null)[][] {
  // 24 rows (hours 0-23) x 7 columns (days)
  const grid: (GridCell | null)[][] = Array.from({ length: 24 }, () =>
    Array.from({ length: 7 }, () => null),
  );

  // Monday midnight in UTC for comparison
  const mondayUTC = Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate());

  for (const entry of entries) {
    const startDate = new Date(entry.starts_at);
    const endDate = new Date(entry.ends_at);
    const startHour = startDate.getUTCHours();
    const endHour = endDate.getUTCHours();
    const span = endHour - startHour || 1;

    // Find which day column (using UTC dates)
    const entryUTC = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
    const dayDiff = Math.round((entryUTC - mondayUTC) / (1000 * 60 * 60 * 24));

    if (dayDiff < 0 || dayDiff > 6) continue;
    if (startHour < 0 || startHour > 23) continue;

    const bgColor = entry.color_hex + '20';

    // Place on the start hour row
    grid[startHour][dayDiff] = {
      title: entry.node_title || 'Study',
      color: entry.color_hex,
      bg: bgColor,
      nodeId: entry.roadmap_node_id,
      span,
      entryId: entry.id,
      startsAt: entry.starts_at,
      endsAt: entry.ends_at,
    };

    // Mark spanned rows so they can be hidden
    for (let h = startHour + 1; h < startHour + span && h < 24; h++) {
      grid[h][dayDiff] = { title: '__spanned__', color: '', bg: '', nodeId: '', span: 0, entryId: '', startsAt: '', endsAt: '' };
    }
  }

  return grid;
}

// ─── Collect unique subjects for legend ─────────────────────
function getLegendItems(entries: ScheduleEntry[]): { title: string; color: string }[] {
  const seen = new Map<string, string>();
  for (const e of entries) {
    if (e.node_title && !seen.has(e.node_title)) {
      seen.set(e.node_title, e.color_hex);
    }
  }
  return Array.from(seen.entries()).map(([title, color]) => ({ title, color }));
}

export default function ProjectDashboardPage({ params }: PageProps) {
  const { projectId } = use(params);
  const storeProjects = useOmiLearnStore((s) => s.projects);
  const fetchProjects = useOmiLearnStore((s) => s.fetchProjects);

  const [project, setProject] = useState(storeProjects.find((p) => p.id === projectId) ?? null);
  const [loadingProject, setLoadingProject] = useState(!project);
  const projectTitle = project?.title ?? 'Đang tải...';
  const projectDesc = project?.description ?? '';

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisKey, setAnalysisKey] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const router = useRouter();

  // Fetch project from API if not found in store (e.g. after page reload)
  useEffect(() => {
    if (!project) {
      setLoadingProject(true);
      projectApi.get(projectId)
        .then((res) => {
          const p = res.project ?? res;
          setProject({
            id: p.id,
            title: p.name,
            description: p.description ?? '',
            date: new Date(p.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }),
            progress: 0,
          });
        })
        .catch(() => {})
        .finally(() => setLoadingProject(false));
    }
  }, [project, projectId]);

  // Ensure store is populated for other pages
  useEffect(() => {
    if (storeProjects.length === 0) {
      fetchProjects();
    }
  }, [storeProjects.length, fetchProjects]);

  // Sync from store when store updates (e.g. fetchProjects completes)
  useEffect(() => {
    if (!project && storeProjects.length > 0) {
      const found = storeProjects.find((p) => p.id === projectId);
      if (found) setProject(found);
    }
  }, [storeProjects, project, projectId]);

  // ─── Fetch schedule entries from API ──────────────────────
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    setScheduleLoading(true);
    setScheduleError(null);
    apiFetch<ScheduleEntry[]>(`/learning/schedule/${projectId}`)
      .then((data) => {
        setEntries(data);
      })
      .catch((err) => {
        setScheduleError(err?.error || 'Failed to load schedule');
        setEntries([]);
      })
      .finally(() => setScheduleLoading(false));
  }, [projectId]);

  // ─── Build grid for current week ──────────────────────────
  const monday = useMemo(() => getWeekMonday(weekOffset), [weekOffset]);
  const grid = useMemo(() => buildScheduleGrid(entries, monday), [entries, monday]);
  const legendItems = useMemo(() => getLegendItems(entries), [entries]);
  const hasSchedule = entries.length > 0;

  const handleAnalysis = () => {
    if (showAnalysis) setAnalysisKey((k) => k + 1);
    setShowAnalysis(true);
  };

  // ─── Drag & Drop state ──────────────────────────────────────
  interface DraggedEntry {
    entryId: string;
    sourceHour: number;
    sourceDay: number;
    span: number;
    startsAt: string;
    endsAt: string;
  }
  const [draggedEntry, setDraggedEntry] = useState<DraggedEntry | null>(null);
  const [dropTarget, setDropTarget] = useState<{ hour: number; day: number } | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (e: React.DragEvent, cell: GridCell, hour: number, dayIdx: number) => {
      setDraggedEntry({
        entryId: cell.entryId,
        sourceHour: hour,
        sourceDay: dayIdx,
        span: cell.span,
        startsAt: cell.startsAt,
        endsAt: cell.endsAt,
      });
      e.dataTransfer.effectAllowed = 'move';
      if (e.currentTarget instanceof HTMLElement) {
        e.dataTransfer.setDragImage(e.currentTarget, e.currentTarget.offsetWidth / 2, 20);
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent, hour: number, dayIdx: number) => {
      e.preventDefault();
      dragCounter.current++;
      setDropTarget({ hour, day: dayIdx });
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDropTarget(null);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedEntry(null);
    setDropTarget(null);
    dragCounter.current = 0;
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetHour: number, targetDay: number) => {
      e.preventDefault();
      setDropTarget(null);
      dragCounter.current = 0;

      if (!draggedEntry) return;

      const { entryId, sourceHour, sourceDay, span, startsAt, endsAt } = draggedEntry;
      setDraggedEntry(null);

      if (sourceHour === targetHour && sourceDay === targetDay) return;
      if (targetHour + span > 24) return;

      const oldStart = new Date(startsAt);
      const oldEnd = new Date(endsAt);
      const dayShift = targetDay - sourceDay;
      const hourShift = targetHour - sourceHour;
      const newStart = new Date(oldStart.getTime());
      newStart.setUTCDate(newStart.getUTCDate() + dayShift);
      newStart.setUTCHours(newStart.getUTCHours() + hourShift);
      const newEnd = new Date(oldEnd.getTime());
      newEnd.setUTCDate(newEnd.getUTCDate() + dayShift);
      newEnd.setUTCHours(newEnd.getUTCHours() + hourShift);

      const targetCell = grid[targetHour][targetDay];
      const swapEntryId = targetCell && targetCell.title !== '__spanned__' ? targetCell.entryId : undefined;

      const prevEntries = [...entries];
      setEntries((prev) =>
        prev.map((ent) => {
          if (ent.id === entryId) {
            return { ...ent, starts_at: newStart.toISOString(), ends_at: newEnd.toISOString() };
          }
          if (swapEntryId && ent.id === swapEntryId) {
            return { ...ent, starts_at: startsAt, ends_at: endsAt };
          }
          return ent;
        }),
      );

      try {
        await apiFetch('/learning/schedule/move', {
          method: 'PATCH',
          body: JSON.stringify({
            entry_id: entryId,
            new_starts_at: newStart.toISOString(),
            new_ends_at: newEnd.toISOString(),
            swap_with_entry_id: swapEntryId || undefined,
          }),
        });
      } catch (err) {
        console.error('[DnD] API error, rolling back:', err);
        setEntries(prevEntries);
      }
    },
    [draggedEntry, grid, entries],
  );

  // ─── Vertical Resize (drag bottom edge to change duration) ──
  const resizeState = useRef<{
    entryId: string;
    startsAt: string;
    endsAt: string;
    startY: number;
    originalSpan: number;
    hour: number;
    day: number;
  } | null>(null);
  const [resizingEntryId, setResizingEntryId] = useState<string | null>(null);
  const [resizePreviewSpan, setResizePreviewSpan] = useState<number | null>(null);

  const ROW_HEIGHT = 48; // px per hour row — must match gridTemplateRows

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, cell: GridCell, hour: number, dayIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      resizeState.current = {
        entryId: cell.entryId,
        startsAt: cell.startsAt,
        endsAt: cell.endsAt,
        startY: e.clientY,
        originalSpan: cell.span,
        hour,
        day: dayIdx,
      };
      setResizingEntryId(cell.entryId);
      setResizePreviewSpan(cell.span);
    },
    [],
  );

  // Global mousemove/mouseup listeners for resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rs = resizeState.current;
      if (!rs) return;
      const dy = e.clientY - rs.startY;
      const deltaRows = Math.round(dy / ROW_HEIGHT);
      const newSpan = Math.max(1, Math.min(rs.originalSpan + deltaRows, 24 - rs.hour));
      setResizePreviewSpan(newSpan);
    };

    const handleMouseUp = async () => {
      const rs = resizeState.current;
      if (!rs) return;
      const finalSpan = resizePreviewSpan ?? rs.originalSpan;
      resizeState.current = null;
      setResizingEntryId(null);
      setResizePreviewSpan(null);

      if (finalSpan === rs.originalSpan) return; // no change

      // Build new ends_at
      const oldEnd = new Date(rs.endsAt);
      const oldStart = new Date(rs.startsAt);
      const newEnd = new Date(oldStart.getTime());
      newEnd.setUTCHours(oldStart.getUTCHours() + finalSpan);
      newEnd.setUTCMinutes(oldEnd.getUTCMinutes());
      newEnd.setUTCSeconds(0);

      // Optimistic update
      const prevEntries = entries;
      setEntries((prev) =>
        prev.map((ent) =>
          ent.id === rs.entryId
            ? { ...ent, ends_at: newEnd.toISOString() }
            : ent
        ),
      );

      // Call API (reuse move endpoint — same entry, same starts_at, new ends_at)
      try {
        await apiFetch('/learning/schedule/move', {
          method: 'PATCH',
          body: JSON.stringify({
            entry_id: rs.entryId,
            new_starts_at: rs.startsAt,
            new_ends_at: newEnd.toISOString(),
          }),
        });
      } catch (err) {
        console.error('[Resize] API error, rolling back:', err);
        setEntries(prevEntries);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizePreviewSpan, entries]);

  if (loadingProject) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#6B2D3E]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8">

      {/* ── Hero Section ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-10">
        <div className="flex-1">
          <h1 className="text-3xl md:text-[48px] font-black text-[#1A1A1A] leading-[1.1] tracking-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {projectTitle}
          </h1>
          <p className="text-[#666666] text-[15px] mt-4 max-w-[480px] leading-relaxed">
            {projectDesc}
          </p>
          <Link
            href={`/roadmap?project=${projectId}`}
            className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-all"
          >
            <MapIcon size={15} />
            Xem Roadmap
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex-shrink-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dashboard/background.svg"
            alt="Project progress"
            className="w-[280px] md:w-[356px] h-auto"
          />
        </motion.div>
      </div>

      {/* ── AI Analytics Grid ────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-5 h-5 rounded bg-[#333] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="5" width="2" height="6" rx="0.5" fill="white"/><rect x="5" y="3" width="2" height="8" rx="0.5" fill="white"/><rect x="9" y="1" width="2" height="10" rx="0.5" fill="white"/></svg>
          </div>
          <h2 className="text-[20px] font-bold text-[#1A1A1A]">AI Analytics Grid</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {[
            { src: '/dashboard/analysis.svg', alt: 'Analysis' },
            { src: '/dashboard/synthesis.svg', alt: 'Synthesis' },
            { src: '/dashboard/critique.svg', alt: 'Critique' },
            { src: '/dashboard/interviewing.svg', alt: 'Interviewing' },
          ].map((card, i) => (
            <motion.div
              key={card.alt}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
              className="cursor-default"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt={card.alt}
                className="w-full h-auto"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Weekly Schedule ──────────────────────────────────── */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl overflow-hidden mb-8">
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#333333]">
          <h2 className="font-black text-[#2D2D2D] text-lg">Weekly Schedule</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#333333] hover:bg-[#2D2D2D] hover:text-white text-[#2D2D2D] transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-semibold text-[#5A5C58] min-w-[80px] text-center">
              {formatDayDate(monday, 0)} - {formatDayDate(monday, 6)}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#333333] hover:bg-[#2D2D2D] hover:text-white text-[#2D2D2D] transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {scheduleLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-3 border-[#7d3f55] border-t-transparent animate-spin" />
          </div>
        ) : !hasSchedule ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <CalendarDays size={48} className="text-gray-300" />
            <div>
              <p className="font-bold text-[#2D2D2D] text-base">No schedule yet</p>
              <p className="text-sm text-[#5A5C58] mt-1">
                Go to your roadmap and click &quot;Create Study Plan&quot; to generate a personalized schedule.
              </p>
            </div>
            <Link
              href={`/roadmap?project=${projectId}`}
              className="mt-2 flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-all"
            >
              <CalendarDays size={15} />
              Go to Roadmap
            </Link>
          </div>
        ) : (
          <>
            {/* Day headers */}
            <div className="grid border-b-2 border-[#333333]" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
              <div className="px-1 py-3 text-center border-r-2 border-[#333333]" />
              {DAY_LABELS.map((label, i) => {
                const today = isToday(monday, i);
                const weekend = i >= 5;
                return (
                  <div
                    key={label}
                    className={`px-1 py-2.5 text-center border-r border-[#E5E7EB] last:border-r-0 ${
                      weekend ? 'bg-[#FEE2E2]' : today ? 'bg-[#FFF9E6]' : ''
                    }`}
                  >
                    <div className={`text-[10px] font-black uppercase tracking-wider ${weekend ? 'text-[#DC2626]' : 'text-[#2D2D2D]'}`}>
                      {label}
                    </div>
                    <div className={`text-xs font-bold mt-0.5 ${weekend ? 'text-[#DC2626]' : 'text-[#5A5C58]'}`}>
                      {formatDayDate(monday, i)}
                    </div>
                    {today && (
                      <div className="mt-1 flex items-center justify-center">
                        <div className="bg-[#F5C542] text-[#2D2D2D] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          TODAY
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time grid — scrollable 24h, single CSS grid for proper row spanning */}
            <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
              <div
                className="grid"
                style={{
                  gridTemplateColumns: '56px repeat(7, 1fr)',
                  gridTemplateRows: `repeat(24, ${ROW_HEIGHT}px)`,
                }}
              >
                {ALL_HOURS.map((hour) => (
                  <React.Fragment key={hour}>
                    {/* Hour label — column 1 */}
                    <div
                      className="flex items-center justify-end pr-1.5 border-r-2 border-[#333333] border-b border-b-[#E5E7EB]"
                      style={{ gridColumn: 1, gridRow: hour + 1 }}
                    >
                      <span className="text-[9px] font-bold text-[#5A5C58] text-right leading-tight">
                        {formatHour(hour)}
                      </span>
                    </div>

                    {/* 7 day columns */}
                    {DAY_LABELS.map((_, colIdx) => {
                      const cell = grid[hour][colIdx];
                      const today = isToday(monday, colIdx);
                      const isSpanned = cell && cell.title === '__spanned__';
                      const isDropHere = dropTarget?.hour === hour && dropTarget?.day === colIdx;
                      const isDragging = !!draggedEntry;

                      // Spanned cells: part of a multi-hour entry rendered above.
                      // Set pointer-events:none so the entry button above receives all mouse events.
                      if (isSpanned) {
                        return (
                          <div
                            key={colIdx}
                            className={`border-r border-[#E5E7EB] last:border-r-0 border-b border-b-[#E5E7EB] ${today ? 'bg-[#FFFBEB]/60' : ''}`}
                            style={{
                              gridColumn: colIdx + 2,
                              gridRow: hour + 1,
                              pointerEvents: 'none',
                            }}
                          />
                        );
                      }

                      // Active span (accounts for live resize preview)
                      const isResizingThis = cell && resizingEntryId === cell.entryId;
                      const activeSpan = isResizingThis && resizePreviewSpan !== null
                        ? resizePreviewSpan
                        : (cell ? cell.span : 1);

                      return (
                        <div
                          key={colIdx}
                          className={`relative p-0.5 border-r border-[#E5E7EB] last:border-r-0 border-b border-b-[#E5E7EB] transition-colors duration-150 ${
                            today ? 'bg-[#FFFBEB]/60' : ''
                          } ${isDropHere && isDragging ? 'bg-blue-100 ring-2 ring-inset ring-blue-400' : ''}`}
                          style={{
                            gridColumn: colIdx + 2,
                            gridRow: cell
                              ? `${hour + 1} / span ${activeSpan}`
                              : hour + 1,
                            zIndex: cell ? 2 : 0,
                          }}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnter(e, hour, colIdx)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, hour, colIdx)}
                        >
                          {cell && (
                            <button
                              draggable
                              onDragStart={(e) => handleDragStart(e, cell, hour, colIdx)}
                              onDragEnd={handleDragEnd}
                              onClick={() => {
                                router.push(`/learn?unit=${cell.nodeId}&project=${projectId}`);
                              }}
                              className="px-1 py-1 rounded-lg border-2 text-center w-full h-full transition-all hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col items-center justify-center"
                              style={{
                                borderColor: cell.color,
                                backgroundColor: cell.bg,
                                opacity: draggedEntry?.entryId === cell.entryId ? 0.4 : 1,
                              }}
                            >
                              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wide leading-tight block" style={{ color: cell.color }}>
                                {cell.title.length > 12 ? cell.title.slice(0, 11) + '\u2026' : cell.title}
                              </span>
                              <span className="text-[7px] font-semibold block mt-0.5" style={{ color: cell.color, opacity: 0.7 }}>
                                {formatHour(hour)}-{formatHour(hour + activeSpan)}
                              </span>
                            </button>
                          )}
                          {/* Resize handle at the bottom edge */}
                          {cell && (
                            <div
                              onMouseDown={(e) => handleResizeStart(e, cell, hour, colIdx)}
                              className="absolute bottom-0 left-1 right-1 h-2 cursor-row-resize group flex items-center justify-center z-10"
                              title="Drag to resize"
                            >
                              <div className="w-8 h-[3px] rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Legend + "Continue learning" */}
            <div className="px-5 py-3 border-t-2 border-[#333333] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                {legendItems.map((item) => (
                  <div key={item.title} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-semibold" style={{ color: item.color }}>
                      {item.title.length > 20 ? item.title.slice(0, 19) + '\u2026' : item.title}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/learn?project=${projectId}`}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2D2D2D] text-white text-xs font-semibold hover:bg-[#1a1a1a] active:scale-95 transition-all"
              >
                Continue learning {'\u2192'}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── Deep Analysis ────────────────────────────────────── */}
      <div className="bg-[#F1F1EC] border-2 border-[#333333] rounded-2xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-black text-[#2D2D2D] text-lg flex items-center gap-2">
            <TrendingUp size={20} className="text-[#6B2D3E]" />
            Deep Analysis
          </h2>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAnalysis}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#2D2D2D] text-white text-sm font-semibold hover:bg-[#1a1a1a] transition-colors cursor-pointer"
          >
            {showAnalysis ? 'Re-analyze' : 'Deep Analysis'}
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {showAnalysis ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-4 bg-white border-2 border-[#CCCCCC] rounded-xl p-5">
                <AIStreamText
                  key={analysisKey}
                  text={ANALYSIS_TEXT}
                  speed={18}
                  className="text-sm text-[#2D2D2D] leading-relaxed whitespace-pre-line"
                />
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-[#5A5C58] mt-2"
            >
              Click &ldquo;Deep Analysis&rdquo; to get AI-powered insights on your learning progress and personalized recommendations.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
