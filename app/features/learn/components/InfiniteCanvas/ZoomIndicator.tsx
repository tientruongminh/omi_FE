'use client';

interface Props {
  scale: number;
}

export default function ZoomIndicator({ scale }: Props) {
  return (
    <div className="absolute bottom-3 left-3 text-[11px] text-[#5A5C58] bg-white/80 px-2.5 py-1 rounded-lg border border-[#CCCCCC]">
      {Math.round(scale * 100)}%
    </div>
  );
}
