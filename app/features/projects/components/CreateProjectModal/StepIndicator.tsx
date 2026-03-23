'use client';

import { Check } from 'lucide-react';

interface Props {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 3 }: Props) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${s === currentStep ? 'bg-[#2D2D2D] text-white border-[#2D2D2D]' : s < currentStep ? 'bg-[#4CD964] text-[#2D2D2D] border-[#4CD964]' : 'bg-transparent text-[#5A5C58] border-[#CCCCCC]'}`}>
            {s < currentStep ? <Check size={10} strokeWidth={3} /> : s}
          </div>
          {s < totalSteps && <div className={`w-8 h-0.5 ${s < currentStep ? 'bg-[#4CD964]' : 'bg-[#CCCCCC]'}`} />}
        </div>
      ))}
    </div>
  );
}
