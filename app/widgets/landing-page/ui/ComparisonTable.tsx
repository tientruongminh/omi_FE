'use client';

interface ComparisonItem {
  icon: string;
  text: string;
}

interface ComparisonTableProps {
  oldItems: ComparisonItem[];
  newItems: ComparisonItem[];
  oldResult: string;
  newResult: string;
}

export default function ComparisonTable({ oldItems, newItems, oldResult, newResult }: ComparisonTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 items-start">
      {/* Old way */}
      <div className="rounded-2xl p-6 md:p-8 flex flex-col gap-4" style={{ background: '#F5F5F5', border: '2px dashed #D1CCC6' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Học kiểu cũ</p>
        <div className="flex flex-col gap-3">
          {oldItems.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <span className="text-sm" style={{ color: '#9CA3AF' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 px-4 py-3 rounded-xl text-sm font-bold" style={{ background: '#EBEBEB', color: '#9CA3AF' }}>Kết quả: &quot;{oldResult}&quot;</div>
      </div>

      {/* New way */}
      <div className="rounded-2xl p-6 md:p-8 flex flex-col gap-4" style={{ background: '#FFFFFF', border: '2px solid #3DBE7A', boxShadow: '0 4px 32px rgba(61,190,122,0.12)', transform: 'scale(1.02)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#3DBE7A' }}>Học với Omilearn</p>
        <div className="flex flex-col gap-3">
          {newItems.map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <span className="text-sm font-medium" style={{ color: '#2D2D2D' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 px-4 py-3 rounded-xl text-sm font-bold" style={{ background: '#EDFAF4', color: '#1A6E3E' }}>Kết quả: &quot;{newResult}&quot;</div>
      </div>
    </div>
  );
}
