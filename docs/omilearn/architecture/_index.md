# Kiến trúc FSD — OmiLearn

> Tài liệu tổng quan về các tầng trong kiến trúc Feature-Sliced Design của OmiLearn.

---

## Các tầng kiến trúc

```mermaid
flowchart TB
    E["📦 Entities<br/>project · node · dashboard · learning-content · session"]
    F["⚡ Features<br/>create-project · plan-survey · node-review · node-ai-chat · floating-note"]
    W["🧩 Widgets<br/>infinite-canvas · chat-box · project-dashboard · header · footer · landing-page · roadmap-graph"]
    A["🗂️ App<br/>8 routes (Next.js App Router)"]
    S["🔧 Shared<br/>ui/ · lib/"]

    S --> E
    S --> F
    S --> W
    E --> F
    E --> W
    F --> W
    W --> A
```

## Tài liệu từng tầng

| Tầng | Mô tả | Link |
|------|-------|------|
| **Entities** | Business entities: types, mock data, UI atoms | [entities.md](entities.md) |
| **Features** | User interactions: modals, flows, actions | [features.md](features.md) |
| **Widgets** | Composite blocks: canvas, dashboard, chat | [widgets.md](widgets.md) |
| **Shared** | Atomic infrastructure: UI primitives, utils | [shared.md](shared.md) |

> [!NOTE]
> Import chỉ được đi từ tầng cao xuống tầng thấp. Không cross-import cùng tầng.
