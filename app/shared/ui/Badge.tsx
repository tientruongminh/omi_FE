'use client';

interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export default function Badge({ children, style, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
