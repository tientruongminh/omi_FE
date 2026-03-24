'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ContextMenuState } from '../model/types';
import ContextMenuItem from './ContextMenuItem';

interface Props {
  menu: ContextMenuState;
  onAction: (action: string, nodeId?: string) => void;
  onClose: () => void;
  onShowAddUnit: () => void;
}

export default function ContextMenu({ menu, onAction, onClose, onShowAddUnit }: Props) {
  const items = useMemo(() => {
    if (!menu.nodeId) {
      return [
        { label: 'Thêm chủ đề mới', action: 'add-topic' },
        { label: 'Thêm ghi chú', action: 'add-note' },
        { label: 'Thêm đơn vị bài học', action: 'add-unit' },
        { label: 'Tạo node tổng hợp', action: 'add-synthesis' },
      ];
    }
    const base: { label: string; action: string; danger?: boolean }[] = [];
    switch (menu.nodeType) {
      case 'topic': base.push({ label: 'Mở tài liệu', action: 'open-read' }); break;
      case 'chapter': base.push({ label: 'Thêm tài liệu', action: 'add-document' }, { label: 'Đổi màu', action: 'change-color' }); break;
      case 'document': base.push({ label: 'AI Ôn tập', action: 'ai-review' }, { label: 'AI Hỏi đáp', action: 'ai-chat' }, { label: 'Mở đọc', action: 'open-read' }); break;
      case 'synthesis': base.push({ label: 'Mở tổng hợp', action: 'open-read' }); break;
      case 'ai-response': case 'note': base.push({ label: 'Tạo node kế thừa', action: 'create-child' }); break;
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
        <ContextMenuItem
          key={item.action}
          label={item.label}
          danger={item.danger}
          onClick={() => {
            if (item.action === 'add-unit') { onShowAddUnit(); }
            else { onAction(item.action, menu.nodeId); onClose(); }
          }}
        />
      ))}
    </motion.div>
  );
}
