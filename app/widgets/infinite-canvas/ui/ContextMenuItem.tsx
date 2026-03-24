'use client';

interface Props {
  label: string;
  danger?: boolean;
  onClick: () => void;
}

export default function ContextMenuItem({ label, danger, onClick }: Props) {
  return (
    <button
      className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-[#F1F1EC] transition-colors cursor-pointer"
      style={{ color: danger ? '#DC2626' : '#2D2D2D' }}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
