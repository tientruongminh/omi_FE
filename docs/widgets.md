# Widgets Layer — Composite Blocks

> **Layer 3** trong FSD. Các khối UI lớn, kết hợp nhiều entities và features. Mỗi widget là một "mini-app" độc lập.
>
> **Quy tắc:** Widget import entities và shared (xuống dưới). Widget **không** import widget khác (không ngang). Widget **không** bị import bởi entities/features (không đi lên).

---

## Tổng quan

```
widgets/
├── infinite-canvas/    # Canvas học tập chính (21 UI + 3 hooks + types + constants)
├── chat-box/           # Chat nhóm cộng tác (6 files)
├── project-dashboard/  # Dashboard tiến độ (5 files)
├── header/             # TopNavBar điều hướng
├── footer/             # Footer đơn giản
├── landing-page/       # Trang giới thiệu (13 files)
└── roadmap-graph/      # Graph lộ trình học tập
```

---

## `widgets/infinite-canvas/`

Widget phức tạp nhất — không gian làm việc học tập chính của OmiLearn.

### `model/types.ts`

Types dành riêng cho widget (tái export entity types + định nghĩa UI state):

```ts
// Re-export từ entities/node
export type { CanvasNode, CanvasEdge } from '@/entities/node/model/types';
export { NODE_STYLES, EDGE_COLORS } from '@/entities/node/model/types';

// UI state: trạng thái context menu
export interface ContextMenuState {
  x: number;       // Toạ độ màn hình
  y: number;
  canvasX?: number; // Toạ độ trên canvas (để tạo node mới tại điểm click)
  canvasY?: number;
  nodeId?: string;  // undefined = click vào canvas trống
  nodeType?: string;
  hasChildren?: boolean;
  isCollapsed?: boolean;
}

// UI state: toolbar khi bôi chọn text
export interface SelectionToolbarState {
  x: number;
  y: number;
  text: string;         // Đoạn text đã chọn
  sourceNodeId: string; // Node chứa text
}

// Node UI trong sidebar
export interface ContentNodeUI {
  id: string;
  label: string;
  icon: string;   // Emoji icon
  color: string;
  border: string;
  docId: string;
}

// Transform: pan + zoom state
export interface Transform {
  x: number;
  y: number;
  scale: number;
}
```

### `model/constants.ts`

```ts
export const CANVAS_W = 3000; // px
export const CANVAS_H = 2400; // px
```

### Hooks

#### `lib/useCanvasTransform.ts`

Pan và zoom cho canvas.

```ts
export function useCanvasTransform(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  // Returns:
  return {
    transform: Transform,
    transformRef: React.MutableRefObject<Transform>,
    isPanning: React.MutableRefObject<boolean>,
    handleMouseDown: (e: React.MouseEvent) => void,
    handleMouseMove: (e: React.MouseEvent) => void,
    handleMouseUp: () => void,
    zoomIn: () => void,   // scale *= 1.2 (max 2.5)
    zoomOut: () => void,  // scale /= 1.2 (min 0.3)
    resetView: () => void, // { x:0, y:0, scale:1 }
  };
}
```

**Pan logic:** MouseDown trên canvas (không phải node) → bắt đầu pan. MouseMove → delta x/y cộng vào transform. Chỉ pan khi không click vào `[data-node-id]`.

**Zoom logic:** `wheel` event (passive: false để preventDefault). `deltaY > 0` → thu nhỏ (×0.92), `deltaY < 0` → phóng to (×1.08). Giới hạn 0.3–2.5.

#### `lib/useCanvasNodes.ts`

CRUD operations cho nodes và edges, plus collapse/expand logic.

```ts
export function useCanvasNodes(
  initialNodes: CanvasNode[],
  initialEdges: CanvasEdge[]
) {
  // Returns:
  return {
    nodes: CanvasNode[],
    setNodes: Dispatch<SetStateAction<CanvasNode[]>>,
    edges: CanvasEdge[],
    setEdges: Dispatch<SetStateAction<CanvasEdge[]>>,
    collapsedNodeIds: Set<string>,
    genId: () => string,               // `node-${Date.now()}-${random5}`
    getAllDescendantIds: (nodeId: string) => string[],
    isNodeHidden: (nodeId: string) => boolean,  // true nếu cha bị collapse
    hasChildren: (nodeId: string) => boolean,
    toggleCollapse: (nodeId: string) => void,
    deleteNode: (nodeId: string) => void,       // xoá node + edges liên quan
    addNode: (node: CanvasNode) => void,
    addEdge: (edge: CanvasEdge) => void,
  };
}
```

**Collapse logic:** `isNodeHidden` duyệt ngược từ node lên đến root; nếu bất kỳ cha nào trong `collapsedNodeIds` → node bị ẩn.

**`getAllDescendantIds`:** BFS tìm tất cả con cháu của một node.

#### `lib/useNodeDrag.ts`

Xử lý drag & drop node.

```ts
export function useNodeDrag(
  setNodes: React.Dispatch<React.SetStateAction<CanvasNode[]>>
) {
  return {
    handleNodeDrag: (id: string, dx: number, dy: number) => void
    // Cập nhật x/y của node theo delta, delta đã được chuẩn hoá bởi scale
  };
}
```

### `ui/InfiniteCanvas.tsx` (276 dòng)

Component gốc của widget. Xử lý toàn bộ canvas interactions.

**Props:**

```ts
interface Props {
  unitId?: string;      // Nếu có → build layout cho unit cụ thể
  projectId?: string;
  onNodeClickForSidebar?: (nodeId: string, canvasNodeId: string) => void;
  onOpenDocument?: (docId: string, nodeId: string) => void;
}
```

**Helper functions (exported):**

```ts
// Tạo layout cho 1 đơn vị học (1 topic node giữa trung tâm)
export function buildUnitLayout(unitId: string): { nodes: CanvasNode[]; edges: CanvasEdge[] }

// Tạo layout đầy đủ cho toàn bộ mindmap (topic gốc + 7 chapter nodes theo hình sao)
export function buildInitialNodes(): { nodes: CanvasNode[]; edges: CanvasEdge[] }
```

**Layout `buildInitialNodes`:** Topic gốc ở tâm (600, 400). 7 chapter nodes xung quanh với RADIUS=270 theo góc: `-90°, -45°, 0°, 45°, 90°, 135°, 180°`.

**Xử lý context menu actions:**

| Action | Kết quả |
|--------|---------|
| `add-topic` | Tạo topic node tại vị trí click |
| `add-note` | Tạo note node |
| `add-synthesis` | Tạo synthesis node (synthSourceIds = expandedNodeIds) |
| `ai-chat` | Mở expanded view AI chat cho node |
| `ai-review` | Mở expanded view review cho node |
| `open-read` | Mở expanded doc view |
| `collapse-node` / `expand-node` | Toggle collapse qua `toggleCollapse` |
| `delete-node` | Gọi `deleteNode` |
| `add-unit` | Mở `AddUnitMenu` |

**Entities dùng:**
- `mindmapNodes`, `documentTextContent`, `videoTranscripts`, `unitSummaries`, `additionalUnits` từ `@/entities/learning-content`
- `CanvasNode`, `CanvasEdge`, `NODE_STYLES` từ `@/entities/node`

### `ui/ContextMenu.tsx` + `ui/ContextMenuItem.tsx`

**Props ContextMenu:**

```ts
interface Props {
  menu: ContextMenuState;
  onAction: (action: string, nodeId?: string) => void;
  onClose: () => void;
  onShowAddUnit: () => void;
}
```

**Items động theo context:**
- Click canvas trống: 4 options (thêm chủ đề, ghi chú, đơn vị, tổng hợp)
- Node `topic`: "Mở tài liệu"
- Node `chapter`: "Thêm tài liệu", "Đổi màu"
- Node `document`: "AI Ôn tập", "AI Hỏi đáp", "Mở đọc"
- Node `synthesis`: "Mở tổng hợp"
- Node `ai-response`/`note`: "Tạo node kế thừa"
- Nếu `hasChildren`: "Thu gọn" hoặc "Mở rộng"
- Luôn có: "Xóa" (danger, màu đỏ)

Menu tự đóng khi click ngoài (event listener `setTimeout` để tránh race condition).

### `ui/ExpandedNodeView.tsx`

Router cho expanded content — phân loại theo node type.

**Props:**

```ts
interface Props {
  node: CanvasNode | null;
  allNodes: CanvasNode[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
}
```

**Routing:**
- `note` → `ExpandedNoteContent`
- `ai-response` → `ExpandedAIContent`
- `synthesis` → `ExpandedSynthesisContent`
- `document` / `chapter` / `topic` → `ExpandedDocContent`

Animation: slide in từ phải (`x: 60 → 0`), slide out về phải.

`ExpandedDocContent` — Tích hợp `NodeAIChat` (feature) cho document và chapter nodes.

### `ui/SplitView.tsx`

Chia đôi canvas + expanded view.

**Props:**

```ts
interface Props {
  expandedNode: CanvasNode | null;
  allNodes: CanvasNode[];
  onClose: () => void;
  onCreateAINode: (nodeId: string, type: 'ai-response' | 'review') => void;
  leftPanel: React.ReactNode;
}
```

**Layout:**
- Không có expanded: canvas 100% width
- Có expanded: canvas 55% + expanded 45%
- Transition width với Framer Motion 0.3s easeInOut

### `ui/DocumentSidebar.tsx` (168 dòng)

Sidebar duyệt tài liệu theo unit — mở từ chapter node.

**Props:**

```ts
interface Props {
  nodeId: string | null;          // ID của chapter (vd: 'giao-dien')
  onClose: () => void;
  onApply: (nodeId: string, contentNodes: ContentNodeUI[]) => void;
  onOpenDocument: (docId: string, nodeId: string) => void;
}
```

**Hành vi:**
- Tìm `MindmapNodeData` theo `nodeId`
- Render danh sách documents với icon (▶ video, ✎ worksheet, ◎ pdf)
- Checkbox chọn documents để thêm vào canvas
- Nút "Áp dụng" → gọi `onApply` với `ContentNodeUI[]` đã chọn
- Nút click từng document → `onOpenDocument` → mở expanded view

**Entities dùng:**
- `mindmapNodes`, `LearningDocument` từ `@/entities/learning-content`

### `ui/ZoomControls.tsx` + `ui/ZoomIndicator.tsx`

```ts
// ZoomControls
interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

// ZoomIndicator
interface Props {
  scale: number; // Hiển thị dạng "75%" hoặc "100%"
}
```

### `ui/SelectionToolbar.tsx`

Toolbar xuất hiện khi user bôi chọn text trong expanded view.

```ts
interface Props {
  toolbar: SelectionToolbarState;
  onCreateNote: (text: string, sourceNodeId: string) => void;
  onClose: () => void;
}
```

Hiển thị floating toolbar với nút "Tạo ghi chú" và "Tạo AI node" từ text đã chọn.

---

## `widgets/chat-box/`

Chat collaboration panel — hỗ trợ học nhóm real-time.

### `ChatBox.tsx` (117 dòng)

**Props:**

```ts
interface Props {
  isB2B?: boolean; // true → hiện panel "Thành viên" + "Mời"
}
```

**State:**

```ts
const [open, setOpen] = useState(false);
const [messages, setMessages] = useState(groupChatMessages);
const [input, setInput] = useState('');
const [badge, setBadge] = useState(2);      // Số tin nhắn chưa đọc
const [showInvite, setShowInvite] = useState(false);
```

**Hành vi:**
- Toggle button góc dưới phải: hiện/ẩn panel chat
- Khi mở: reset badge về 0, scroll xuống bottom
- Gửi tin nhắn: append vào messages với `sender: 'Bạn'`, `isMe: true`
- `isB2B = true`: hiện thêm icon "Thành viên" (Users icon) và "Mời" → `InviteModal`

**Layout khi mở:** 320×440px, border-radius 2xl, shadow 2xl

**Entities dùng:**
- `groupChatMessages` từ `@/entities/learning-content`
- `projectMembers` từ `@/entities/project`

### Các component con

| File | Vai trò |
|------|---------|
| `ChatInput.tsx` | Input text + nút gửi (Enter hoặc click) |
| `ChatMessage.tsx` | Bubble tin nhắn — phải nếu `isMe`, trái nếu người khác |
| `ChatToggleButton.tsx` | Nút tròn cố định góc dưới phải, có badge đỏ |
| `InviteModal.tsx` | Modal nhập email mời thành viên (mock) |
| `MemberList.tsx` | Danh sách thành viên với avatar màu |

---

## `widgets/project-dashboard/`

Dashboard hiển thị tiến độ học tập.

### `StatGrid.tsx`

```ts
interface Props {
  stats: DashboardStat[];
}
```

Grid 2 cột của `StatCard` entities. Truyền accent colors từ mảng cố định `['#4CD964', '#818CF8', '#F08080', '#F5A623']`.

```ts
import { DashboardStat } from '@/entities/dashboard';
import StatCard from '@/entities/dashboard/ui/StatCard';
```

### `SessionList.tsx`

Render danh sách `SessionCard` components (entity). Nhận `sessions: StudySession[]` và `projectId: string`.

### `WeekCalendar.tsx`

```ts
interface Props {
  activeDays: string[]; // ['T2', 'T4', 'T6']
}
```

Grid 7 ô (T2–CN). Ngày có lịch học: nền `#2D2D2D` + chấm xanh. Ngày trống: viền xám.

### `AnalysisPanel.tsx` (56 dòng)

Panel phân tích AI theo yêu cầu.

**Hành vi:**
- Mặc định: hiện nút "Phân tích sâu" + placeholder text
- Click → toggle `showAnalysis = true` → animate height 0→auto → stream `ANALYSIS_TEXT`
- Click lại → "Phân tích lại" → tăng `analysisKey` → `AIStreamText` reset và stream lại

`ANALYSIS_TEXT` mock: điểm mạnh (Khái Niệm Cơ Bản 95%, Kiến Trúc 88%), cần cải thiện (Shell 35%, Debug 20%), tiến độ 13/20 đơn vị.

**Shared dùng:**
- `AIStreamText` — stream phân tích

### `Breadcrumb.tsx`

Navigation breadcrumb đơn giản: hiển thị đường dẫn hiện tại dạng "Dự án / Dashboard / Tên dự án".

---

## `widgets/header/`

### `TopNavBar.tsx` (135 dòng)

Navigation bar cố định trên cùng.

**Không có props.** Tự đọc `pathname` bằng `usePathname()`.

**6 nav links:**

```ts
const NAV_LINKS = [
  { href: '/',           label: 'Dự án'    },
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/roadmap',    label: 'Roadmap'  },
  { href: '/learn',      label: 'Học tập'  },
  { href: '/schedule',   label: 'Lịch học' },
  { href: '/workspace',  label: 'Tài liệu' },
];
```

**Active detection:**
- Route `/`: exact match `pathname === '/'`
- Các route khác: `pathname.startsWith(href)`

**Active style:** `bg-[#2D2D2D] text-white` (pill đen)
**Hover style:** underline animation `scaleX 0→1` từ trái

**Right side controls:** Search input (expand on focus), Sun icon (theme toggle), User icon, mobile hamburger menu

**Mobile:** Nav links ẩn, hamburger → `mobileOpen` → AnimatePresence dropdown full-width

**Logo:** Link `/landing`, font Georgia italic, màu `#6B2D3E`

---

## `widgets/footer/`

### `Footer.tsx` (36 dòng)

Footer tối giản, không có props.

Hiển thị: Logo "omilearn", copyright, link "Điều khoản", "Bảo mật", "Liên hệ".

---

## `widgets/landing-page/`

Full landing page gồm 13 components. Render trong `app/landing/page.tsx`.

| Component | Vai trò |
|-----------|---------|
| `LandingNav.tsx` | Navigation bar landing (khác TopNavBar) |
| `CTAButton.tsx` | Call-to-action button với hover effect |
| `HeroSection.tsx` | Banner hero với headline + CTA + animated mockup |
| `InteractiveDemo.tsx` | Demo tương tác mini canvas |
| `ComparisonTable.tsx` | Bảng so sánh "Học truyền thống vs OmiLearn" |
| `ManifestoLine.tsx` | Animation từng dòng manifesto |
| `TestimonialCard.tsx` | Card đánh giá người dùng với avatar |
| `PricingCard.tsx` | Card gói giá (Free/Pro/Team) |
| `FeatureCard.tsx` | Card tính năng với icon + mô tả |
| `FooterCTA.tsx` | CTA section trước footer |
| `FAQItem.tsx` | Accordion FAQ item |
| `StatItem.tsx` | Số liệu thống kê (vd: "10,000+ người dùng") |
| `LandingFooter.tsx` | Footer landing đầy đủ với links |

Landing page không import entity nào — purely presentational.

---

## `widgets/roadmap-graph/`

### `RoadmapGraph.tsx` (309 dòng)

Interactive graph dạng sơ đồ lộ trình học tập.

**Props:**

```ts
interface Props {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  onNodesChange?: (nodes: RoadmapNode[]) => void;
  onEdgesChange?: (edges: RoadmapEdge[]) => void;
  onNodeClick?: (nodeId: string) => void; // nodeId của RoadmapNode
}
```

**Hành vi:**

1. **Render:** Mỗi node là hình chữ nhật (170×44px), kết nối bằng SVG paths
2. **Drag:** Kéo node bằng mouse — cập nhật `x/y` realtime, gọi `onNodesChange`
3. **Click:** Single click trên node → `onNodeClick(node.id)` → navigate học tập
4. **Double click:** Mở inline editor để sửa label
5. **Context menu (right-click):** Xoá node → cập nhật nodes + edges liên quan
6. **Add node:** Nút `+` → tạo node mới tại vị trí ngẫu nhiên

**Map to unit:**

```ts
const ROADMAP_TO_UNIT_MAP: Record<string, string> = {
  'n1': 'khai-niem',
  'n2': 'kien-truc',
  'n3': 'quan-ly',
  'n4': 'giao-dien',
  'n5': 'he-dieu-hanh',
  'n6': 'lap-trinh-shell',
  'n7': 'khoi-dong',
};
```

Click node → lookup `ROADMAP_TO_UNIT_MAP` → `onNodeClick(unitId)` → parent navigate `/learn?unit=${unitId}`

**Tooltip:** Hover node → hiện `mindmapNodes[unitId]?.subtitle` (từ entity)

**Entities dùng:**
- `RoadmapNode`, `RoadmapEdge` từ `@/entities/node`
- `mindmapNodes` từ `@/entities/learning-content` — lấy subtitle cho tooltip

---

## Import từ widgets

```ts
// Infinite canvas
import InfiniteCanvas from '@/widgets/infinite-canvas/ui/InfiniteCanvas';
// hoặc
import { buildInitialNodes, buildUnitLayout } from '@/widgets/infinite-canvas/ui/InfiniteCanvas';

// Chat
import { ChatBox } from '@/widgets/chat-box/ui/ChatBox';

// Dashboard
import StatGrid from '@/widgets/project-dashboard/ui/StatGrid';
import AnalysisPanel from '@/widgets/project-dashboard/ui/AnalysisPanel';

// Navigation
import TopNavBar from '@/widgets/header/ui/TopNavBar';

// Roadmap
import { RoadmapGraph } from '@/widgets/roadmap-graph/ui/RoadmapGraph';
```
