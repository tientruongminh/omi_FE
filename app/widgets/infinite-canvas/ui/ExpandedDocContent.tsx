'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ExternalLink,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { CanvasNode } from '../model/types';
import { documentTextContent, videoTranscripts, mindmapNodes } from '@/entities/learning-content';
import {
  fetchRenderedDocumentView,
  getSourceDisplayLabel,
  type RenderedDocumentReference,
  type RenderedDocumentView,
} from '@/entities/project/api/roadmap';
import { API_BASE } from '@/shared/api/client';
import ExpandedHeader from './ExpandedHeader';
import PdfPageViewer, { buildPdfViewerTabUrl } from './PdfPageViewer';
import VideoPlayer from './VideoPlayer';

interface Props {
  node: CanvasNode;
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-chat' | 'ai-review', selectedText?: string) => void;
}

interface FloatingMenu {
  x: number;
  y: number;
  text: string;
}

interface ActiveReferenceState {
  sectionHeading: string;
  reference: RenderedDocumentReference;
}

const renderedViewCache = new Map<string, RenderedDocumentView>();

function buildCacheKey(node: CanvasNode): string | null {
  if (!node.sourceId || !node.passageIds?.length) return null;
  return `${node.sourceId}:${node.passageIds.join(',')}`;
}

function getSectionReferences(section: RenderedDocumentView['sections'][number]): RenderedDocumentReference[] {
  return Array.isArray(section.references) ? section.references : [];
}

function formatSeconds(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function getReferenceDisplayLabel(reference: RenderedDocumentReference): string {
  return getSourceDisplayLabel({
    source_label: reference.source_label,
    source_ref: reference.source_ref,
  });
}

function resolveSourceUrl(reference: RenderedDocumentReference): string {
  if (/^https?:\/\//i.test(reference.source_ref)) {
    return reference.source_ref;
  }
  return `${API_BASE}/upload/${encodeURIComponent(reference.source_ref)}`;
}

function buildPdfDocumentUrl(reference: RenderedDocumentReference): string {
  const sourceUrl = resolveSourceUrl(reference);
  const separator = sourceUrl.includes('?') ? '&' : '?';
  return `${sourceUrl}${separator}passage=${encodeURIComponent(reference.passage_id)}`;
}

function cleanPdfSearchText(value: string): string {
  return value
    .replace(/[\r\t]+/g, ' ')
    .replace(/\u00ad/g, '')
    .replace(/[•●▪◦]/g, ' ')
    .replace(/[()[\]{}<>]/g, ' ')
    .replace(/[,:;!?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scorePdfSearchPhrase(phrase: string): number {
  const words = phrase.split(' ').filter(Boolean);
  if (words.length < 2) return -1;

  const alphaChars = (phrase.match(/[A-Za-zÀ-ỹ]/g) ?? []).length;
  const totalChars = phrase.replace(/\s/g, '').length || 1;
  const alphaRatio = alphaChars / totalChars;
  const longWords = words.filter((word) => word.length >= 4).length;
  const titleLikeWords = words.filter((word) => /^[A-ZÀ-Ỹ][a-zà-ỹ0-9_-]*$/.test(word)).length;

  let score = 0;
  score += Math.max(0, 8 - Math.abs(words.length - 4)) * 8;
  score += Math.min(longWords, 4) * 5;
  score += titleLikeWords * 4;
  score += Math.round(alphaRatio * 20);
  score -= Math.max(0, phrase.length - 48);

  return score;
}

function extractSearchQuery(excerpt: string): string {
  const cleaned = cleanPdfSearchText(excerpt);
  if (!cleaned) return '';

  const lineCandidates = excerpt
    .split(/\n+/)
    .map((line) => cleanPdfSearchText(line))
    .filter(Boolean);

  const segmentCandidates = cleaned
    .split(/[.]/)
    .map((segment) => cleanPdfSearchText(segment))
    .filter(Boolean);

  const wordWindows: string[] = [];
  const sourceBlocks = [...lineCandidates, ...segmentCandidates];
  for (const block of sourceBlocks) {
    const words = block.split(' ').filter(Boolean);
    if (words.length >= 2 && words.length <= 6) {
      wordWindows.push(words.join(' '));
    }
    for (let windowSize = 2; windowSize <= 5; windowSize += 1) {
      for (let index = 0; index + windowSize <= words.length; index += 1) {
        wordWindows.push(words.slice(index, index + windowSize).join(' '));
      }
    }
  }

  const uniqueCandidates = Array.from(new Set([...lineCandidates, ...segmentCandidates, ...wordWindows]))
    .map((candidate) => candidate.trim())
    .filter((candidate) => candidate.split(' ').length >= 2)
    .sort((left, right) => scorePdfSearchPhrase(right) - scorePdfSearchPhrase(left));

  return uniqueCandidates[0] ?? cleaned.split(' ').slice(0, 4).join(' ');
}

const PDF_CONTENT_STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'if', 'in', 'into', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'their', 'them',
  'there', 'these', 'they', 'this', 'to', 'was', 'we', 'will', 'with', 'would',
]);

function getPdfSearchWords(phrase: string): string[] {
  return phrase.split(' ').map((word) => word.trim()).filter(Boolean);
}

function countPdfTitleCaseWords(words: string[]): number {
  return words.filter((word) => /^[A-ZÀ-Ỹ][a-zà-ỹ0-9_-]*$/.test(word)).length;
}

function countPdfLowercaseWords(words: string[]): number {
  return words.filter((word) => /[a-zà-ỹ]/.test(word) && !/^[A-ZÀ-Ỹ][a-zà-ỹ0-9_-]*$/.test(word)).length;
}

function countPdfStopwords(words: string[]): number {
  return words.filter((word) => PDF_CONTENT_STOPWORDS.has(word.toLowerCase())).length;
}

function isLikelyPdfHeadingPhrase(phrase: string): boolean {
  const words = getPdfSearchWords(phrase);
  if (words.length === 0) return true;

  const titleCaseWords = countPdfTitleCaseWords(words);
  const stopwords = countPdfStopwords(words);
  const lowercaseWords = countPdfLowercaseWords(words);

  if (words.length <= 6 && titleCaseWords >= Math.max(2, words.length - 1) && stopwords <= 1) {
    return true;
  }

  if (lowercaseWords === 0 && stopwords === 0 && words.length <= 8) {
    return true;
  }

  return false;
}

function isLikelyPdfMetadataPhrase(phrase: string): boolean {
  const words = getPdfSearchWords(phrase);
  if (!words.length) return true;

  const digitWords = words.filter((word) => /\d/.test(word)).length;
  if (/\$|usd|years?|salary|gender|age/i.test(phrase)) {
    return true;
  }
  if (digitWords >= Math.ceil(words.length / 2) && words.length <= 8) {
    return true;
  }

  return false;
}

function cleanFocusedPdfSearchText(value: string): string {
  return value
    .replace(/[\r\t]+/g, ' ')
    .replace(/\u00ad/g, '')
    .replace(/[\u2022\u25cf\u25aa\u25e6]/g, ' ')
    .replace(/^[\-*]+\s*/, '')
    .replace(/^[0-9]+\.\s*/, '')
    .replace(/[()[\]{}<>]/g, ' ')
    .replace(/\s*[,;:!?]\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreFocusedPdfSearchCandidate(phrase: string): number {
  const words = getPdfSearchWords(phrase);
  if (words.length < 5) return -1;

  const stopwords = countPdfStopwords(words);
  const lowercaseWords = countPdfLowercaseWords(words);
  const titleCaseWords = countPdfTitleCaseWords(words);
  const alphaChars = (phrase.match(/[A-Za-zÀ-ỹ]/g) ?? []).length;
  const totalChars = phrase.replace(/\s/g, '').length || 1;

  let score = 0;
  score += Math.max(0, 14 - Math.abs(words.length - 11)) * 7;
  score += stopwords * 14;
  score += lowercaseWords * 6;
  score += Math.round((alphaChars / totalChars) * 20);
  score -= titleCaseWords * 7;
  score -= Math.max(0, phrase.length - 120);

  if (isLikelyPdfHeadingPhrase(phrase)) score -= 140;
  if (isLikelyPdfMetadataPhrase(phrase)) score -= 90;

  return score;
}

function extractFocusedSearchQuery(excerpt: string): string {
  const cleaned = cleanFocusedPdfSearchText(excerpt);
  if (!cleaned) return '';

  const rawLines = excerpt
    .split(/\n+/)
    .map((line) => cleanFocusedPdfSearchText(line))
    .filter(Boolean);

  const contentLines = rawLines.filter(
    (line) => !isLikelyPdfHeadingPhrase(line) && !isLikelyPdfMetadataPhrase(line),
  );

  const blocks: string[] = [];
  let currentBlock: string[] = [];

  for (const line of contentLines) {
    const words = getPdfSearchWords(line);
    if (words.length < 4) {
      if (currentBlock.length > 0 && /^[a-zà-ỹ,(]/.test(line)) {
        currentBlock.push(line);
      }
      continue;
    }

    currentBlock.push(line);

    const closesThought = /[.?!]$/.test(line);
    const isLongEnough = getPdfSearchWords(currentBlock.join(' ')).length >= 12;
    if (closesThought || isLongEnough) {
      blocks.push(currentBlock.join(' '));
      currentBlock = [];
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join(' '));
  }

  const candidates = Array.from(
    new Set(
      blocks.flatMap((block) => [
        block,
        ...block
          .split(/(?<=[.?!])\s+/)
          .map((sentence) => cleanFocusedPdfSearchText(sentence))
          .filter(Boolean),
      ]),
    ),
  )
    .filter((candidate) => {
      const words = getPdfSearchWords(candidate);
      return (
        words.length >= 5 &&
        !isLikelyPdfHeadingPhrase(candidate) &&
        !isLikelyPdfMetadataPhrase(candidate)
      );
    })
    .sort((left, right) => scoreFocusedPdfSearchCandidate(right) - scoreFocusedPdfSearchCandidate(left));

  if (candidates[0]) {
    return candidates[0];
  }

  const fallbackLine = contentLines.find((line) => getPdfSearchWords(line).length >= 5);
  if (fallbackLine) {
    return fallbackLine;
  }

  return extractSearchQuery(excerpt);
}

function buildTextFragment(excerpt: string): string {
  const text = excerpt
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 12)
    .join(' ');
  return text ? `#:~:text=${encodeURIComponent(text)}` : '';
}

function toYouTubeEmbedUrl(url: string, startSeconds: number): string {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  if (!match) return url;
  return `https://www.youtube.com/embed/${match[1]}?start=${Math.max(0, Math.floor(startSeconds))}&autoplay=1`;
}

function buildViewerUrl(reference: RenderedDocumentReference): string {
  const locator = reference.locator ?? {};
  const sourceUrl = resolveSourceUrl(reference);

  if (reference.source_type === 'pdf' || reference.locator_type === 'pdf_page') {
    return buildPdfDocumentUrl(reference);
  }

  if (reference.source_type === 'youtube' || reference.locator_type === 'youtube_timestamp') {
    const start = Number(locator.start_seconds ?? 0);
    return toYouTubeEmbedUrl(String(locator.url ?? sourceUrl), start);
  }

  if (reference.locator_type === 'web_dom' && typeof locator.url === 'string' && locator.url) {
    return `${locator.url}${buildTextFragment(reference.excerpt)}`;
  }

  if (reference.source_type === 'web') {
    return `${sourceUrl}${buildTextFragment(reference.excerpt)}`;
  }

  if (
    reference.source_type === 'video' ||
    reference.source_type === 'audio' ||
    reference.locator_type === 'video_timestamp' ||
    reference.locator_type === 'audio_timestamp'
  ) {
    const start = Number(locator.start_seconds ?? 0);
    return start > 0 ? `${sourceUrl}#t=${Math.floor(start)}` : sourceUrl;
  }

  return sourceUrl;
}

function buildReferenceLabel(reference: RenderedDocumentReference, index: number): string {
  const locator = reference.locator ?? {};

  if (reference.locator_type === 'pdf_page') {
    return `Reference ${index + 1} - Trang ${locator.page ?? '?'}`;
  }

  if (
    reference.locator_type === 'youtube_timestamp' ||
    reference.locator_type === 'audio_timestamp' ||
    reference.locator_type === 'video_timestamp'
  ) {
    return `Reference ${index + 1} - ${formatSeconds(Number(locator.start_seconds ?? 0))}`;
  }

  if (reference.locator_type === 'web_dom' || reference.source_type === 'web') {
    return `Reference ${index + 1} - Web`;
  }

  return `Reference ${index + 1}`;
}

function buildLocatorDescription(reference: RenderedDocumentReference): string {
  const locator = reference.locator ?? {};

  if (reference.locator_type === 'pdf_page') {
    return `Trang ${locator.page ?? '?'}`;
  }

  if (
    reference.locator_type === 'youtube_timestamp' ||
    reference.locator_type === 'audio_timestamp' ||
    reference.locator_type === 'video_timestamp'
  ) {
    const start = formatSeconds(Number(locator.start_seconds ?? 0));
    const end = Number(locator.end_seconds);
    return Number.isFinite(end) && end > 0 ? `${start} -> ${formatSeconds(end)}` : start;
  }

  if (reference.locator_type === 'web_dom') {
    return String(locator.selector ?? locator.url ?? 'Nguon web');
  }

  return reference.locator_type;
}

function ReferenceViewerModal({
  activeReference,
  onClose,
}: {
  activeReference: ActiveReferenceState | null;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!activeReference) return;

    const locator = activeReference.reference.locator ?? {};
    const startSeconds = Number(locator.start_seconds ?? 0);

    const applySeek = (element: HTMLMediaElement | null) => {
      if (!element || !Number.isFinite(startSeconds)) return;

      const setTime = () => {
        try {
          element.currentTime = Math.max(0, startSeconds);
        } catch {
          // Ignore seek errors for unsupported states.
        }
      };

      if (element.readyState >= 1) {
        setTime();
      } else {
        element.addEventListener('loadedmetadata', setTime, { once: true });
      }
    };

    applySeek(videoRef.current);
    applySeek(audioRef.current);
  }, [activeReference]);

  if (!activeReference) return null;

  const { reference, sectionHeading } = activeReference;
  const viewerUrl = buildViewerUrl(reference);
  const sourceLabel = getReferenceDisplayLabel(reference);
  const isPdf = reference.source_type === 'pdf' || reference.locator_type === 'pdf_page';
  const isWeb = reference.source_type === 'web' || reference.locator_type === 'web_dom';
  const isYouTube = reference.source_type === 'youtube' || reference.locator_type === 'youtube_timestamp';
  const isVideo = reference.source_type === 'video';
  const isAudio = reference.source_type === 'audio' || reference.locator_type === 'audio_timestamp';
  const pdfPage = Number(reference.locator?.page ?? 1);
  const sourceUrl = isPdf
    ? buildPdfViewerTabUrl({
        sourceUrl: viewerUrl,
        sourceLabel,
        page: Number.isFinite(pdfPage) && pdfPage > 0 ? pdfPage : 1,
        searchText: reference.excerpt,
      })
    : viewerUrl;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      >
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.97 }}
          className="relative z-10 flex h-[86vh] w-full max-w-[1500px] overflow-hidden rounded-[28px] border-2 border-[#333333] bg-[#F5F0EB] shadow-[0_25px_80px_rgba(0,0,0,0.28)]"
        >
          <div className="flex min-w-0 flex-1 flex-col border-r border-[#D8CEC4] bg-[#FBF7F2]">
            <div className="flex items-start justify-between gap-4 border-b border-[#E5D8CE] px-6 py-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">
                  Reference Viewer
                </p>
                <h3 className="mt-2 truncate text-[18px] font-semibold text-[#2D2D2D]">
                  {sourceLabel}
                </h3>
                <p className="mt-1 text-[12px] text-[#6B7280]">
                  {sectionHeading} - {buildLocatorDescription(reference)}
                </p>
              </div>

              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#D6C9BE] bg-white text-[#2D2D2D] transition-colors hover:border-[#333333]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative flex-1 bg-[#EEE7DD]">
              {isPdf ? (
                <PdfPageViewer
                  sourceUrl={viewerUrl}
                  sourceLabel={sourceLabel}
                  initialPage={Number.isFinite(pdfPage) && pdfPage > 0 ? pdfPage : 1}
                  searchText={reference.excerpt}
                />
              ) : null}

              {isWeb ? (
                <iframe src={viewerUrl} title={sourceLabel} className="h-full w-full border-0 bg-white" />
              ) : null}

              {isYouTube ? (
                <iframe
                  src={viewerUrl}
                  title={sourceLabel}
                  className="h-full w-full border-0 bg-black"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : null}

              {isVideo ? (
                <div className="flex h-full items-center justify-center bg-black p-6">
                  <video
                    ref={videoRef}
                    controls
                    autoPlay
                    className="max-h-full max-w-full rounded-2xl shadow-2xl"
                    src={viewerUrl}
                  />
                </div>
              ) : null}

              {isAudio ? (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,#35253a,#16131d)] p-8">
                  <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/60">
                      Audio Reference
                    </p>
                    <h4 className="mt-3 text-[22px] font-semibold">{sourceLabel}</h4>
                    <p className="mt-2 text-sm text-white/70">{buildLocatorDescription(reference)}</p>
                    <audio ref={audioRef} controls autoPlay className="mt-6 w-full" src={viewerUrl} />
                  </div>
                </div>
              ) : null}

              {!isPdf && !isWeb && !isYouTube && !isVideo && !isAudio ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                  <Search size={30} className="text-[#8B1E3F]" />
                  <p className="max-w-md text-[14px] leading-7 text-[#5A5C58]">
                    Chua co viewer chuyen biet cho loai tai lieu nay. Ban van co the mo nguon goc bang nut ben phai.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="flex w-[360px] flex-col bg-white/82">
            <div className="border-b border-[#E5D8CE] px-6 py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">Evidence</p>
              <h4 className="mt-2 text-[16px] font-semibold text-[#2D2D2D]">
                Doan duoc dung de tao section
              </h4>
              <p className="mt-2 text-[12px] leading-6 text-[#6B7280]">
                Viewer da duoc dinh vi toi dung page hoac timestamp. Doan evidence tuong ung duoc to vang o day de doi chieu.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="rounded-3xl border border-[#F5D689] bg-[#FFF8DB] px-5 py-4 shadow-sm">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B1E3F]">
                  {buildLocatorDescription(reference)}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-7 text-[#2D2D2D]">
                  {reference.excerpt}
                </p>
              </div>
            </div>

            <div className="border-t border-[#E5D8CE] px-6 py-5">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D8CEC4] bg-[#F7F1E8] px-4 py-3 text-[13px] font-semibold text-[#2D2D2D] transition-colors hover:bg-[#EFE5D8]"
              >
                <ExternalLink size={14} />
                Mo nguon goc o tab moi
              </a>
            </div>
          </aside>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ExpandedDocContent({ node, onClose, onCreateAINode }: Props) {
  const [floatingMenu, setFloatingMenu] = useState<FloatingMenu | null>(null);
  const [renderedView, setRenderedView] = useState<RenderedDocumentView | null>(null);
  const [renderedLoading, setRenderedLoading] = useState(false);
  const [renderedError, setRenderedError] = useState<string | null>(null);
  const [activeReference, setActiveReference] = useState<ActiveReferenceState | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const runtimeParagraphs =
    node.passages && node.passages.length > 0
      ? node.passages
      : node.content
        ? node.content
            .split(/\n\s*\n/)
            .map((part) => part.trim())
            .filter(Boolean)
        : [];

  const paragraphs =
    runtimeParagraphs.length > 0
      ? runtimeParagraphs
      : node.docType === 'text'
        ? (documentTextContent[node.docId ?? ''] ?? ['Noi dung dang duoc chuan bi.'])
        : [videoTranscripts[node.docId ?? ''] ?? '...noi dung video dang duoc tai...'];

  const chapterNode = mindmapNodes.find((item) => item.id === node.nodeId);
  const doc = chapterNode?.documents.find((item) => item.id === node.docId);
  const subtitle =
    node.metaSubtitle ??
    (doc ? `${node.docType === 'video' ? `Video - ${doc.duration}` : `PDF - ${doc.size}`}` : undefined);

  useEffect(() => {
    const cacheKey = buildCacheKey(node);
    if (node.docType !== 'text' || !cacheKey) {
      setRenderedView(null);
      setRenderedError(null);
      setRenderedLoading(false);
      return;
    }

    const cached = renderedViewCache.get(cacheKey);
    if (cached) {
      setRenderedView(cached);
      setRenderedError(null);
      setRenderedLoading(false);
      return;
    }

    let cancelled = false;
    setRenderedLoading(true);
    setRenderedError(null);

    void fetchRenderedDocumentView(node.sourceId!, node.passageIds!)
      .then((result) => {
        if (cancelled) return;
        renderedViewCache.set(cacheKey, result);
        setRenderedView(result);
      })
      .catch((error) => {
        if (cancelled) return;
        setRenderedError(error instanceof Error ? error.message : 'Khong the tao ban dien giai AI.');
      })
      .finally(() => {
        if (!cancelled) {
          setRenderedLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [node]);

  const handleMouseUp = useCallback(() => {
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 3) {
        setFloatingMenu(null);
        return;
      }

      const range = selection?.getRangeAt(0);
      if (!range) return;

      const rect = range.getBoundingClientRect();
      const containerRect = contentRef.current?.getBoundingClientRect();
      if (!containerRect) return;

      setFloatingMenu({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top - containerRect.top - 8,
        text,
      });
    }, 10);
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const selection = window.getSelection();
    const text = selection?.toString().trim() ?? '';
    const containerRect = contentRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setFloatingMenu({
      x: event.clientX - containerRect.left,
      y: event.clientY - containerRect.top,
      text,
    });
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (floatingMenu && contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setFloatingMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [floatingMenu]);

  const handleAction = useCallback((type: 'ai-chat' | 'ai-review') => {
    const text = floatingMenu?.text || undefined;
    onCreateAINode(node.id, type, text);
    setFloatingMenu(null);
    window.getSelection()?.removeAllRanges();
  }, [floatingMenu?.text, node.id, onCreateAINode]);

  return (
    <div className="flex h-full flex-col bg-[#F5F0EB]">
      <ExpandedHeader
        icon={node.docType === 'video' ? '▶' : '◉'}
        title={node.title}
        subtitle={subtitle}
        onClose={onClose}
      />

      {node.docType === 'text' ? (
        <div
          className="relative flex-1 overflow-y-auto px-6 py-5"
          ref={contentRef}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
        >
          <article className="mx-auto w-full max-w-3xl space-y-4 pb-8">
            <section className="rounded-3xl border border-[#E8DDD2] bg-[#FFF9F5] px-6 py-5 shadow-sm">
              <div className="flex items-center gap-2 text-[#8B1E3F]">
                <Sparkles size={14} />
                <p className="text-[11px] font-bold uppercase tracking-[0.18em]">Dien giai AI co grounding</p>
              </div>
              <p className="mt-3 text-[13px] leading-7 text-[#5A5C58]">
                Moi section ben duoi duoc viet lai tu cac passage evidence cua chinh tai lieu nay.
                Link reference se mo nguon goc tai dung page hoac timestamp gan nhat.
              </p>
            </section>

            {renderedLoading ? (
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-[#E8DDD2] bg-white/75 text-center">
                <Loader2 size={22} className="animate-spin text-[#8B1E3F]" />
                <p className="mt-3 text-[13px] font-medium text-[#5A5C58]">
                  AI dang doc cac chunk va sap xep lai noi dung...
                </p>
              </div>
            ) : null}

            {!renderedLoading && renderedError ? (
              <div className="rounded-3xl border border-[#FCA5A5] bg-[#FFF1F2] px-5 py-4 text-[13px] text-[#9F1239]">
                {renderedError}
              </div>
            ) : null}

            {!renderedLoading && !renderedError && renderedView ? (
              <>
                <section className="rounded-3xl border border-[#E8DDD2] bg-[#FFF9F5] px-6 py-5 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B1E3F]">
                    Tom tat tu evidence
                  </p>
                  <p className="mt-3 whitespace-pre-wrap text-[15px] leading-8 text-[#2D2D2D] [text-wrap:pretty]">
                    {renderedView.summary}
                  </p>
                </section>

                {(Array.isArray(renderedView.sections) ? renderedView.sections : []).map((section, sectionIndex) => {
                  const references = getSectionReferences(section);
                  return (
                    <section
                      key={section.section_id || `section-${sectionIndex}`}
                      className="rounded-3xl border border-[#E8DDD2] bg-white/80 px-6 py-5 shadow-sm backdrop-blur-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[18px] font-semibold leading-7 text-[#2D2D2D]">
                          {section.heading}
                        </h3>
                        <span className="shrink-0 rounded-full bg-[#F5F0EB] px-3 py-1 text-[11px] font-semibold text-[#6B7280]">
                          {references.length} reference
                        </span>
                      </div>

                      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 text-[#2D2D2D] [text-wrap:pretty] select-text">
                        {section.content}
                      </p>

                      {references.length > 0 ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                          {references.map((reference, index) => (
                            <button
                              key={reference.passage_id}
                              onClick={() => setActiveReference({ sectionHeading: section.heading, reference })}
                              className="inline-flex items-center gap-2 rounded-full border border-[#D9CDBE] bg-[#F8F1E7] px-3 py-1.5 text-[11px] font-semibold text-[#6B4E3D] transition-colors hover:border-[#BFA68E] hover:bg-[#F1E5D6]"
                            >
                              <Search size={11} />
                              {buildReferenceLabel(reference, index)}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </section>
                  );
                })}
              </>
            ) : null}
          </article>

          <AnimatePresence>
            {floatingMenu ? (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="absolute z-50 flex flex-col overflow-hidden rounded-xl bg-[#2D2D2D] shadow-2xl"
                style={{
                  left: floatingMenu.x,
                  top: floatingMenu.y,
                  transform: 'translate(-50%, -100%)',
                  minWidth: 180,
                }}
              >
                {floatingMenu.text ? (
                  <div className="max-w-[220px] truncate border-b border-white/10 px-3 py-2 text-[10px] text-white/50">
                    "{floatingMenu.text.slice(0, 50)}{floatingMenu.text.length > 50 ? '...' : ''}"
                  </div>
                ) : null}

                <button
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleAction('ai-chat');
                  }}
                  className="cursor-pointer px-4 py-2.5 text-left text-[12px] font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle size={13} className="text-[#6EE7B7]" />
                    AI hoi dap
                  </span>
                </button>

                <button
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleAction('ai-review');
                  }}
                  className="cursor-pointer px-4 py-2.5 text-left text-[12px] font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList size={13} className="text-[#FCA5A5]" />
                    AI on tap
                  </span>
                </button>

                <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-[#2D2D2D]" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}

      {node.docType === 'video' ? (
        <div
          className="relative flex-1 overflow-y-auto px-5 py-4"
          onContextMenu={handleContextMenu}
          onMouseUp={handleMouseUp}
          ref={contentRef}
        >
          <VideoPlayer node={node} />
          <div className="rounded-xl border border-[#E5E5DF] bg-white p-4">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#5A5C58]">Noi dung chinh</p>
            <p className="select-text text-[13px] italic leading-relaxed text-[#5A5C58]">{paragraphs[0]}</p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-shrink-0 gap-2.5 border-t-2 border-[#333333]/15 bg-white/40 px-5 py-3.5">
        <button
          onClick={() => onCreateAINode(node.id, 'ai-chat')}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[#6EE7B7] bg-[#D1FAE5] py-2 text-[12px] font-bold text-[#065F46] transition-colors hover:bg-[#A7F3D0]"
        >
          <MessageCircle size={13} />
          AI hoi dap
        </button>

        <button
          onClick={() => onCreateAINode(node.id, 'ai-review')}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-[#FCA5A5] bg-[#FEE2E2] py-2 text-[12px] font-bold text-[#991B1B] transition-colors hover:bg-[#FECACA]"
        >
          <ClipboardList size={13} />
          On tap
        </button>
      </div>

      <ReferenceViewerModal
        activeReference={activeReference}
        onClose={() => setActiveReference(null)}
      />
    </div>
  );
}
