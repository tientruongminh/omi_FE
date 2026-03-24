'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface DocSuggestion {
  id: string;
  title: string;
}

interface DocSuggestionProps {
  doc: DocSuggestion;
  selected: boolean;
  onToggle: () => void;
}

export function DocSuggestion({ doc, selected, onToggle }: DocSuggestionProps) {
  return (
    <label className="flex items-start gap-2 cursor-pointer group">
      <div onClick={onToggle}
        className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected ? 'bg-[#4CD964] border-[#4CD964]' : 'border-[#CCCCCC]'}`}>
        {selected && <Check size={8} strokeWidth={3} className="text-[#2D2D2D]" />}
      </div>
      <span className="text-xs text-[#2D2D2D] leading-relaxed group-hover:text-[#6B2D3E] transition-colors">{doc.title}</span>
    </label>
  );
}

interface DocSuggestionListProps {
  docs: DocSuggestion[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}

export function DocSuggestionList({ docs, selected, onToggle }: DocSuggestionListProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ml-9 space-y-2">
      {docs.map((doc) => (
        <DocSuggestion key={doc.id} doc={doc} selected={selected.has(doc.id)} onToggle={() => onToggle(doc.id)} />
      ))}
    </motion.div>
  );
}
