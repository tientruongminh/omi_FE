# Kiến trúc hệ thống OmiLearn

## Tổng quan

OmiLearn sử dụng **Feature-Sliced Design (FSD)** — một phương pháp kiến trúc frontend giúp tổ chức code theo layers với quy tắc import nghiêm ngặt. Mục tiêu: mỗi module có trách nhiệm rõ ràng, dễ bảo trì, dễ scale khi team lớn lên.

## Sơ đồ layers

```
┌─────────────────────────────────────────────────┐
│  app/              Layer 1 — App (Pages)        │  ← Entry points, routing
│  Chỉ import xuống ↓                             │
├─────────────────────────────────────────────────┤
│  widgets/          Layer 3 — Widgets            │  ← Composite UI blocks
│  Kết hợp features + entities                    │
├─────────────────────────────────────────────────┤
│  features/         Layer 4 — Features           │  ← User interactions
│  Xử lý logic tương tác                         │
├─────────────────────────────────────────────────┤
│  entities/         Layer 5 — Entities           │  ← Business objects
│  Types + Data + UI cho từng domain              │
├─────────────────────────────────────────────────┤
│  shared/           Layer 6 — Shared             │  ← Atomic infrastructure
│  UI kit, utilities, configs                     │
└─────────────────────────────────────────────────┘
```

**Quy tắc vàng:** Import chỉ đi **xuống dưới**, không bao giờ đi lên hoặc ngang.

## Chi tiết từng layer

### Layer 1: `app/` — Pages & Routing

Next.js App Router. Mỗi page là một **composition** cực mỏng — chỉ import widgets/features và ghép lại.

```
app/
├── layout.tsx                    # Root layout (font, metadata)
├── styles/
│   └── globals.css               # Global styles, CSS variables
├── landing/
│   └── page.tsx                  # Trang giới thiệu sản phẩm
└── (main)/
    ├── layout.tsx                # Layout chính (TopNavBar + Footer)
    ├── page.tsx                  # Danh sách dự án
    ├── learn/page.tsx            # Infinite Canvas workspace
    ├── dashboard/page.tsx        # Danh sách dashboard
    ├── dashboard/[projectId]/    # Dashboard chi tiết
    ├── roadmap/page.tsx          # Lộ trình học tập
    ├── schedule/page.tsx         # Lịch học hàng tuần
    └── workspace/page.tsx        # File manager + AI chat
```

**Quy tắc:**
- Page không chứa business logic
- Chỉ import → render → done
- Layout xử lý navigation (TopNavBar, Footer)

**Ví dụ page mỏng:**
```tsx
// app/(main)/learn/page.tsx
import InfiniteCanvas from '@/widgets/infinite-canvas/ui/InfiniteCanvas';
import ChatBox from '@/widgets/chat-box/ui/ChatBox';
import FloatingNote from '@/features/floating-note/ui/FloatingNote';
import { useOmiLearnStore } from '@/entities/project';

export default function LearnPage() {
  const { currentProject } = useOmiLearnStore();
  return (
    <>
      <InfiniteCanvas projectId={currentProject} />
      <ChatBox />
      <FloatingNote />
    </>
  );
}
```

---

### Layer 3: `widgets/` — Composite Blocks

Các khối UI lớn, kết hợp nhiều entities và features. Mỗi widget là một "mini-app" độc lập.

```
widgets/
├── header/                  # TopNavBar + navigation logic
│   ├── ui/TopNavBar.tsx
│   └── index.ts
│
├── footer/                  # Footer component
│   ├── ui/Footer.tsx
│   └── index.ts
│
├── infinite-canvas/         # Canvas học tập chính (21 files)
│   ├── ui/
│   │   ├── InfiniteCanvas.tsx      # Component gốc — pan, zoom, drag
│   │   ├── CanvasEdge.tsx          # Bezier edges giữa nodes
│   │   ├── CanvasHint.tsx          # Gợi ý thao tác
│   │   ├── ContextMenu.tsx         # Right-click menu (7 actions)
│   │   ├── ContextMenuItem.tsx     # Menu item đơn lẻ
│   │   ├── SelectionToolbar.tsx    # Toolbar chọn text → tạo node
│   │   ├── ZoomControls.tsx        # Nút zoom +/-/reset
│   │   ├── ZoomIndicator.tsx       # Hiển thị % zoom
│   │   ├── AddUnitMenu.tsx         # Menu thêm unit mới
│   │   ├── DocumentSidebar.tsx     # Sidebar tài liệu bên trái
│   │   ├── SplitView.tsx           # Chia đôi canvas + expanded view
│   │   ├── ExpandedNodeView.tsx    # View mở rộng 1 node
│   │   ├── ExpandedHeader.tsx      # Header của expanded view
│   │   ├── ExpandedDocContent.tsx  # Nội dung document
│   │   ├── ExpandedAIContent.tsx   # AI response content
│   │   ├── ExpandedNoteContent.tsx # Note content
│   │   ├── ExpandedSynthesisContent.tsx # Tổng hợp
│   │   ├── DocFooterActions.tsx    # Actions dưới document
│   │   └── VideoPlayer.tsx         # Player cho video nodes
│   ├── model/
│   │   ├── types.ts                # Widget-specific UI state
│   │   └── constants.ts            # Canvas dimensions
│   ├── lib/
│   │   ├── useCanvasTransform.ts   # Hook: pan + zoom logic
│   │   ├── useCanvasNodes.ts       # Hook: node CRUD operations
│   │   └── useNodeDrag.ts          # Hook: drag & drop logic
│   └── index.ts
│
├── chat-box/                # Chat collaboration (6 files)
│   ├── ui/
│   │   ├── ChatBox.tsx             # Container chính
│   │   ├── ChatInput.tsx           # Input gửi tin nhắn
│   │   ├── ChatMessage.tsx         # Bubble tin nhắn
│   │   ├── ChatToggleButton.tsx    # Nút mở/đóng chat
│   │   ├── InviteModal.tsx         # Modal mời thành viên
│   │   └── MemberList.tsx          # Danh sách thành viên
│   └── index.ts
│
├── project-dashboard/       # Dashboard views (5 files)
│   ├── ui/
│   │   ├── StatGrid.tsx            # Grid thống kê (dùng StatCard entity)
│   │   ├── SessionList.tsx         # Danh sách study sessions
│   │   ├── WeekCalendar.tsx        # Lịch tuần
│   │   ├── AnalysisPanel.tsx       # Panel phân tích AI
│   │   └── Breadcrumb.tsx          # Breadcrumb navigation
│   └── index.ts
│
├── landing-page/            # Landing page (13 files)
│   ├── ui/
│   │   ├── LandingNav.tsx          # Navigation bar
│   │   ├── CTAButton.tsx           # Call-to-action button
│   │   ├── HeroSection.tsx         # Hero banner
│   │   ├── InteractiveDemo.tsx     # Demo tương tác
│   │   ├── ComparisonTable.tsx     # So sánh truyền thống vs OmiLearn
│   │   ├── ManifestoLine.tsx       # Manifesto animation
│   │   ├── TestimonialCard.tsx     # Card đánh giá
│   │   ├── PricingCard.tsx         # Card bảng giá
│   │   ├── FeatureCard.tsx         # Card tính năng
│   │   ├── FooterCTA.tsx           # CTA cuối trang
│   │   ├── FAQItem.tsx             # FAQ accordion
│   │   ├── StatItem.tsx            # Số liệu thống kê
│   │   └── LandingFooter.tsx       # Footer landing
│   └── index.ts
│
└── roadmap-graph/           # Graph lộ trình
    ├── ui/RoadmapGraph.tsx
    └── index.ts
```

**Quy tắc:**
- Widget được import entities + shared (xuống dưới)
- Widget **không** import widget khác (không ngang)
- Mỗi widget expose qua `index.ts`

---

### Layer 4: `features/` — User Interactions

Mỗi feature = 1 hành động của người dùng. Chứa UI + logic cho interaction đó.

```
features/
├── create-project/          # Tạo dự án mới
│   └── ui/
│       ├── CreateProjectModal.tsx   # Modal 3 bước
│       ├── StepIndicator.tsx        # Thanh tiến trình
│       ├── ResourceInput.tsx        # Input thêm URL
│       └── DocSuggestion.tsx        # Gợi ý tài liệu
│
├── plan-survey/             # Khảo sát kế hoạch học
│   └── ui/PlanSurveyModal.tsx
│
├── node-review/             # Review kiến thức
│   └── ui/NodeReview.tsx            # 4 modes: Quiz, Flashcard, Essay, Dạy AI
│
├── node-ai-chat/            # Chat AI theo context node
│   └── ui/NodeAIChat.tsx
│
└── floating-note/           # Ghi chú nổi trên canvas
    └── ui/FloatingNote.tsx
```

**Quy tắc:**
- Feature chỉ import entities + shared (xuống dưới)
- Feature **không** import feature khác
- Feature **không** import widgets (không đi lên)

---

### Layer 5: `entities/` — Business Objects

Đại diện cho các **khái niệm nghiệp vụ** cốt lõi. Mỗi entity có types, data, và UI riêng.

```
entities/
├── project/                 # Dự án học tập
│   ├── model/
│   │   ├── types.ts                 # Project, ProjectMember, SharedCourse
│   │   └── store.ts                 # Zustand store (CRUD projects)
│   ├── data/
│   │   └── mock.ts                  # Mock data: 4 CS projects
│   └── index.ts                     # Barrel export
│
├── node/                    # Node trên canvas
│   ├── model/
│   │   └── types.ts                 # CanvasNode, CanvasEdge, NODE_STYLES, EDGE_COLORS
│   ├── data/
│   │   └── mock.ts                  # RoadmapNodes, RoadmapEdges
│   ├── ui/
│   │   ├── CanvasNode.tsx           # Render 1 node trên canvas
│   │   ├── NodeIcon.tsx             # Icon theo node type
│   │   └── NodeBadge.tsx            # Badge trạng thái
│   └── index.ts
│
├── dashboard/               # Thống kê học tập
│   ├── model/
│   │   └── types.ts                 # DashboardStat, StudySession
│   ├── data/
│   │   └── mock.ts                  # Mock stats, sessions
│   ├── ui/
│   │   ├── StatCard.tsx             # Card hiển thị stat
│   │   ├── CircularProgress.tsx     # Vòng tròn tiến độ
│   │   └── SessionCard.tsx          # Card study session
│   └── index.ts
│
├── learning-content/        # Nội dung học tập
│   ├── model/
│   │   └── types.ts                 # LearningDocument, QuizQuestion, Flashcard...
│   ├── data/
│   │   └── mock.ts                  # 25 tài liệu, 5 quiz, 8 flashcard
│   └── index.ts
│
└── session/                 # Phiên học tập
    ├── model/
    │   └── types.ts                 # StudySession type
    └── index.ts
```

**Quy tắc:**
- Entity chỉ import shared (xuống dưới)
- Entity **không** import entity khác
- Entity **không** import features hay widgets (không đi lên)
- UI trong entity là **presentational** — chỉ hiển thị, không có business logic phức tạp

---

### Layer 6: `shared/` — Atomic Infrastructure

Components và utilities dùng chung toàn app. Chỉ chứa thứ **không thuộc domain nào**.

```
shared/
├── ui/                      # Atomic components
│   ├── Badge.tsx                    # Tag/badge nhỏ
│   ├── IconButton.tsx               # Button với icon
│   ├── ProgressBar.tsx              # Thanh tiến trình
│   ├── AIStreamText.tsx             # Text streaming effect
│   └── PageTransition.tsx           # Framer Motion page transition
├── lib/
│   └── store.ts                     # Store utilities
└── index.ts                         # Barrel export
```

**Quy tắc:**
- Shared **không** import từ bất kỳ layer nào khác
- Chỉ chứa pure components, utilities, configs
- Không chứa business logic

---

## Dependency Graph

```
app/(main)/learn/page.tsx
├── @/widgets/infinite-canvas    ← Widget
│   ├── @/entities/node          ← Entity (CanvasNode UI + types)
│   ├── @/entities/learning-content ← Entity (documents, transcripts)
│   └── @/shared/ui/ProgressBar  ← Shared (atomic)
├── @/widgets/chat-box           ← Widget
│   ├── @/entities/project       ← Entity (members, store)
│   └── @/entities/learning-content
├── @/features/floating-note     ← Feature
└── @/entities/project           ← Entity (store)

app/(main)/layout.tsx
├── @/widgets/header             ← Widget (TopNavBar)
├── @/widgets/footer             ← Widget (Footer)
└── @/shared/ui/PageTransition   ← Shared (atomic)
```

## Import Rules — Tổng kết

| Layer | Được import từ | Không được import từ |
|-------|----------------|---------------------|
| `app/` | widgets, features, entities, shared | — |
| `widgets/` | entities, shared | app, widgets khác |
| `features/` | entities, shared | app, widgets, features khác |
| `entities/` | shared | app, widgets, features, entities khác |
| `shared/` | (không import ai) | app, widgets, features, entities |

## Barrel Exports

Mỗi slice expose public API qua `index.ts`. File nội bộ là **private**.

```ts
// entities/node/index.ts
export type { CanvasNodeType, CanvasEdge, RoadmapNode, RoadmapEdge } from './model/types';
export { NODE_STYLES, EDGE_COLORS } from './model/types';
export { defaultRoadmapNodes, defaultRoadmapEdges } from './data/mock';
export { default as CanvasNodeComponent } from './ui/CanvasNode';
export { default as NodeIcon } from './ui/NodeIcon';
export { default as NodeBadge } from './ui/NodeBadge';
```

Import bên ngoài **nên** dùng barrel:
```tsx
// ✅ Tốt — qua barrel
import { NODE_STYLES, CanvasNodeComponent } from '@/entities/node';

// ⚠️ Chấp nhận — deep import khi cần specific file
import CanvasNode from '@/entities/node/ui/CanvasNode';

// ❌ Sai — import file nội bộ model trực tiếp
import { NODE_STYLES } from '@/entities/node/model/types';
```

## Thống kê

| Layer | Files | Vai trò |
|-------|-------|---------|
| entities | 21 | Business objects (types + data + UI) |
| features | 8 | User interactions |
| widgets | 58 | Composite UI blocks |
| shared | 7 | Atomic infrastructure |
| **Tổng** | **94** | |

## Thêm feature mới

1. Xác định layer: user interaction → `features/`, business concept → `entities/`, composite block → `widgets/`
2. Tạo thư mục với cấu trúc `ui/`, `model/`, `data/`, `lib/` tùy cần
3. Tạo `index.ts` barrel export
4. Import **chỉ xuống dưới**
5. Verify: `grep -rn "from '@/widgets" features/` phải trả về 0

## Thêm entity mới

```bash
mkdir -p entities/new-entity/{model,data,ui}

# entities/new-entity/model/types.ts
export interface NewEntity { ... }

# entities/new-entity/data/mock.ts
export const mockData: NewEntity[] = [...]

# entities/new-entity/ui/NewEntityCard.tsx
export default function NewEntityCard({ item }: { item: NewEntity }) { ... }

# entities/new-entity/index.ts
export type { NewEntity } from './model/types';
export { mockData } from './data/mock';
export { default as NewEntityCard } from './ui/NewEntityCard';
```
