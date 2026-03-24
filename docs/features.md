# Features Layer — User Interactions

> **Layer 4** trong FSD. Mỗi feature = một hành động của người dùng. Chứa UI + logic cho interaction đó.
>
> **Quy tắc:** Feature chỉ import `entities/` và `shared/`. Không import feature khác, không import widgets.

---

## Tổng quan

```
features/
├── create-project/   # Tạo dự án học tập mới (wizard 3 bước)
├── plan-survey/      # Khảo sát để tạo kế hoạch học tập cá nhân
├── node-review/      # Ôn tập kiến thức: Quiz / Flashcard / Tự luận / Dạy AI
├── node-ai-chat/     # Chat AI theo context của từng node/tài liệu
└── floating-note/    # Ghi chú nổi dạng sticky note trên canvas
```

---

## `features/create-project/`

Wizard 3 bước để tạo dự án học tập mới.

### Luồng người dùng

```
Bước 1: Thông tin dự án
  → Nhập tên dự án (bắt buộc)
  → Nhập mô tả (tuỳ chọn)
  → Upload file tài liệu (drag & drop hoặc click)
  → Thêm liên kết YouTube / Website
  → Nhấn "Tiếp tục →" (disabled nếu chưa có tên)

Bước 2: Tìm kiếm tài liệu
  → AI hỏi: "Bạn muốn tìm thêm tài liệu nào không?"
  → Người dùng nhập yêu cầu → AI streaming response
  → Hiện danh sách tài liệu gợi ý với checkbox
  → Nhấn "Đã đủ tài liệu ✓"

Bước 3: Xác nhận
  → Hiển thị tóm tắt: tên, mô tả, số tài liệu
  → AI streaming "Sẵn sàng tạo lộ trình..."
  → Nhấn "Tạo dự án 🎉"
  → createProject() → redirect /roadmap?project={id}
```

### `CreateProjectModal.tsx` (313 dòng)

**Props:**

```ts
interface Props {
  onClose: () => void;
}
```

**State nội bộ:**

```ts
const [step, setStep] = useState(1);            // 1 | 2 | 3
const [projectName, setProjectName] = useState('');
const [projectDesc, setProjectDesc] = useState('');
const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // tên file
const [isDragging, setIsDragging] = useState(false);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([...]);
const [userInput, setUserInput] = useState('');
const [isStreaming, setIsStreaming] = useState(false);
const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(['d1','d2','d3']));
const [resources, setResources] = useState<Resource[]>([]); // YouTube/website URLs
```

**Interface Resource (nội bộ):**

```ts
type ResourceType = 'youtube' | 'website';

interface Resource {
  id: string;       // UUID tạm: `res-${Date.now()}-${random}`
  type: ResourceType;
  url: string;
  title: string;    // Tuỳ chọn
}
```

**Hành vi quan trọng:**
- File upload: hỗ trợ drag & drop và click. Nhận `FileList`, lưu tên file
- Mock AI: sau khi user gửi tin nhắn step 2, delay 600ms → streaming response → hiện checkbox docs
- `totalResourceCount = selectedDocs.size + uploadedFiles.length + resources.filter(r => r.url).length`
- `handleCreateProject()`: gọi `useOmiLearnStore.createProject()`, push route, đóng modal
- Transition giữa steps: Framer Motion `AnimatePresence` với slide (`x: 30 → 0 → -30`)
- Step indicator nhúng trong header modal (không dùng `StepIndicator.tsx` riêng)

**Entities dùng:**
- `useOmiLearnStore` từ `@/entities/project` — tạo project, đóng modal

**Shared dùng:**
- `AIStreamText` — hiển thị streaming AI response trong step 2 và 3

### `StepIndicator.tsx` (23 dòng)

Component hiển thị thanh tiến trình cho wizard.

**Props:**

```ts
interface Props {
  currentStep: number;
  totalSteps?: number; // mặc định 3
}
```

**Trạng thái mỗi step:**
- Đã qua: nền `#4CD964`, hiện icon `✓`
- Hiện tại: nền `#2D2D2D`, text trắng
- Chưa tới: viền `#CCCCCC`, text `#5A5C58`

Các step nối nhau bằng đường ngang (xanh nếu đã qua, xám nếu chưa).

> **Lưu ý:** `CreateProjectModal` tự render step indicator của nó và không import `StepIndicator.tsx`. Component này là export riêng biệt cho tái sử dụng.

### `ResourceInput.tsx` (89 dòng)

Quản lý thêm/xoá URL tài nguyên.

**Exports:**

```ts
// TypeSelector — toggle YouTube/Website
interface TypeSelectorProps {
  current: ResourceType;
  onChange: (t: ResourceType) => void;
}
export function TypeSelector({ current, onChange }: TypeSelectorProps) { ... }

// Một resource input row
interface ResourceInputProps {
  resource: Resource;
  onUpdate: (id: string, field: keyof Resource, value: string) => void;
  onRemove: (id: string) => void;
}
export function ResourceInput({ resource, onUpdate, onRemove }: ResourceInputProps) { ... }

// Danh sách resources + nút "Thêm liên kết"
interface ResourceListProps {
  resources: Resource[];
  onUpdate: (id: string, field: keyof Resource, value: string) => void;
  onRemove: (id: string) => void;
  onAdd: () => void;
}
export function ResourceList({ resources, onUpdate, onRemove, onAdd }: ResourceListProps) { ... }
```

**Hành vi:**
- TypeSelector: 2 nút pill (YouTube đỏ, Website xanh)
- ResourceInput: animate in/out với Framer Motion (height 0 → auto)
- Placeholder URL thay đổi theo type: YouTube URL hoặc Website URL

### `DocSuggestion.tsx` (43 dòng)

Hiển thị tài liệu AI gợi ý với checkbox toggle.

**Exports:**

```ts
interface DocSuggestion {
  id: string;
  title: string;
}

// Một checkbox item
interface DocSuggestionProps {
  doc: DocSuggestion;
  selected: boolean;
  onToggle: () => void;
}
export function DocSuggestion({ doc, selected, onToggle }: DocSuggestionProps) { ... }

// Danh sách với animation
interface DocSuggestionListProps {
  docs: DocSuggestion[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}
export function DocSuggestionList({ docs, selected, onToggle }: DocSuggestionListProps) { ... }
```

Checkbox màu `#4CD964` khi selected, hiện `✓` nhỏ. Text đổi màu `#6B2D3E` khi hover. Danh sách animate vào với `y: 10 → 0`.

---

## `features/plan-survey/`

Survey tạo kế hoạch học tập cá nhân hoá.

### `PlanSurveyModal.tsx` (218 dòng)

**Props:**

```ts
export function PlanSurveyModal({ onClose }: { onClose: () => void }) { ... }
```

**Steps:**

```ts
type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'calendar' | 'generating' | 'done';
```

**Luồng:**

```
q1: Thời gian mỗi tuần?       (input text)
  ↓
q2: Trình độ hiện tại?         (3 nút chọn: Mới bắt đầu / Cơ bản / Nâng cao)
  ↓
q3: Phong cách học?            (grid 2×2: Video / Đọc / Thực hành / Kết hợp)
  ↓
q4: Mong muốn sau khoá?       (textarea)
  ↓
calendar: Kết nối Google Calendar? (với mock "connecting" state 1.2s)
  ↓
generating: Spinner 500ms
  ↓
done: Hiển thị kế hoạch 8 tuần (AIStreamText)
      + input sửa đổi ("Thêm thực hành...")
      + "OK, hoàn thành ✓" → setPlanComplete() + navigate /schedule
```

**State nội bộ:**

```ts
const [step, setStep] = useState<Step>('q1');
const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
const [planText, setPlanText] = useState(PLAN_TEXT); // chuỗi kế hoạch 8 tuần
const [modifyInput, setModifyInput] = useState('');
const [isRegenerating, setIsRegenerating] = useState(false);
const [streamKey, setStreamKey] = useState(0);  // re-trigger AIStreamText
const [calendarConnected, setCalendarConnected] = useState(false);
const [calendarConnecting, setCalendarConnecting] = useState(false);
```

**`PLAN_TEXT`**: Kế hoạch 8 tuần chi tiết cho Hệ Điều Hành và Linux (10 giờ/tuần). Mock dữ liệu hardcoded.

**Sửa đổi kế hoạch:** Khi user nhập yêu cầu và nhấn "Cập nhật", delay 800ms → append thêm note vào `planText` → tăng `streamKey` để reset `AIStreamText`.

**Entities dùng:**
- `useOmiLearnStore` từ `@/entities/project` — `setPlanComplete()`

**Shared dùng:**
- `AIStreamText` — stream kế hoạch học tập ở step `done`

---

## `features/node-review/`

Hệ thống ôn tập kiến thức 4 chế độ.

### `NodeReview.tsx` (256 dòng)

**Props:**

```ts
interface Props {
  onBack?: () => void;    // Nút "← Quay lại tài liệu" (khi dùng trong expanded view)
  title?: string;         // Tiêu đề hiển thị khi standalone
  onClose?: () => void;   // Nút đóng (khi standalone)
  standalone?: boolean;   // true = hiển thị header riêng
}
```

**4 Tab:**

```ts
type Tab = 'quiz' | 'flashcard' | 'essay' | 'teach';
```

#### Tab Quiz (`QuizTab`)

- 5 câu hỏi từ `quizQuestions`
- Progress bar trên đầu: câu hiện tại / tổng số
- Mỗi câu: 4 nút A/B/C/D
- Sau khi chọn: highlight xanh (đúng) / đỏ (sai), ẩn các option khác, hiện explanation
- Nút "Câu tiếp theo →" / "Xem kết quả"
- Màn hình kết quả: điểm số, feedback, nút "Làm lại"

**State:**
```ts
const [current, setCurrent] = useState(0);
const [selected, setSelected] = useState<string | null>(null); // label đã chọn
const [score, setScore] = useState(0);
const [done, setDone] = useState(false);
```

#### Tab Flashcard (`FlashcardTab`)

- 5 thẻ đầu từ `flashcards`
- Card 3D flip: click để lật (CSS `rotateY`, Framer Motion)
- Mặt trước: `#EEF2FF` (xanh indigo), hiện câu hỏi
- Mặt sau: `#D1FAE5` (xanh lá), hiện đáp án
- 2 nút: "❌ Chưa nhớ" / "✓ Đã nhớ" — lưu set `remembered`
- Tự động chuyển thẻ sau 50ms

**State:**
```ts
const [idx, setIdx] = useState(0);
const [flipped, setFlipped] = useState(false);
const [remembered, setRemembered] = useState<Set<number>>(new Set());
```

#### Tab Essay (`EssayTab`)

- Hiển thị `essayQuestion.question`
- Textarea tự do (min-height 180px)
- Nút "Gửi bài" → disabled → AI streaming feedback
- Feedback mock: "8/10 ⭐" với gợi ý bổ sung cụ thể

**State:**
```ts
const [answer, setAnswer] = useState('');
const [submitted, setSubmitted] = useState(false);
```

#### Tab Dạy AI (`TeachAITab`)

- AI đóng vai học sinh, hỏi người dùng giải thích Process Scheduling (`teachAIPrompt.aiQuestion`)
- Textarea để user giải thích
- Nút "Gửi" → AI streaming "phản hồi" khen ngợi + gợi ý thêm
- Feedback mock: "9/10 ⭐"

**Entities dùng:**
- `quizQuestions`, `flashcards`, `essayQuestion`, `teachAIPrompt` từ `@/entities/learning-content`

**Shared dùng:**
- `AIStreamText` — feedback từ AI

---

## `features/node-ai-chat/`

Chat AI theo context của từng node/tài liệu.

### `NodeAIChat.tsx` (172 dòng)

**Props:**

```ts
interface Props {
  docId?: string | null;      // ID tài liệu (không dùng trực tiếp, để extend)
  paragraphs?: string[];      // Nội dung tài liệu dạng mảng đoạn văn
  docTitle?: string;
  onBack?: () => void;        // Nếu có → hiện nút "← Quay lại"
  title?: string;             // Fallback title
  content?: string;           // Nội dung dạng string
  onClose?: () => void;
}
```

**Layout:** Chia đôi ngang
- Trái: Nội dung tài liệu (scrollable, font-serif, paragraphs)
- Phải (360px cố định): Chat panel với AI

**State:**

```ts
const [messages, setMessages] = useState<Message[]>([
  { id: 'init', role: 'ai', text: 'Tôi đã đọc tài liệu này. Bạn có câu hỏi gì không?' },
]);
const [input, setInput] = useState('');
const [streaming, setStreaming] = useState(false);
const [showSuggested, setShowSuggested] = useState(true); // ẩn sau khi user gửi lần đầu
```

**Tìm AI response:**

```ts
const getAIResponse = (q: string): string => {
  // 1. Tìm exact match trong aiResponses
  // 2. Tìm partial match (8 ký tự đầu)
  // 3. Fallback: "Câu hỏi hay! Theo tài liệu..."
};
```

**3 câu hỏi gợi ý:** Từ `suggestedQuestions.slice(0, 3)`. Ẩn sau khi user gửi tin nhắn đầu tiên.

**Streaming:** Mỗi AI message có `streaming: true`. `handleStreamComplete(id)` set `streaming: false` sau khi `AIStreamText` hoàn thành.

**Entities dùng:**
- `aiResponses`, `suggestedQuestions` từ `@/entities/learning-content`

**Shared dùng:**
- `AIStreamText` — stream phản hồi AI

---

## `features/floating-note/`

Ghi chú nổi dạng sticky note.

### `FloatingNote.tsx` (64 dòng)

Không có props. Component tự quản lý vòng đời.

**Hành vi:**
- Tự hiển thị sau **3 giây** kể từ khi mount (delay thân thiện, không gây giật mình)
- Vị trí: `fixed bottom-6 left-6 z-40`
- Nội dung cố định: "**Mẹo:** Bạn có thể chọn nhiều file để AI tóm tắt cùng 1 lúc"
- Icon 📌 góc dưới phải
- Nút ✕ góc trên phải → `dismissed = true` → unmount hoàn toàn
- Animation vào: `opacity 0→1, y 20→0, scale 0.95→1`
- Animation ra: `opacity 1→0, y 0→10, scale 1→0.95`

**State:**
```ts
const [visible, setVisible] = useState(false);   // true sau 3s
const [dismissed, setDismissed] = useState(false); // true khi click X
```

**Visual:**
- Background: `#F5F0C8` (vàng nhạt sticky-note)
- Shadow: `4px 4px 0px rgba(45,45,45,0.85)` (hard shadow phong cách retro)
- Border radius: 12px

**Consumed by:** `app/(main)/learn/page.tsx` — render trực tiếp trong workspace học tập

---

## Sơ đồ quan hệ Features

```
create-project/
  → useOmiLearnStore (entities/project) ← tạo project + điều hướng
  → AIStreamText (shared) ← stream AI response

plan-survey/
  → useOmiLearnStore.setPlanComplete() (entities/project)
  → AIStreamText (shared) ← stream kế hoạch

node-review/
  → quizQuestions, flashcards, essayQuestion, teachAIPrompt (entities/learning-content)
  → AIStreamText (shared) ← feedback AI

node-ai-chat/
  → aiResponses, suggestedQuestions (entities/learning-content)
  → AIStreamText (shared) ← streaming chat

floating-note/
  → (không dùng entity, standalone)
```
