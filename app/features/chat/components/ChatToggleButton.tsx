'use client';

interface Props {
  isOpen: boolean;
  badge: number;
  onClick: () => void;
}

export default function ChatToggleButton({ isOpen, badge, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
      style={{ backgroundColor: '#2D2D2D' }}
    >
      <span className="text-xl">◉</span>
      {badge > 0 && !isOpen && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-white">
          {badge}
        </div>
      )}
    </button>
  );
}
