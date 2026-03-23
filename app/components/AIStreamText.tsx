'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface Props {
  text: string;
  speed?: number; // ms per char, default 20
  onComplete?: () => void;
  className?: string;
  startDelay?: number; // ms before starting
}

export default function AIStreamText({ text, speed = 20, onComplete, className = '', startDelay = 0 }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Store onComplete in a ref to avoid stale closure / re-render loops
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reset when text changes
    setDisplayed('');
    setIsDone(false);
    indexRef.current = 0;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const start = () => {
      const type = () => {
        if (indexRef.current >= text.length) {
          setIsDone(true);
          onCompleteRef.current?.();
          return;
        }

        const char = text[indexRef.current];
        setDisplayed((prev) => prev + char);
        indexRef.current++;

        // Vary speed slightly for realism; pause longer at punctuation
        let delay: number;
        if (char === '\n') delay = speed * 8;
        else if (char === '.' || char === '!' || char === '?') delay = speed * 5;
        else if (char === ',') delay = speed * 3;
        else delay = speed + Math.random() * speed * 0.5;

        timerRef.current = setTimeout(type, delay);
      };
      type();
    };

    if (startDelay > 0) {
      timerRef.current = setTimeout(start, startDelay);
    } else {
      start();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, speed, startDelay]);

  // Render with simple markdown-like bold formatting
  const renderText = useCallback((raw: string) => {
    return raw.split('\n').map((line, i, lines) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return <span key={j}>{part}</span>;
      });
      return (
        <span key={i}>
          {rendered}
          {i < lines.length - 1 && <br />}
        </span>
      );
    });
  }, []);

  return (
    <span className={className}>
      {renderText(displayed)}
      {!isDone && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-[1px] animate-pulse align-middle opacity-70">▋</span>
      )}
    </span>
  );
}
