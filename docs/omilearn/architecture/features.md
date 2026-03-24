# Tầng Features — OmiLearn

> Tầng Features chứa các user interaction flows — modals, wizards, review panels. Không chứa business logic thuần túy.

---

## 1. Tổng quan

| Feature | Mô tả | File chính |
|---------|-------|-----------|
| `create-project` | Wizard 3 bước tạo dự án mới | `CreateProjectModal.tsx` |
| `plan-survey` | Khảo sát 4 câu → tạo kế hoạch học | `PlanSurveyModal.tsx` |
| `node-review` | Ôn tập node: Quiz, Flashcard, Essay, Dạy AI | `NodeReview.tsx` |
| `node-ai-chat` | Chat AI trong ngữ cảnh tài liệu | `NodeAIChat.tsx` |
| `floating-note` | Ghi chú nổi với mẹo sử dụng | `FloatingNote.tsx` |

---

## 2. Feature: `create-project`

### 2.1 Mục đích & User flow

Wizard tạo dự án mới gồm 3 bước:

```
Bước 1: Thông tin dự án
  → Tên dự án, mô tả
  → Upload tài liệu (drag & drop)
  → Thêm liên kết (YouTube, Website)

Bước 2: Tìm kiếm tài liệu (AI Chat)
  → AI gợi ý tài liệu liên quan
  → Người dùng tick chọn tài liệu

Bước 3: Xác nhận
  → Xem lại tên, mô tả, số tài liệu
  → AI stream preview
  → Nhấn "Tạo dự án" → navigate đến /roadmap
```

### 2.2 Component breakdown

#### `CreateProjectModal`

Component chính, chứa toàn bộ wizard logic.

**Props:**
```typescript
interface Props {
  onClose: () => void;
}
```

**Internal state:**
```typescript
const [step, setStep] = useState(1);              // 1 | 2 | 3
const [projectName, setProjectName] = useState('');
const [projectDesc, setProjectDesc] = useState('');
const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
const [isDragging, setIsDragging] = useState(false);
const [chatMessages, setChatMessages] = useState<ChatMessage[]>([...]);
const [userInput, setUserInput] = useState('');
const [isStreaming, setIsStreaming] = useState(false);
const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set(['d1', 'd2', 'd3']));
const [showDocs, setShowDocs] = useState(false);
const [resources, setResources] = useState<Resource[]>([]);
```

**Internal types:**
```typescript
type ResourceType = 'youtube' | 'website';

interface Resource {
  id: string;
  type: ResourceType;
  url: string;
  title: string;
}

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  streaming?: boolean;
}
```

**Entity dependencies:**
- `useOmiLearnStore` từ `@/entities/project` — gọi `createProject()` khi hoàn thành
- `AIStreamText` từ `@/shared/ui/AIStreamText` — hiển thị AI typing effect

#### `StepIndicator` (inline)

Indicator 3 bước trong header modal — hiển thị trạng thái `pending`, `active`, `done`.

#### `DocSuggestion` & `ResourceInput` (inline)

Sub-components nhỏ trong wizard step 1 và step 2.

### 2.3 Ví dụ sử dụng

```typescript
// Trong widgets hoặc app
import { CreateProjectModal } from '@/features/create-project';

// Trigger
const { openCreateModal, isCreateModalOpen, closeCreateModal } = useOmiLearnStore();

{isCreateModalOpen && <CreateProjectModal onClose={closeCreateModal} />}
```

---

## 3. Feature: `plan-survey`

### 3.1 Mục đích & User flow

Modal khảo sát cá nhân hóa kế hoạch học tập:

```
Câu 1: Thời gian mỗi tuần? (text input)
Câu 2: Trình độ hiện tại? (3 options)
Câu 3: Phong cách học? (4 options grid)
Câu 4: Mục tiêu sau khi hoàn thành? (textarea)
→ Screen kết nối Google Calendar (tùy chọn)
→ AI tạo kế hoạch 8 tuần (streaming text)
→ Người dùng có thể yêu cầu chỉnh sửa
→ Xác nhận → navigate đến /schedule
```

### 3.2 Component breakdown

#### `PlanSurveyModal`

**Props:**
```typescript
interface Props {
  onClose: () => void;
}
```

**Internal state:**
```typescript
type Step = 'q1' | 'q2' | 'q3' | 'q4' | 'calendar' | 'generating' | 'done';

const [step, setStep] = useState<Step>('q1');
const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '', q4: '' });
const [planText, setPlanText] = useState(PLAN_TEXT);
const [modifyInput, setModifyInput] = useState('');
const [isRegenerating, setIsRegenerating] = useState(false);
const [streamKey, setStreamKey] = useState(0);
const [calendarConnected, setCalendarConnected] = useState(false);
const [calendarConnecting, setCalendarConnecting] = useState(false);
```

**Entity dependencies:**
- `useOmiLearnStore` từ `@/entities/project` — gọi `setPlanComplete()` khi hoàn thành
- `AIStreamText` từ `@/shared/ui/AIStreamText`

### 3.3 Survey options

```typescript
const LEVEL_OPTIONS = ['Mới bắt đầu', 'Có kiến thức cơ bản', 'Nâng cao'];
const STYLE_OPTIONS = ['Video', 'Đọc tài liệu', 'Thực hành', 'Kết hợp'];
```

---

## 4. Feature: `node-review`

### 4.1 Mục đích & User flow

Panel ôn tập đa chế độ — dùng trong `ExpandedNodeView` của infinite-canvas:

```
4 tabs:
├── Quiz       — Trắc nghiệm có giải thích, điểm số
├── Flashcard  — Lật thẻ 3D, đánh dấu "Đã nhớ / Chưa nhớ"
├── Essay      — Tự luận, AI chấm điểm và phản hồi
└── Teach      — Giải thích cho AI, AI đánh giá
```

### 4.2 Component breakdown

#### `NodeReview` (main component)

**Props:**
```typescript
interface Props {
  onBack?: () => void;
  title?: string;
  onClose?: () => void;
  standalone?: boolean;  // true = hiện header riêng (dùng khi không nhúng)
}
```

**Internal state:**
```typescript
const [activeTab, setActiveTab] = useState<Tab>('quiz');
type Tab = 'quiz' | 'flashcard' | 'essay' | 'teach';
```

#### `QuizTab` (internal)

- Hiển thị từng câu hỏi từ `quizQuestions` (entities/learning-content)
- Progress bar theo số câu
- Highlight đúng/sai sau khi chọn
- Hiển thị giải thích
- Màn hình kết quả cuối

**State:**
```typescript
const [current, setCurrent] = useState(0);
const [selected, setSelected] = useState<string | null>(null);
const [score, setScore] = useState(0);
const [done, setDone] = useState(false);
```

#### `FlashcardTab` (internal)

- 3D flip animation (CSS `rotateY`)
- Dùng `flashcards.slice(0, 5)` từ entities/learning-content
- Hai nút: "Chưa nhớ" / "Đã nhớ"

**State:**
```typescript
const [idx, setIdx] = useState(0);
const [flipped, setFlipped] = useState(false);
const [remembered, setRemembered] = useState<Set<number>>(new Set());
```

#### `EssayTab` (internal)

- Hiển thị `essayQuestion` từ entities/learning-content
- Textarea cho người dùng nhập
- AI feedback streaming sau khi submit

#### `TeachAITab` (internal)

- Hiển thị `teachAIPrompt.aiQuestion` — AI hỏi ngược người học
- Người học giải thích → AI đánh giá và cho điểm

### 4.3 Entity dependencies

```typescript
import { quizQuestions, flashcards, essayQuestion, teachAIPrompt } 
  from '@/entities/learning-content';
```

---

## 5. Feature: `node-ai-chat`

### 5.1 Mục đích & User flow

Split-view chat: trái là nội dung tài liệu, phải là AI Chat panel.

```
Trái (2/3): Nội dung tài liệu
  → Hiển thị paragraphs từ documentTextContent

Phải (1/3): AI Chat panel
  → Header: "Trợ lý AI" + status indicator
  → Messages list (user + AI)
  → 3 gợi ý câu hỏi ban đầu
  → Input + Send button
```

### 5.2 Component breakdown

#### `NodeAIChat`

**Props:**
```typescript
interface Props {
  docId?: string | null;
  paragraphs?: string[];
  docTitle?: string;
  onBack?: () => void;      // null → standalone mode
  title?: string;
  content?: string;
  onClose?: () => void;
}
```

**Internal state:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  streaming?: boolean;
}

const [messages, setMessages] = useState<Message[]>([...]);
const [input, setInput] = useState('');
const [streaming, setStreaming] = useState(false);
const [showSuggested, setShowSuggested] = useState(true);
```

**AI response logic:**
```typescript
// Tìm response trong aiResponses (exact match hoặc partial match)
const getAIResponse = (q: string): string => {
  const found = aiResponses.find(r => 
    r.question.toLowerCase().trim() === q.toLowerCase().trim()
  );
  // ...fallback to partial match, then generic response
};
```

### 5.3 Entity dependencies

```typescript
import { aiResponses, suggestedQuestions } from '@/entities/learning-content';
import { AIStreamText } from '@/shared/ui/AIStreamText';
```

---

## 6. Feature: `floating-note`

### 6.1 Mục đích

Ghi chú nổi ở góc dưới trái màn hình — hiển thị mẹo sử dụng sau 3 giây.

### 6.2 Component

#### `FloatingNote` (default export)

**Props:** Không có props (self-contained).

**Internal state:**
```typescript
const [visible, setVisible] = useState(false);
const [dismissed, setDismissed] = useState(false);
```

**Behavior:**
- Tự động hiện sau 3000ms (useEffect + setTimeout)
- Có nút ✕ để dismiss vĩnh viễn trong session
- Animation: `opacity + y + scale` với Framer Motion

**Content:**
```
"Mẹo: Bạn có thể chọn nhiều file để AI tóm tắt cùng 1 lúc"
```

> [!NOTE]
> `FloatingNote` không nhận props và không phụ thuộc entity nào — đây là feature độc lập nhất trong hệ thống.
