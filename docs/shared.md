# Shared Layer — Atomic Infrastructure

> **Layer 6** trong FSD. Thấp nhất trong hierarchy — atomic components và utilities dùng chung toàn app.
>
> **Quy tắc:** `shared/` **không** import từ bất kỳ layer nào khác (entities, features, widgets, app). Chỉ chứa pure components, utilities và configs không thuộc domain nào.

---

## Tổng quan

```
shared/
├── ui/
│   ├── AIStreamText.tsx    # Typewriter streaming text effect cho AI responses
│   ├── Badge.tsx           # Tag/label nhỏ có màu
│   ├── IconButton.tsx      # Button với icon Lucide + animation
│   ├── PageTransition.tsx  # Framer Motion page enter/exit transition
│   └── ProgressBar.tsx     # Animated horizontal progress bar
├── lib/
│   └── store.ts            # (Deprecated) convenience re-export
└── index.ts                # Barrel export tất cả shared UI
```

---

## `ui/AIStreamText.tsx` (99 dòng)

Component quan trọng nhất trong shared — tạo hiệu ứng AI đang "gõ" text theo thời gian thực.

### Props

```ts
interface Props {
  text: string;           // Toàn bộ text cần stream
  speed?: number;         // ms mỗi ký tự, mặc định 20ms
  onComplete?: () => void; // Callback khi stream xong
  className?: string;
  startDelay?: number;    // ms trước khi bắt đầu, mặc định 0
}
```

### Hành vi

**Streaming logic:**
- Dùng `setTimeout` recursive (không phải `setInterval`) — mỗi ký tự tự lên lịch cho ký tự tiếp theo
- Tốc độ có biến thiên ngẫu nhiên: `delay = speed + random * speed * 0.5` (tự nhiên hơn)
- Ngắt lâu hơn tại dấu câu:
  - `\n` → `speed × 8` (dòng mới)
  - `.` `!` `?` → `speed × 5`
  - `,` → `speed × 3`

**Cursor:** Khi chưa xong hiện cursor nhấp nháy `▋` inline với `animate-pulse`

**Markdown bold:** Parse `**text**` → `<strong>text</strong>` khi render

**Reset:** Khi `text` prop thay đổi → reset state `displayed = ''`, `indexRef = 0`, clear timer

**Refs:** Dùng `timerRef` để cleanup khi unmount. `onCompleteRef` để tránh stale closure.

### Ví dụ sử dụng

```tsx
import { AIStreamText } from '@/shared/ui/AIStreamText';

// Cơ bản
<AIStreamText text="Xin chào! Tôi là trợ lý AI." speed={25} />

// Với callback và delay
<AIStreamText
  text={aiResponse}
  speed={18}
  startDelay={300}
  onComplete={() => setStreamingDone(true)}
  className="text-sm text-[#2D2D2D] leading-relaxed"
/>

// Re-trigger stream (đổi key)
<AIStreamText key={streamKey} text={planText} speed={15} />
```

### Sử dụng trong app

| Nơi dùng | Mục đích |
|----------|----------|
| `features/create-project/CreateProjectModal` | AI response step 2, AI preview step 3 |
| `features/plan-survey/PlanSurveyModal` | Stream kế hoạch 8 tuần ở step `done` |
| `features/node-review/NodeReview` | AI feedback Essay + Dạy AI |
| `features/node-ai-chat/NodeAIChat` | Stream chat messages |
| `widgets/project-dashboard/AnalysisPanel` | Stream AI analysis |

---

## `ui/Badge.tsx` (18 dòng)

Tag/label nhỏ tái sử dụng.

### Props

```ts
interface Props {
  children: React.ReactNode;
  style?: React.CSSProperties; // Màu nền, màu chữ inline
  className?: string;          // Tailwind classes bổ sung
}
```

### Cấu trúc

```tsx
<span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${className}`} style={style}>
  {children}
</span>
```

### Ví dụ sử dụng

```tsx
import Badge from '@/shared/ui/Badge';

// Badge màu động
<Badge style={{ background: '#4CD964/20', color: '#4CD964' }}>
  Đang học
</Badge>

// Badge với Tailwind
<Badge className="bg-[#EEF2FF] text-[#4338CA]">
  AI
</Badge>
```

---

## `ui/IconButton.tsx` (29 dòng)

Button với icon Lucide + hover/active micro-animations.

### Props

```ts
interface Props {
  icon: React.ReactNode;    // Bất kỳ ReactNode (Lucide icon, emoji, SVG...)
  onClick: () => void;
  title?: string;           // Tooltip text
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;       // disabled → opacity 40%, cursor not-allowed
}
```

### Hành vi

Dùng Framer Motion `whileHover` (scale 1.05) và `whileTap` (scale 0.95) cho feedback vật lý tức thì.

### Ví dụ sử dụng

```tsx
import IconButton from '@/shared/ui/IconButton';
import { ZoomIn } from 'lucide-react';

<IconButton
  icon={<ZoomIn size={16} />}
  onClick={handleZoomIn}
  title="Phóng to"
  className="w-8 h-8 rounded-full bg-white border border-[#E5E5DF]"
/>
```

---

## `ui/ProgressBar.tsx` (28 dòng)

Animated horizontal progress bar.

### Props

```ts
interface Props {
  value: number;        // 0–100 (%)
  color?: string;       // Màu hex, mặc định '#4CD964'
  height?: number;      // px, mặc định 8
  delay?: number;       // Animation delay (s), mặc định 0
  className?: string;
}
```

### Hành vi

- Background: `#E5E7EB` (xám nhạt)
- Fill: animate width từ 0 → `${value}%` bằng Framer Motion
- Duration 0.9s, easing `easeOut`, support `delay` để stagger nhiều bars

### Ví dụ sử dụng

```tsx
import ProgressBar from '@/shared/ui/ProgressBar';

// Dùng trong StatCard với stagger
<ProgressBar
  value={stat.percentage}
  color={stat.color}
  height={8}
  delay={0.5 + index * 0.1}
/>

// Progress bar đơn giản
<ProgressBar value={65} color="#818CF8" height={4} />
```

---

## `ui/PageTransition.tsx` (18 dòng)

Wrapper cho page-level transition animations.

### Props

```ts
interface Props {
  children: React.ReactNode;
}
// (không có prop nào khác — key là pathname)
```

### Hành vi

```tsx
export default function PageTransition({ children }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}           // Re-trigger animation khi route thay đổi
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}
```

`key={pathname}` là kỹ thuật quan trọng: khi user chuyển route, component nhận `key` mới → Framer Motion unmount + re-mount → trigger animation lại.

`willChange: 'transform, opacity'` hint cho browser để tối ưu GPU compositing.

### Ví dụ sử dụng

```tsx
// app/(main)/layout.tsx
import PageTransition from '@/shared/ui/PageTransition';

export default function MainLayout({ children }) {
  return (
    <>
      <TopNavBar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
```

---

## `lib/store.ts` (3 dòng)

```ts
// Store convenience re-export
// In FSD, import directly from entities: import { useOmiLearnStore } from '@/entities/project'
// This file is kept for backward compatibility
```

> ⚠️ **Deprecated.** File này chỉ còn là comment — không export gì. Dùng trực tiếp:
> ```ts
> import { useOmiLearnStore } from '@/entities/project';
> ```

---

## `index.ts` — Barrel export

```ts
export { default as AIStreamText } from './ui/AIStreamText';
export { default as PageTransition } from './ui/PageTransition';
export { default as Badge } from './ui/Badge';
export { default as IconButton } from './ui/IconButton';
export { default as ProgressBar } from './ui/ProgressBar';
```

### Ví dụ import từ barrel

```ts
import { AIStreamText, Badge, ProgressBar } from '@/shared';
// hoặc
import AIStreamText from '@/shared/ui/AIStreamText';
```

---

## Dependency graph của Shared

```
shared/ui/AIStreamText  ← (không import gì, pure logic)
shared/ui/Badge         ← (không import gì)
shared/ui/IconButton    ← framer-motion (external)
shared/ui/PageTransition ← framer-motion + next/navigation (external)
shared/ui/ProgressBar   ← framer-motion (external)
```

Tất cả chỉ phụ thuộc vào **external libraries** (framer-motion, next/navigation) — không bao giờ import từ layers khác trong app.

---

## Checklist khi thêm vào Shared

Thêm component/utility vào `shared/` nếu nó:

- ✅ Không thuộc domain nghiệp vụ nào (project, node, learning...)
- ✅ Có thể dùng trong bất kỳ app Next.js nào khác
- ✅ Không import từ `entities/`, `features/`, `widgets/`
- ✅ Chỉ nhận config qua props (không hardcode business logic)

Không nên thêm vào `shared/` nếu:
- ❌ Component biết về "Project", "CanvasNode", hay bất kỳ domain object nào
- ❌ Component cần import store
- ❌ Component chỉ dùng ở 1 nơi duy nhất (để gần nơi dùng hơn)
