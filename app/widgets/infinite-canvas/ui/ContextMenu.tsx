'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenuState } from '../model/types';
import ContextMenuItem from './ContextMenuItem';
import { mindmapNodes, additionalUnits } from '@/entities/learning-content';

interface Props {
  menu: ContextMenuState;
  onAction: (action: string, nodeId?: string) => void;
  onClose: () => void;
  onShowAddUnit: () => void;
  onAddUnitDirect: (unitId: string, unitLabel: string, cx: number, cy: number) => void;
}

export default function ContextMenu({ menu, onAction, onClose, onShowAddUnit, onAddUnitDirect }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const allUnits = useMemo(() => [
    ...mindmapNodes.map((n) => ({ id: n.id, label: n.label })),
    ...additionalUnits.map((u) => ({ id: u.id, label: u.label })),
  ], []);

  const items = useMemo(() => {
    if (!menu.nodeId) {
      return [
        { label: 'Thêm đơn vị bài học', action: 'add-unit', hasSubmenu: true },
        { label: 'Thêm ghi chú', action: 'add-note' },
        { label: 'Tạo node tổng hợp', action: 'add-synthesis' },
      ];
    }
    const base: { label: string; action: string; danger?: boolean; hasSubmenu?: boolean }[] = [];
    switch (menu.nodeType) {
      case 'topic': case 'chapter':
        base.push(
          { label: 'AI Hỏi đáp', action: 'ai-chat' },
          { label: 'AI Ôn tập', action: 'ai-review' },
          { label: 'Thêm tài liệu', action: 'add-document' },
        );
        break;
      case 'document': base.push({ label: 'AI Hỏi đáp', action: 'ai-chat' }, { label: 'AI Ôn tập', action: 'ai-review' }, { label: 'Mở đọc', action: 'open-read' }); break;
      case 'synthesis': base.push({ label: 'Mở tổng hợp', action: 'open-read' }); break;
      case 'ai-chat': case 'ai-review': case 'note': base.push({ label: 'AI Hỏi đáp', action: 'ai-chat' }, { label: 'AI Ôn tập', action: 'ai-review' }); break;
    }
    if (menu.hasChildren) {
      base.push(menu.isCollapsed ? { label: 'Mở rộng', action: 'expand-node' } : { label: 'Thu gọn', action: 'collapse-node' });
    }
    base.push({ label: 'Xóa', action: 'delete-node', danger: true });
    return base;
  }, [menu]);

  useEffect(() => {
    const close = () => onClose();
    setTimeout(() => document.addEventListener('click', close), 0);
    return () => document.removeEventListener('click', close);
  }, [onClose]);

  const handleUnitSelect = useCallback((unit: { id: string; label: string }) => {
    const cx = menu.canvasX ?? 500;
    const cy = menu.canvasY ?? 350;
    onAddUnitDirect(unit.id, unit.label, cx, cy);
    onClose();
  }, [menu, onAddUnitDirect, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className="fixed z-[70] bg-white border-2 border-[#333333] rounded-xl shadow-2xl py-2 min-w-[200px]"
      style={{ left: menu.x, top: menu.y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item) => (
        <div
          key={item.action}
          className="relative"
          onMouseEnter={() => item.hasSubmenu ? setHoveredItem(item.action) : setHoveredItem(null)}
          onMouseLeave={() => item.hasSubmenu ? undefined : setHoveredItem(null)}
        >
          <ContextMenuItem
            label={item.label}
            danger={item.danger}
            hasSubmenu={item.hasSubmenu}
            onClick={() => {
              if (item.hasSubmenu) return;
              if (item.action === 'add-unit') { onShowAddUnit(); }
              else { onAction(item.action, menu.nodeId); onClose(); }
            }}
          />
          {/* Submenu for units */}
          <AnimatePresence>
            {item.hasSubmenu && hoveredItem === item.action && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="absolute left-full top-0 ml-1 bg-white border-2 border-[#333333] rounded-xl shadow-2xl py-2 overflow-hidden"
                style={{ width: 240, maxHeight: 320 }}
                onMouseEnter={() => setHoveredItem(item.action)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="px-3 py-2 border-b border-[#E5E5DF]">
                  <p className="text-[10px] font-bold text-[#5A5C58] uppercase tracking-wider">Chọn chủ đề</p>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 270 }}>
                  {allUnits.map((unit) => (
                    <button
                      key={unit.id}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#2D2D2D] hover:bg-[#F5F0EB] transition-colors"
                      onClick={() => handleUnitSelect(unit)}
                    >
                      {unit.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}
