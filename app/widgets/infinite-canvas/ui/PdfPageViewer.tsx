'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

interface PdfPageViewerProps {
  sourceUrl: string;
  sourceLabel: string;
  initialPage?: number;
  searchText?: string;
  standalone?: boolean;
}

const PDF_WORKER_SRC = 'https://unpkg.com/pdfjs-dist@5.6.205/build/pdf.worker.min.mjs';

type PdfDocumentHandle = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<{
    getViewport: (options: { scale: number }) => { width: number; height: number };
    render: (options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: { width: number; height: number };
    }) => { promise: Promise<void> };
  }>;
  destroy?: () => Promise<void> | void;
};

function readCookieToken(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

function clampPage(page: number, total: number): number {
  if (!Number.isFinite(page) || page < 1) return 1;
  if (!Number.isFinite(total) || total < 1) return Math.max(1, Math.floor(page));
  return Math.min(Math.max(1, Math.floor(page)), total);
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/\u00ad/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildHighlightCandidates(searchText: string): string[] {
  const normalized = normalizeSearchText(searchText);
  if (!normalized) return [];

  const candidates = new Set<string>();
  const sentences = normalized
    .split(/(?<=[.?!])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 18)
    .sort((left, right) => right.length - left.length);

  for (const sentence of sentences.slice(0, 3)) {
    candidates.add(sentence);
  }

  const words = normalized.split(' ').filter(Boolean);
  for (let windowSize = Math.min(10, words.length); windowSize >= 4; windowSize -= 1) {
    for (let index = 0; index + windowSize <= words.length; index += 1) {
      const phrase = words.slice(index, index + windowSize).join(' ');
      if (phrase.length >= 18) {
        candidates.add(phrase);
      }
    }
    if (candidates.size > 10) {
      break;
    }
  }

  if (!candidates.size && normalized.length >= 12) {
    candidates.add(normalized);
  }

  return Array.from(candidates);
}

function clearTextLayerHighlights(container: HTMLDivElement) {
  for (const span of Array.from(container.querySelectorAll('.pdf-text-highlight'))) {
    span.classList.remove('pdf-text-highlight');
  }
}

function applyTextHighlights(container: HTMLDivElement, searchText: string): boolean {
  clearTextLayerHighlights(container);
  if (!searchText.trim()) return false;

  const spans = Array.from(container.querySelectorAll('span')).filter(
    (node): node is HTMLSpanElement => node instanceof HTMLSpanElement && Boolean(node.textContent?.trim()),
  );
  if (!spans.length) return false;

  const pageTextParts: string[] = [];
  const charToSpanIndex: number[] = [];

  spans.forEach((span, spanIndex) => {
    const normalized = normalizeSearchText(span.textContent ?? '');
    if (!normalized) {
      return;
    }
    if (pageTextParts.length > 0) {
      pageTextParts.push(' ');
      charToSpanIndex.push(-1);
    }
    pageTextParts.push(normalized);
    for (let offset = 0; offset < normalized.length; offset += 1) {
      charToSpanIndex.push(spanIndex);
    }
  });

  const pageText = pageTextParts.join('');
  if (!pageText) return false;

  const candidates = buildHighlightCandidates(searchText);
  let matched = false;

  for (const candidate of candidates) {
    let startIndex = pageText.indexOf(candidate);
    while (startIndex >= 0) {
      const spanIndexes = new Set<number>();
      for (let index = startIndex; index < startIndex + candidate.length && index < charToSpanIndex.length; index += 1) {
        const spanIndex = charToSpanIndex[index];
        if (spanIndex >= 0) {
          spanIndexes.add(spanIndex);
        }
      }

      if (spanIndexes.size) {
        matched = true;
        for (const spanIndex of spanIndexes) {
          spans[spanIndex]?.classList.add('pdf-text-highlight');
        }
      }

      startIndex = pageText.indexOf(candidate, startIndex + Math.max(1, Math.floor(candidate.length / 2)));
    }
  }

  return matched;
}

function buildPdfViewerRoute(
  sourceUrl: string,
  sourceLabel: string,
  page: number,
  searchText?: string,
): string {
  const params = new URLSearchParams();
  params.set('source', sourceUrl);
  params.set('label', sourceLabel);
  params.set('page', String(Math.max(1, Math.floor(page))));
  if (searchText?.trim()) {
    params.set('search', searchText);
  }
  return `/reference-viewer/pdf?${params.toString()}`;
}

export function buildPdfViewerTabUrl(options: {
  sourceUrl: string;
  sourceLabel: string;
  page: number;
  searchText?: string;
}): string {
  return buildPdfViewerRoute(
    options.sourceUrl,
    options.sourceLabel,
    options.page,
    options.searchText,
  );
}

export default function PdfPageViewer({
  sourceUrl,
  sourceLabel,
  initialPage = 1,
  searchText = '',
  standalone = false,
}: PdfPageViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const textLayerRef = useRef<HTMLDivElement | null>(null);
  const pageFrameRef = useRef<HTMLDivElement | null>(null);
  const [pdfDoc, setPdfDoc] = useState<PdfDocumentHandle | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(Math.max(1, Math.floor(initialPage)));
  const [zoom, setZoom] = useState(1.15);
  const [loading, setLoading] = useState(true);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState(false);
  const [highlightEnabled, setHighlightEnabled] = useState(Boolean(searchText.trim()));

  useEffect(() => {
    setHighlightEnabled(Boolean(searchText.trim()));
  }, [searchText]);

  useEffect(() => {
    setPageNumber(Math.max(1, Math.floor(initialPage)));
  }, [initialPage, sourceUrl]);

  useEffect(() => {
    let cancelled = false;
    let loadedPdf: PdfDocumentHandle | null = null;

    setLoading(true);
    setError(null);
    setPdfDoc(null);
    setPageCount(0);

    void (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;

        const headers: Record<string, string> = {};
        const token = readCookieToken();
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(sourceUrl, {
          credentials: 'include',
          headers,
        });
        if (!response.ok) {
          throw new Error(`Khong the tai file PDF (${response.status}).`);
        }

        const buffer = await response.arrayBuffer();
        const task = pdfjs.getDocument({ data: buffer });
        loadedPdf = await task.promise as unknown as PdfDocumentHandle;
        if (cancelled) {
          await loadedPdf.destroy?.();
          return;
        }

        setPdfDoc(loadedPdf);
        const totalPages = loadedPdf.numPages;
        setPageCount(totalPages);
        setPageNumber((current) => clampPage(current || initialPage, totalPages));
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Khong the mo PDF.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      void loadedPdf?.destroy?.();
    };
  }, [initialPage, sourceUrl]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;
    setRendering(true);
    setHighlighted(false);

    void (async () => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const page = await pdfDoc.getPage(clampPage(pageNumber, pageCount || pageNumber)) as unknown as {
          getViewport: (options: { scale: number }) => { width: number; height: number };
          render: (options: {
            canvasContext: CanvasRenderingContext2D;
            viewport: { width: number; height: number };
          }) => { promise: Promise<void> };
          getTextContent: () => Promise<unknown>;
        };
        if (cancelled) return;

        const viewport = page.getViewport({ scale: zoom });
        const canvas = canvasRef.current;
        const textLayer = textLayerRef.current;
        const pageFrame = pageFrameRef.current;
        if (!canvas || !textLayer || !pageFrame) return;

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Khong the khoi tao canvas PDF.');
        }

        textLayer.innerHTML = '';
        clearTextLayerHighlights(textLayer);

        const deviceScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * deviceScale);
        canvas.height = Math.floor(viewport.height * deviceScale);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        pageFrame.style.width = `${viewport.width}px`;
        pageFrame.style.height = `${viewport.height}px`;
        context.setTransform(deviceScale, 0, 0, deviceScale, 0, 0);

        const renderTask = page.render({
          canvasContext: context,
          viewport,
        });
        await renderTask.promise;

        const textContent = await page.getTextContent();
        if (cancelled) return;

        const textLayerInstance = new (pdfjs as unknown as {
          TextLayer: new (options: {
            textContentSource: unknown;
            container: HTMLDivElement;
            viewport: unknown;
          }) => { render: () => Promise<void> };
        }).TextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
        });
        await textLayerInstance.render();
        if (cancelled) return;

        if (highlightEnabled) {
          setHighlighted(applyTextHighlights(textLayer, searchText));
        } else {
          clearTextLayerHighlights(textLayer);
          setHighlighted(false);
        }
      } catch (renderError) {
        if (!cancelled) {
          setError(renderError instanceof Error ? renderError.message : 'Khong the render trang PDF.');
          setHighlighted(false);
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [highlightEnabled, pageCount, pageNumber, pdfDoc, searchText, zoom]);

  const openInTabUrl = useMemo(
    () => buildPdfViewerRoute(sourceUrl, sourceLabel, pageNumber, searchText),
    [pageNumber, searchText, sourceLabel, sourceUrl],
  );

  return (
    <div className={`flex h-full min-h-0 flex-col ${standalone ? 'bg-[#F5F0EB]' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5D8CE] bg-[#FBF7F2] px-5 py-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#2D2D2D]">{sourceLabel}</p>
          <p className="text-[12px] text-[#6B7280]">
            Trang {pageNumber}{pageCount > 0 ? ` / ${pageCount}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.15).toFixed(2))))}
            className="rounded-xl border border-[#D6C9BE] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D2D2D]"
            type="button"
          >
            Zoom -
          </button>
          <button
            onClick={() => setZoom((value) => Math.min(2.4, Number((value + 0.15).toFixed(2))))}
            className="rounded-xl border border-[#D6C9BE] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D2D2D]"
            type="button"
          >
            Zoom +
          </button>
          {searchText.trim() ? (
            <button
              onClick={() => setHighlightEnabled((value) => !value)}
              className="rounded-xl border border-[#D6C9BE] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D2D2D]"
              type="button"
            >
              {highlightEnabled ? 'Bo highlight' : 'Bat highlight'}
            </button>
          ) : null}
          <button
            onClick={() => setPageNumber((value) => clampPage(value - 1, pageCount))}
            disabled={pageNumber <= 1}
            className="rounded-xl border border-[#D6C9BE] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D2D2D] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Trang truoc
          </button>
          <button
            onClick={() => setPageNumber((value) => clampPage(value + 1, pageCount))}
            disabled={pageCount > 0 ? pageNumber >= pageCount : true}
            className="rounded-xl border border-[#D6C9BE] bg-white px-3 py-2 text-[12px] font-semibold text-[#2D2D2D] disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
          >
            Trang sau
          </button>
          {standalone ? null : (
            <a
              href={openInTabUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#D6C9BE] bg-[#F7F1E8] px-3 py-2 text-[12px] font-semibold text-[#2D2D2D]"
            >
              Mo tab moi
            </a>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#EEE7DD] p-5">
        {loading ? (
          <div className="flex h-full min-h-[320px] items-center justify-center rounded-[28px] border border-[#E5D8CE] bg-white text-[14px] text-[#5A5C58]">
            Dang tai PDF...
          </div>
        ) : null}

        {!loading && error ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 rounded-[28px] border border-[#FCA5A5] bg-[#FFF1F2] px-6 text-center">
            <p className="max-w-xl text-[14px] leading-7 text-[#9F1239]">{error}</p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-[#FBCFE8] bg-white px-4 py-2 text-[13px] font-semibold text-[#9F1239]"
            >
              Thu mo file PDF goc
            </a>
          </div>
        ) : null}

        {!loading && !error ? (
          <div className="mx-auto w-fit rounded-[22px] border border-[#D8CEC4] bg-white p-3 shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
            <div ref={pageFrameRef} className="pdf-page-frame">
              <canvas ref={canvasRef} className="block rounded-[14px]" />
              <div ref={textLayerRef} className="pdf-text-layer" />
            </div>
            <p className="mt-3 text-center text-[12px] text-[#6B7280]">
              {rendering
                ? 'Dang render trang...'
                : highlighted
                  ? `Dang hien thi trang ${pageNumber} - da highlight evidence`
                  : searchText.trim() && !highlightEnabled
                    ? `Dang hien thi trang ${pageNumber} - highlight dang tat`
                  : `Dang hien thi trang ${pageNumber}`}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
