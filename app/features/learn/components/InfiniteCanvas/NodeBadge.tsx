'use client';

interface Props {
  count: number;
  textColor: string;
}

export default function NodeBadge({ count, textColor }: Props) {
  if (count <= 0) return null;
  return (
    <span
      className="ml-auto flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: 'rgba(0,0,0,0.1)', color: textColor }}
    >
      +{count}
    </span>
  );
}
