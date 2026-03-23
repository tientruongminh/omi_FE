'use client';

import { useEffect, useState, useRef } from 'react';

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
  const startedRef = useRef(false);

  useEffect(() => {
    // Reset when text changes
    setDisplayed('');
    setIsDone(false);
    indexRef.current = 0;
    startedRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);

    const start = () => {
      const type = () => {
        if (indexRef.current >= text.length) {
          setIsDone(true);
          onComplete?.();
          return;
        }

        const char = text[indexRef.current];
        setDisplayed((prev) => prev + char);
        indexRef.current++;

        // Vary speed slightly for realism, pause longer at newlines
        let delay = speed;
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
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, startDelay]); // eslint-disable-line react-hooks/exhaustive-deps

  // Render with simple markdown-like formatting
  const renderText = (raw: string) => {
    return raw.split('\n').map((line, i) => {
      // Bold: **text**
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
          {i < raw.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <span className={className}>
      {renderText(displayed)}
      {!isDone && (
        <span className="inline-block w-[2px] h-[1em] bg-current ml-[1px] animate-pulse align-middle">▋</span>
      )}
    </span>
  );
}
