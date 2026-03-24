# OmiLearn

Nền tảng học tập thông minh với Infinite Canvas — biến tài liệu thành bản đồ kiến thức tương tác.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)

## Tính năng

- **Infinite Canvas** — Kéo thả tự do, zoom, pan, tạo node từ tài liệu
- **AI Chat** — Hỏi đáp AI trong context từng node
- **Review 4 chế độ** — Quiz, Flashcard, Essay, Dạy lại cho AI
- **Roadmap** — Lộ trình học tập dạng graph
- **Dashboard** — Thống kê tiến độ, lịch học
- **Collaboration** — Chat nhóm real-time trong workspace
- **Landing Page** — Trang giới thiệu sản phẩm

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS, Framer Motion |
| State | Zustand 5 |
| Icons | Lucide React |
| Graph | @xyflow/react |
| Language | TypeScript 5 |

## Tài liệu

> 📖 **[Tài liệu chi tiết →](docs/omilearn/_index.md)**

| Tài liệu | Mô tả |
|-----------|--------|
| [Overview](docs/omilearn/overview.md) | Tổng quan hệ thống |
| [Getting Started](docs/omilearn/getting-started.md) | Cài đặt & chạy |
| [Architecture](docs/omilearn/architecture/_index.md) | Kiến trúc FSD |
| [Entities](docs/omilearn/architecture/entities.md) | Tầng Entities |
| [Features](docs/omilearn/architecture/features.md) | Tầng Features |
| [Widgets](docs/omilearn/architecture/widgets.md) | Tầng Widgets |
| [Shared](docs/omilearn/architecture/shared.md) | Tầng Shared |

## Kiến trúc — Feature-Sliced Design (FSD)

```
app/                        # Layer 1: App Router (pages cực mỏng)
├── (main)/                 # Layout chính với TopNavBar + Footer
│   ├── page.tsx            # Dự án
│   ├── learn/              # Infinite Canvas workspace
│   ├── dashboard/          # Thống kê & tiến độ
│   ├── roadmap/            # Lộ trình học tập
│   ├── schedule/           # Lịch học
│   └── workspace/          # File manager + AI
└── landing/                # Trang giới thiệu

widgets/                    # Layer 3: Composite blocks
├── header/                 # TopNavBar
├── footer/                 # Footer
├── infinite-canvas/        # Canvas chính (21 UI + hooks)
├── chat-box/               # Chat collaboration (6 components)
├── project-dashboard/      # Dashboard views
├── landing-page/           # Landing sections (13 components)
├── roadmap-graph/          # Graph lộ trình
└── project-list/           # Grid dự án

features/                   # Layer 4: User interactions
├── create-project/         # Tạo dự án mới
├── plan-survey/            # Khảo sát kế hoạch học
├── node-review/            # Review node (quiz/flashcard/essay)
├── node-ai-chat/           # Chat AI theo node
└── floating-note/          # Ghi chú nổi

entities/                   # Layer 5: Business entities (types + data + UI)
├── project/                # Project store, types, mock data
├── node/                   # CanvasNode UI, types, styles
├── dashboard/              # StatCard, CircularProgress, SessionCard
├── learning-content/       # Documents, quizzes, flashcards
└── session/                # Study session

shared/                     # Layer 6: Atomic infrastructure
├── ui/                     # Badge, IconButton, ProgressBar, AIStreamText, PageTransition
└── lib/                    # Store utilities
```

**Import rules:**
- Chỉ import **xuống dưới**: app → widgets → features → entities → shared
- Không cross-import cùng layer
- Mỗi slice expose qua `index.ts`

## Cài đặt

```bash
cd app
npm install
```

## Chạy development

```bash
npm run dev
# → http://localhost:3000
```

## Chạy production

```bash
npm run build
PORT=3005 npm run start
# → http://localhost:3005
```

## Routes

| Route | Mô tả |
|-------|--------|
| `/` | Danh sách dự án |
| `/learn` | Infinite Canvas workspace |
| `/roadmap` | Lộ trình học tập |
| `/dashboard` | Danh sách dashboard |
| `/dashboard/:id` | Dashboard chi tiết |
| `/schedule` | Lịch học hàng tuần |
| `/workspace` | File manager + AI chat |
| `/landing` | Trang giới thiệu |

## Cấu trúc file

```
94 files TypeScript/TSX
├── entities:  21 files
├── features:   8 files
├── widgets:   58 files
├── shared:     7 files
└── pages:      8 routes
```

## License

Private — All rights reserved.
