'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { AIStreamText } from '@/shared/ui/AIStreamText';
import { useOmiLearnStore } from '@/entities/project';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/shared/api/client';

interface GenerateScheduleResponse {
  plan_summary: string;
  entries: unknown[];
  total_entries: number;
}

const QUESTIONS = [
  {
    key: 0,
    icon: '\u23F3',
    label: 'How long do you want to study this knowledge?',
    placeholder: 'e.g. 30 days, 2 months, 8 weeks...',
  },
  {
    key: 1,
    icon: '\uD83C\uDFAF',
    label: 'What level of knowledge do you want to achieve?\n(master, medium, ...)',
    placeholder: 'e.g. Master all concepts, Medium understanding...',
  },
  {
    key: 2,
    icon: '\u270F\uFE0F',
    label: 'What are your wishes?',
    placeholder: 'e.g. Focus more on practice, study in the evening...',
  },
];

type Screen = 'survey' | 'generating' | 'done';

const slide = {
  enter:  { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0 },
  exit:   { opacity: 0, x: -32 },
};

interface PlanSurveyModalProps {
  onClose: () => void;
  projectId?: string;
}

export function PlanSurveyModal({ onClose, projectId }: PlanSurveyModalProps) {
  const router = useRouter();
  const setPlanComplete = useOmiLearnStore((s) => s.setPlanComplete);

  const [screen, setScreen]     = useState<Screen>('survey');
  const [answers, setAnswers]   = useState(['', '', '']);
  const [streamKey, setStreamKey] = useState(0);
  const [calendarConnected, setCalendarConnected]   = useState(false);
  const [calendarConnecting, setCalendarConnecting] = useState(false);
  const [modifyInput, setModifyInput]   = useState('');
  const [planText, setPlanText]         = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Check Google Calendar connection status on mount ─────
  useEffect(() => {
    apiFetch<{ connected: boolean }>('/learning/calendar/status')
      .then((res) => {
        if (res.connected) setCalendarConnected(true);
      })
      .catch(() => {}); // ignore if not connected
  }, []);

  // ─── Listen for Google Calendar OAuth callback ────────────
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data?.type === 'google-calendar-connected'
      ) {
        setCalendarConnected(true);
        setCalendarConnecting(false);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const unlockedUpTo = answers.reduce((acc, a, i) => {
    if (i === acc && a.trim()) return acc + 1;
    return acc;
  }, 0);

  const setAnswer = (index: number, val: string) => {
    const next = [...answers];
    next[index] = val;
    setAnswers(next);
  };

  const canSubmit = answers[2].trim().length > 0;

  const handleSave = async () => {
    if (!projectId) {
      setError('Project ID is missing');
      return;
    }

    setScreen('generating');
    setError(null);

    try {
      const response = await apiFetch<GenerateScheduleResponse>('/schedules/generate', {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          study_duration_days: answers[0],
          target_mastery: answers[1],
          wishes_text: answers[2],
        }),
      });

      setPlanText(response.plan_summary);
      setScreen('done');
    } catch (err: unknown) {
      const apiErr = err as { error?: string };
      setError(apiErr?.error || 'Failed to generate schedule. Please try again.');
      setScreen('survey');
    }
  };

  const handleConnectCalendar = async () => {
    setCalendarConnecting(true);
    try {
      const { url } = await apiFetch<{ url: string }>('/learning/calendar/auth-url');
      // Open Google OAuth consent in popup
      const popup = window.open(url, 'google-calendar-auth', 'width=500,height=700,popup=yes');
      // If popup blocked, fall back to redirect
      if (!popup) {
        window.location.href = url;
      }
    } catch {
      setCalendarConnecting(false);
      setError('Failed to connect Google Calendar. Please try again.');
    }
  };

  const handleModify = async () => {
    if (!modifyInput.trim() || !projectId) return;
    setIsRegenerating(true);
    const mod = modifyInput.trim();
    setModifyInput('');

    try {
      const response = await apiFetch<GenerateScheduleResponse>('/schedules/generate', {
        method: 'POST',
        body: JSON.stringify({
          project_id: projectId,
          study_duration_days: answers[0],
          target_mastery: answers[1],
          wishes_text: `${answers[2]}\n\nAdditional request: ${mod}`,
        }),
      });

      setPlanText(response.plan_summary);
      setStreamKey((k) => k + 1);
    } catch {
      setPlanText((prev) => prev + `\n\n(Failed to regenerate. Please try again.)`);
      setStreamKey((k) => k + 1);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleComplete = () => {
    setPlanComplete();
    onClose();
    if (projectId) {
      router.push(`/dashboard/${projectId}`);
    } else {
      router.push('/dashboard');
    }
  };

  const streamDone = useCallback(() => {}, []);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 16 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="relative w-full max-w-lg"
        style={{ maxHeight: '92vh' }}
      >
        {/* image.png as the card background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/image.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          style={{ objectFit: 'fill', zIndex: 0 }}
        />

        {/* Content layer on top of image */}
        <div className="relative flex flex-col" style={{ zIndex: 1, maxHeight: '92vh' }}>
          {/* Top label */}
          <div className="pt-6 flex justify-center">
            <span
              className="text-[11px] font-black uppercase tracking-widest px-5 py-1.5 rounded-full"
              style={{
                background: '#F5DF7A',
                border: '2px solid #1a1a1a',
                color: '#1a1a1a',
                boxShadow: '2px 2px 0px #1a1a1a',
              }}
            >
              {'\uD83D\uDCCB'} Plan your learning journey
            </span>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto px-8 pb-10 pt-5" style={{ maxHeight: 'calc(92vh - 60px)' }}>
            <AnimatePresence mode="wait">

              {/* ── Survey screen ── */}
              {screen === 'survey' && (
                <motion.div
                  key="survey"
                  variants={slide} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.22 }}
                >
                  <h2 className="text-3xl font-black text-[#1a1a1a] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    Quick Check-in
                  </h2>
                  <p className="text-sm text-center mb-7" style={{ color: '#6b7280' }}>
                    Tell us about your dreams!
                  </p>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}>
                      {error}
                    </div>
                  )}

                  <div className="space-y-5">
                    {QUESTIONS.map((q, i) => {
                      const locked = i > unlockedUpTo;
                      return (
                        <motion.div
                          key={q.key}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: locked ? 0.4 : 1, y: 0 }}
                          transition={{ duration: 0.28, delay: i * 0.06 }}
                        >
                          <div className="mb-2 flex items-start gap-2.5">
                            <span className="text-xl mt-0.5 leading-none">{q.icon}</span>
                            <p className="font-bold text-[#1a1a1a] text-[15px] leading-snug whitespace-pre-line">
                              {q.label}
                            </p>
                          </div>
                          <textarea
                            value={answers[i]}
                            onChange={(e) => !locked && setAnswer(i, e.target.value)}
                            placeholder={q.placeholder}
                            rows={3}
                            disabled={locked}
                            className="w-full px-4 py-3 text-sm text-[#1a1a1a] outline-none resize-none transition-all placeholder:text-gray-400"
                            style={{
                              background: 'rgba(255,255,255,0.7)',
                              border: '1.5px solid rgba(0,0,0,0.15)',
                              borderRadius: '12px',
                              lineHeight: 1.6,
                              cursor: locked ? 'not-allowed' : 'text',
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Sync with calendar */}
                  <div
                    className="mt-5 flex items-center justify-between gap-4 px-4 py-3 rounded-2xl"
                    style={{
                      border: '1.5px dashed rgba(0,0,0,0.25)',
                      background: 'rgba(255,255,255,0.55)',
                    }}
                  >
                    <div>
                      <p className="font-bold text-[#1a1a1a] text-sm">Sync with your schedule</p>
                      <p className="text-xs text-gray-500">Don&apos;t miss a single learning session.</p>
                    </div>
                    <button
                      onClick={handleConnectCalendar}
                      disabled={calendarConnecting || calendarConnected}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#1a1a1a] transition-all cursor-pointer shrink-0"
                      style={{
                        background: calendarConnected ? '#d1fae5' : 'rgba(255,255,255,0.9)',
                        border: '1.5px solid #1a1a1a',
                        borderRadius: '999px',
                        boxShadow: '2px 2px 0px #1a1a1a',
                      }}
                    >
                      {calendarConnecting ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#1a1a1a] border-t-transparent animate-spin" />
                      ) : (
                        <CalendarDays size={15} />
                      )}
                      {calendarConnected ? 'Connected \u2713' : 'Connect Calendar'}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-between">
                    <button
                      onClick={onClose}
                      className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#1a1a1a] transition-colors cursor-pointer"
                    >
                      Skip for now
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSave}
                      disabled={!canSubmit}
                      className="flex items-center gap-2 px-7 py-3 font-bold text-white text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: '#7d3f55',
                        border: '2px solid #1a1a1a',
                        borderRadius: '14px',
                        boxShadow: '3px 3px 0px #1a1a1a',
                      }}
                    >
                      Save My Journey
                      <span className="text-base">{'\u2726'}</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── Generating ── */}
              {screen === 'generating' && (
                <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full border-4 border-[#7d3f55] border-t-transparent animate-spin mx-auto" />
                  <p className="font-semibold text-[#1a1a1a]">AI is creating your study plan...</p>
                  <p className="text-xs text-gray-400">This may take 10-30 seconds</p>
                </motion.div>
              )}

              {/* ── Done ── */}
              {screen === 'done' && (
                <motion.div key="done" variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }} className="space-y-4">
                  <h2 className="text-2xl font-black text-[#1a1a1a] text-center mb-1" style={{ fontFamily: 'Georgia, serif' }}>
                    {'\uD83C\uDF89'} Your Study Plan
                  </h2>
                  <div
                    className="max-h-64 overflow-y-auto p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid #1a1a1a' }}
                  >
                    <AIStreamText key={streamKey} text={planText} speed={14} onComplete={streamDone} className="text-sm text-[#1a1a1a] leading-relaxed font-mono whitespace-pre-line" />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={modifyInput}
                      onChange={(e) => setModifyInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleModify()}
                      placeholder='e.g. "Add more practice each week"'
                      className="flex-1 px-4 py-2.5 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.8)', border: '1.5px solid #1a1a1a', borderRadius: '999px' }}
                      disabled={isRegenerating}
                    />
                    <button
                      onClick={handleModify}
                      disabled={isRegenerating || !modifyInput.trim()}
                      className="px-4 py-2 text-sm font-semibold text-white transition-colors cursor-pointer disabled:opacity-40"
                      style={{ background: '#1a1a1a', borderRadius: '999px' }}
                    >
                      {isRegenerating ? '...' : 'Update'}
                    </button>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleComplete}
                    className="w-full py-3.5 font-bold text-white text-sm transition-all cursor-pointer"
                    style={{
                      background: '#7d3f55',
                      border: '2px solid #1a1a1a',
                      borderRadius: '14px',
                      boxShadow: '3px 3px 0px #1a1a1a',
                    }}
                  >
                    {'\u2713'} Complete & View Dashboard
                  </motion.button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default PlanSurveyModal;
