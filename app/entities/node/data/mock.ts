import { RoadmapNode, RoadmapEdge } from '../model/types';

export const defaultRoadmapNodes: RoadmapNode[] = [
  { id: 'n1', label: 'Khái Niệm Cơ Bản', x: 300, y: 60 },
  { id: 'n2', label: 'Kiến Trúc Hệ Thống', x: 300, y: 160 },
  { id: 'n3', label: 'Quản Lý Tài Nguyên', x: 100, y: 280 },
  { id: 'n4', label: 'Giao Diện Người Dùng', x: 500, y: 280 },
  { id: 'n5', label: 'Hệ Điều Hành Phổ Biến', x: 100, y: 400 },
  { id: 'n6', label: 'Lập Trình Shell', x: 500, y: 400 },
  { id: 'n7', label: 'Khởi Động và Debug', x: 300, y: 500 },
];

export const defaultRoadmapEdges: RoadmapEdge[] = [
  { id: 'e1-2', from: 'n1', to: 'n2' },
  { id: 'e2-3', from: 'n2', to: 'n3' },
  { id: 'e2-4', from: 'n2', to: 'n4' },
  { id: 'e3-5', from: 'n3', to: 'n5' },
  { id: 'e4-6', from: 'n4', to: 'n6' },
  { id: 'e5-7', from: 'n5', to: 'n7' },
  { id: 'e6-7', from: 'n6', to: 'n7' },
];
