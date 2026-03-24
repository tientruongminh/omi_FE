# Entities Layer — Business Objects

> **Layer 5** trong FSD. Chứa các khái niệm nghiệp vụ cốt lõi: interfaces, Zustand store, mock data, và presentational UI components.
>
> **Quy tắc:** Entity chỉ import `shared/`. Không import entity khác, không import features hay widgets.

---

## Tổng quan

```
entities/
├── project/           # Dự án học tập — store Zustand trung tâm
├── node/              # Canvas node — types, styles, UI components
├── dashboard/         # Thống kê học tập — stat cards, sessions
├── learning-content/  # Nội dung học — documents, quiz, flashcard
└── session/           # Phiên học tập — placeholder
```

---

## `entities/project/`

Đại diện cho dự án học tập — đơn vị tổ chức cao nhất trong OmiLearn.

### `model/types.ts`

```ts
export interface Project {
  id: string;
  title: string;
  description: string;
  date: string;
  progress?: number;    // 0–100, undefined = hoàn thành
  isComplete?: boolean;
  isB2B?: boolean;      // Cờ khoá học nhóm/doanh nghiệp
}

export interface ProjectMember {
  id: string;
  name: string;
  initials: string;     // Viết tắt tên, hiển thị trong avatar
  color: string;        // Màu hex cho avatar
  role: 'owner' | 'editor' | 'viewer';
}

export interface SharedCourse {
  id: string;
  title: string;
  sharedBy: string;     // Tên người chia sẻ
  timeAgo: string;      // Thời gian tương đối: "2 giờ trước"
}
```

### `model/store.ts`

Zustand store trung tâm quản lý toàn bộ trạng thái dự án.

```ts
import { create } from 'zustand';
import { Project } from './types';

interface OmiLearnState {
  projects: Project[];
  currentProject: Project | null;
  isCreateModalOpen: boolean;
  isPlanModalOpen: boolean;
  hasPlan: boolean;

  // Actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createProject: (name: string, description: string) => string; // trả về id mới
  setCurrentProject: (id: string) => void;
  openPlanModal: () => void;
  closePlanModal: () => void;
  setPlanComplete: () => void;
}

export const useOmiLearnStore = create<OmiLearnState>((set, get) => ({ ... }));
```

**Chi tiết hành vi:**

| Action | Mô tả |
|--------|-------|
| `createProject(name, desc)` | Tạo project mới với id slug tự sinh (lowercase + timestamp), thêm vào đầu danh sách, đóng modal, trả về id |
| `setCurrentProject(id)` | Tìm project theo id, set vào `currentProject` |
| `setPlanComplete()` | Set `hasPlan = true`, đóng plan modal |

**Import:**

```ts
import { useOmiLearnStore } from '@/entities/project';
// hoặc
import { useOmiLearnStore } from '@/entities/project/model/store';
```

### `data/mock.ts`

4 dự án CS mẫu tiếng Việt:

| id | title | progress | isB2B |
|----|-------|----------|-------|
| `'1'` | Hệ Điều Hành và Linux | 65% | `false` |
| `'2'` | Cấu Trúc Dữ Liệu và Giải Thuật | hoàn thành | `false` |
| `'3'` | Mạng Máy Tính | 40% | `true` |
| `'4'` | Trí Tuệ Nhân Tạo | 25% | `false` |

Ngoài ra còn có:
- `projectMembers`: 3 thành viên mẫu (Minh Anh/editor, Hoàng Nam/viewer, Thu Lan/editor)
- `sharedCourses`: 3 khoá học đã chia sẻ

**Import:**

```ts
import { projects, projectMembers, sharedCourses } from '@/entities/project';
```

### `index.ts` — Barrel export

```ts
export type { Project, ProjectMember, SharedCourse } from './model/types';
export { projects, sharedCourses, projectMembers } from './data/mock';
export { useOmiLearnStore } from './model/store';
```

### Consumed by

- `features/create-project` — dùng `useOmiLearnStore` để tạo project, điều hướng
- `features/plan-survey` — dùng `useOmiLearnStore.setPlanComplete()`
- `widgets/chat-box` — dùng `projectMembers` để render danh sách thành viên
- `app/(main)/page.tsx` — dùng `projects` và `openCreateModal()`

---

## `entities/node/`

Định nghĩa các loại node trên Infinite Canvas — trái tim của trải nghiệm học tập.

### `model/types.ts`

#### `CanvasNode`

Node hiển thị trên canvas. 6 loại:

```ts
export interface CanvasNode {
  id: string;
  type: 'topic' | 'chapter' | 'document' | 'ai-response' | 'note' | 'synthesis';
  title: string;
  content?: string;       // Nội dung ghi chú / AI response
  summary?: string;       // Tóm tắt (dùng cho topic node)
  docType?: 'text' | 'video';
  docId?: string;         // Liên kết đến LearningDocument
  nodeId?: string;        // Liên kết đến MindmapNodeData
  x: number;              // Vị trí tuyệt đối trên canvas (px)
  y: number;
  width: number;
  height: number;
  parentId?: string;      // Hỗ trợ cây phân cấp
  color?: string;
  synthSourceIds?: string[]; // Ids các node nguồn cho synthesis
}
```

**Phân loại node theo mục đích:**

| Type | Màu nền | Viền | Dùng cho |
|------|---------|------|----------|
| `topic` | `#E8D5F5` | `#A855F7` | Chủ đề chính / gốc của mindmap |
| `chapter` | `#EDFAF4` | `#3DBE7A` | Chương / đơn vị học |
| `document` | `#FFFFFF` | `#E5DDD5` | Tài liệu cụ thể (PDF/video) |
| `ai-response` | `#EEF2FF` | `#818CF8` | Câu trả lời từ AI |
| `note` | `#FFFDE7` | `#F59E0B` | Ghi chú của người dùng |
| `synthesis` | `#FFFFFF` | gradient purple→green | Node tổng hợp nhiều nguồn |

#### `CanvasEdge`

```ts
export interface CanvasEdge {
  from: string;  // nodeId nguồn
  to: string;    // nodeId đích
}
```

#### `NODE_STYLES` và `EDGE_COLORS`

```ts
export const NODE_STYLES: Record<CanvasNode['type'], {
  bg: string; border: string; textColor: string;
}> = {
  topic:         { bg: '#E8D5F5', border: '#A855F7', textColor: '#4C1D95' },
  chapter:       { bg: '#EDFAF4', border: '#3DBE7A', textColor: '#1A4731' },
  document:      { bg: '#FFFFFF', border: '#E5DDD5', textColor: '#2D2D2D' },
  'ai-response': { bg: '#EEF2FF', border: '#818CF8', textColor: '#3730A3' },
  note:          { bg: '#FFFDE7', border: '#F59E0B', textColor: '#92400E' },
  synthesis:     { bg: '#FFFFFF', border: '#A855F7', textColor: '#2D2D2D' },
};

export const EDGE_COLORS: Record<CanvasNode['type'], string> = { ... };
```

#### Các interface phụ

```ts
export interface MindMapNode {
  id: string;
  label: string;
  type: 'root' | 'child';
  expanded?: boolean;
}

export interface ContentCard {
  id: string;
  type: 'video' | 'pdf';
  title: string;
  tags: Array<{ label: string; color: 'green' | 'coral' }>;
}

export interface RoadmapNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface RoadmapEdge {
  id: string;
  from: string;
  to: string;
}
```

### `data/mock.ts`

Default layout cho roadmap Hệ Điều Hành:

```ts
export const defaultRoadmapNodes: RoadmapNode[] = [
  { id: 'n1', label: 'Khái Niệm Cơ Bản',      x: 300, y: 60  },
  { id: 'n2', label: 'Kiến Trúc Hệ Thống',    x: 300, y: 160 },
  { id: 'n3', label: 'Quản Lý Tài Nguyên',    x: 100, y: 280 },
  { id: 'n4', label: 'Giao Diện Người Dùng',  x: 500, y: 280 },
  { id: 'n5', label: 'Hệ Điều Hành Phổ Biến', x: 100, y: 400 },
  { id: 'n6', label: 'Lập Trình Shell',        x: 500, y: 400 },
  { id: 'n7', label: 'Khởi Động và Debug',     x: 300, y: 500 },
];

export const defaultRoadmapEdges: RoadmapEdge[] = [
  { id: 'e1-2', from: 'n1', to: 'n2' },
  // ... cây 7 nút kết nối nhau
];
```

Cấu trúc cây: n1 → n2 → { n3, n4 } → { n5, n6 } → n7

### `ui/CanvasNode.tsx`

Component render một node trên canvas. Dùng Framer Motion cho animation và xử lý drag nội bộ.

**Props:**

```ts
interface Props {
  node: CanvasNode;
  isExpanded: boolean;          // Node đang được mở rộng → opacity 0.6
  isFocused: boolean;           // Node đang được focus → outline + shadow mạnh
  onDrag: (id: string, dx: number, dy: number) => void;
  onClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, node: CanvasNode) => void;
  scale: number;                // Canvas scale hiện tại, dùng để chuẩn hoá drag delta
  collapsedChildCount?: number; // Số con bị ẩn khi thu gọn, hiển thị qua NodeBadge
}
```

**Hành vi:**
- Click trái: gọi `onClick` (chỉ nếu không drag)
- Click phải: gọi `onContextMenu`
- Drag: cập nhật vị trí realtime qua mouse events, delta được chia cho `scale`
- Synthesis node: render gradient border đặc biệt (`linear-gradient` purple→green)
- Topic node có `summary`: hiển thị tóm tắt 2 dòng bên dưới tiêu đề

**Import:**

```ts
import CanvasNode from '@/entities/node/ui/CanvasNode';
```

### `ui/NodeIcon.tsx`

```ts
interface Props {
  type: CanvasNode['type'];
  docType?: 'text' | 'video';
}
```

Render icon SVG/emoji tương ứng mỗi loại node:
- `synthesis` → `⬡` (hexagon, màu purple-500)
- `document` (video) → `▶`; `document` (text) → `◎`
- `ai-response` → `AI`
- `note` → `✎`
- `topic` → `◆`

### `ui/NodeBadge.tsx`

```ts
interface Props {
  count: number;      // Số con bị ẩn
  textColor: string;  // Kế thừa màu text từ NODE_STYLES
}
```

Hiển thị badge `+N` khi node đang thu gọn và có con bị ẩn. Tự ẩn khi `count <= 0`.

### Consumed by

- `widgets/infinite-canvas` — render tất cả nodes, xử lý drag/click/context menu
- `widgets/roadmap-graph` — dùng `RoadmapNode`, `RoadmapEdge` types

---

## `entities/dashboard/`

Dữ liệu thống kê tiến độ học tập.

### `model/types.ts`

```ts
export interface DashboardStat {
  label: string;      // Tên chỉ số
  percentage: number; // 0–100
  color: string;      // Màu hex cho thanh tiến trình và số
}

export interface StudySession {
  id: string;
  title: string;      // Tên buổi học
  date: string;       // "Thứ 2, 08:00 - 10:00"
  duration: string;   // "2 giờ"
  day: string;        // Viết tắt: "T2", "T4", "T6"
  unitId?: string;    // Nếu có, link trực tiếp đến unit
}
```

### `data/mock.ts`

**4 chỉ số kỹ năng học tập:**

| label | percentage | color |
|-------|-----------|-------|
| Phân tích | 78% | `#818CF8` (indigo) |
| Tổng hợp | 65% | `#4CD964` (green) |
| Phản biện | 52% | `#F97316` (orange) |
| Phỏng vấn | 40% | `#A78BFA` (violet) |

**3 buổi học sắp tới:**
- Quản Lý Tiến Trình — Thứ 2 08:00 (unitId: `quan-ly`)
- Hệ Thống File Linux — Thứ 4 14:00 (unitId: `khoi-dong`)
- Lập Trình Shell Bash — Thứ 6 10:00 (unitId: `lap-trinh-shell`)

### `ui/StatCard.tsx`

```ts
interface Props {
  stat: DashboardStat;
  index: number;       // Dùng để stagger animation (delay = index * 0.1s)
  accentColor: string; // Màu dải top của card (khác `stat.color` để tạo contrast)
}
```

Card hiển thị 1 chỉ số thống kê. Có dải màu trên cùng, label, số %, và ProgressBar Framer Motion. Stagger animation theo `index`.

### `ui/CircularProgress.tsx`

```ts
interface Props {
  percentage: number; // 0–100, dùng để tính strokeDashoffset
  units: number;      // Số unit đã hoàn thành
  total: number;      // Tổng số units
}
```

SVG circular progress ring 196×196px. Radius 78, stroke-width 14. Màu `#4CD964`. Animation stroke Framer Motion (duration 1.4s, delay 0.3s). Hiển thị `percentage%` và `units/total units` ở giữa.

### `ui/SessionCard.tsx`

```ts
interface Props {
  session: StudySession;
  projectId: string;
}
```

Card dẫn đến route học tập:
- Có `unitId`: `/learn?unit=${session.unitId}&project=${projectId}`
- Không có `unitId`: `/learn?project=${projectId}`

Hover effect: border đổi màu `#6B2D3E`, text đổi màu, hiện "Học →" ở phải.

### Consumed by

- `widgets/project-dashboard/ui/StatGrid.tsx` — render grid 4 StatCards
- `widgets/project-dashboard/ui/SessionList.tsx` — render danh sách SessionCards

---

## `entities/learning-content/`

Kho dữ liệu nội dung học tập phong phú — xương sống của tính năng dạy học.

### `model/types.ts`

```ts
// Tài liệu học tập (PDF, video, worksheet)
export interface LearningDocument {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'worksheet';
  size?: string;     // "12 trang"
  duration?: string; // "45 phút"
}

// Node trong mindmap / sidebar
export interface ContentNode {
  id: string;
  label: string;
  type: 'video' | 'pdf' | 'quiz';
  docId: string;
}

// Dữ liệu cho 1 node trong mindmap (có documents)
export interface MindmapNodeData {
  id: string;
  label: string;
  subtitle: string;
  documents: LearningDocument[];
}

// Quiz
export interface QuizOption {
  label: string;  // "A", "B", "C", "D"
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string; // Giải thích đáp án đúng
}

// Flashcard
export interface Flashcard {
  id: string;
  front: string;  // Câu hỏi
  back: string;   // Câu trả lời
}

// Tự luận
export interface EssayQuestion {
  id: string;
  question: string;
}

// Dạy AI
export interface TeachAIPrompt {
  id: string;
  topic: string;
  aiQuestion: string; // AI đóng vai học sinh hỏi người dùng
}

// Chat nhóm
export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
}

// AI response cache
export interface AIResponse {
  question: string;
  answer: string;
}
```

### `data/mock.ts`

Dữ liệu phong phú cho khoá học **Hệ Điều Hành và Linux**:

**`mindmapNodes`** — 7 đơn vị học:

| id | label | Số tài liệu |
|----|-------|-------------|
| `khai-niem` | Khái Niệm Cơ Bản | 4 (1 video, 2 pdf, 1 worksheet) |
| `kien-truc` | Kiến Trúc Hệ Thống | 3 |
| `quan-ly` | Quản Lý Tài Nguyên | 3 (2 video, 1 pdf) |
| `giao-dien` | Giao Diện Người Dùng | 5 |
| `he-dieu-hanh` | Hệ Điều Hành Phổ Biến | 3 |
| `lap-trinh-shell` | Lập Trình Shell | 4 |
| `khoi-dong` | Khởi Động và Debug | 3 |

**`documentTextContent`** — Nội dung văn bản cho 5 tài liệu (`gd-2`, `gd-4`, `kn-2`, `ql-2`, `sh-2`). Mỗi tài liệu gồm 4–6 đoạn tiếng Việt chi tiết về lịch sử GUI, Window Manager, lịch sử OS, virtual memory, và Linux commands.

**`videoTranscripts`** — Transcript cho 7 video (`gd-1`, `gd-3`, `kn-1`, `ql-1`, `sh-1`, `kd-1`, `hdh-1`).

**`quizQuestions`** — 5 câu hỏi trắc nghiệm về:
1. Máy tính đầu tiên có GUI (đáp án: Xerox Alto 1973)
2. Linux Kernel được viết bởi ai năm nào (Linus Torvalds, 1991)
3. Lệnh liệt kê file trong Linux (`ls`)
4. Trạng thái process đang chờ I/O (Waiting/Blocked)
5. GRUB là gì (Bootloader)

**`flashcards`** — 8 thẻ về: Desktop Metaphor, CLI, Kernel, Process vs Thread, Virtual Memory, Wayland vs X11, System Call, BASH Shebang.

**`essayQuestion`** — 1 câu tự luận: "Phân tích ưu nhược điểm GUI vs CLI trong quản trị Linux."

**`teachAIPrompt`** — AI hỏi người dùng giải thích về Process Scheduling.

**`aiResponses`** — 6 cặp Q&A cache cho NodeAIChat: GUI ra đời, CLI vs GUI, Kernel Linux, Process Scheduling, Xerox PARC, Linux Boot Process.

**`suggestedQuestions`** — 4 gợi ý câu hỏi cho chat panel.

**`groupChatMessages`** — 4 tin nhắn nhóm mẫu.

**`unitSummaries`** — Tóm tắt AI cho 7 đơn vị (key = nodeId).

**`additionalUnits`** + **`nearbyUnits`** — 5 đơn vị bổ sung (Bảo Mật, Networking, Docker, Server Admin, CI/CD).

**Import:**

```ts
import {
  mindmapNodes,
  quizQuestions,
  flashcards,
  essayQuestion,
  teachAIPrompt,
  aiResponses,
  suggestedQuestions,
  groupChatMessages,
  documentTextContent,
  videoTranscripts,
  unitSummaries,
  additionalUnits,
} from '@/entities/learning-content';
```

### Consumed by

- `widgets/infinite-canvas` — `mindmapNodes`, `documentTextContent`, `videoTranscripts`, `unitSummaries`, `additionalUnits`
- `features/node-review` — `quizQuestions`, `flashcards`, `essayQuestion`, `teachAIPrompt`
- `features/node-ai-chat` — `aiResponses`, `suggestedQuestions`
- `widgets/chat-box` — `groupChatMessages`

---

## `entities/session/`

Entity tối giản — placeholder cho tracking phiên học tập tương lai.

### `model/types.ts`

```ts
export interface StudySession {
  id: string;
  title: string;   // Tên buổi học
  date: string;    // Mô tả thời gian
  duration: string; // "2 giờ"
  day: string;     // "T2", "T4"...
  unitId?: string; // Liên kết unit nếu có
}
```

> **Lưu ý:** Interface này trùng với `StudySession` trong `entities/dashboard/`. Đây là entity riêng biệt, sẽ được phát triển độc lập khi có tính năng session tracking thực (persist, analytics).

### `index.ts`

```ts
export type { StudySession } from './model/types';
```

---

## Import Summary

```ts
// Project store và types
import { useOmiLearnStore, projects, projectMembers } from '@/entities/project';
import type { Project, ProjectMember } from '@/entities/project';

// Node types và styles
import type { CanvasNode, CanvasEdge, RoadmapNode } from '@/entities/node';
import { NODE_STYLES, EDGE_COLORS, defaultRoadmapNodes } from '@/entities/node';
import CanvasNodeComponent from '@/entities/node/ui/CanvasNode';

// Dashboard stats
import { dashboardStats, upcomingStudySessions } from '@/entities/dashboard';
import type { DashboardStat, StudySession } from '@/entities/dashboard';

// Learning content
import { mindmapNodes, quizQuestions, flashcards } from '@/entities/learning-content';
import type { LearningDocument, QuizQuestion } from '@/entities/learning-content';
```
