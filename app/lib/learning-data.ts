// OmiLearn Learning Page — Full Mock Data

// ─── Interfaces ───────────────────────────────────────────────

export interface LearningDocument {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'worksheet';
  size?: string; // e.g. "12 trang"
  duration?: string; // e.g. "45 phút"
}

export interface ContentNode {
  id: string;
  label: string;
  type: 'video' | 'pdf' | 'quiz';
  docId: string;
}

export interface MindmapNodeData {
  id: string;
  label: string;
  subtitle: string;
  documents: LearningDocument[];
}

export interface QuizOption {
  label: string;
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface EssayQuestion {
  id: string;
  question: string;
}

export interface TeachAIPrompt {
  id: string;
  topic: string;
  aiQuestion: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isMe?: boolean;
}

export interface AIResponse {
  question: string;
  answer: string;
}

// ─── Mindmap Nodes ────────────────────────────────────────────

export const mindmapNodes: MindmapNodeData[] = [
  {
    id: 'khai-niem',
    label: 'Khái Niệm Cơ Bản',
    subtitle: 'Các khái niệm nền tảng về hệ điều hành và vai trò của nó',
    documents: [
      { id: 'kn-1', title: 'Hệ điều hành là gì?', type: 'pdf', size: '8 trang' },
      { id: 'kn-2', title: 'Lịch sử phát triển OS', type: 'video', duration: '20 phút' },
      { id: 'kn-3', title: 'Bài tập cơ bản', type: 'worksheet', size: '3 trang' },
    ],
  },
  {
    id: 'kien-truc',
    label: 'Kiến Trúc Hệ Thống',
    subtitle: 'Cấu trúc nội tại của hệ điều hành — kernel, user space, drivers',
    documents: [
      { id: 'kt-1', title: 'Kiến trúc Monolithic Kernel', type: 'video', duration: '35 phút' },
      { id: 'kt-2', title: 'Microkernel vs Monolithic', type: 'pdf', size: '15 trang' },
      { id: 'kt-3', title: 'System Calls deep dive', type: 'pdf', size: '10 trang' },
    ],
  },
  {
    id: 'quan-ly',
    label: 'Quản Lý Tài Nguyên',
    subtitle: 'CPU scheduling, memory management, I/O và file system',
    documents: [
      { id: 'ql-1', title: 'CPU Scheduling Algorithms', type: 'video', duration: '40 phút' },
      { id: 'ql-2', title: 'Memory Paging & Segmentation', type: 'pdf', size: '18 trang' },
      { id: 'ql-3', title: 'File System Internals', type: 'video', duration: '25 phút' },
      { id: 'ql-4', title: 'Deadlock và Race Condition', type: 'pdf', size: '12 trang' },
    ],
  },
  {
    id: 'giao-dien',
    label: 'Giao Diện Người Dùng (UI)',
    subtitle: 'Tổng quan về giao diện người dùng trong hệ điều hành',
    documents: [
      { id: 'gd-1', title: 'GUI vs CLI — So sánh', type: 'video', duration: '45 phút' },
      { id: 'gd-2', title: 'Lịch sử phát triển giao diện', type: 'pdf', size: '12 trang' },
      { id: 'gd-3', title: 'Thiết kế UX cho OS', type: 'video', duration: '30 phút' },
      { id: 'gd-4', title: 'Window Manager deep dive', type: 'pdf', size: '8 trang' },
      { id: 'gd-5', title: 'Bài tập thực hành', type: 'worksheet', size: '5 trang' },
    ],
  },
  {
    id: 'he-dieu-hanh',
    label: 'Hệ Điều Hành Phổ Biến',
    subtitle: 'So sánh Windows, macOS, Linux và các hệ điều hành khác',
    documents: [
      { id: 'hdh-1', title: 'Linux Distributions Overview', type: 'video', duration: '50 phút' },
      { id: 'hdh-2', title: 'Windows vs Linux vs macOS', type: 'pdf', size: '20 trang' },
      { id: 'hdh-3', title: 'Android & iOS internals', type: 'video', duration: '30 phút' },
    ],
  },
  {
    id: 'lap-trinh-shell',
    label: 'Lập Trình Shell (BASH)',
    subtitle: 'Scripting Bash, tự động hóa tác vụ hệ thống với shell',
    documents: [
      { id: 'sh-1', title: 'Bash Scripting cơ bản', type: 'video', duration: '60 phút' },
      { id: 'sh-2', title: 'Pipe, Redirect và Process', type: 'pdf', size: '14 trang' },
      { id: 'sh-3', title: 'Viết script tự động hóa', type: 'worksheet', size: '6 trang' },
    ],
  },
  {
    id: 'khoi-dong',
    label: 'Khởi Động và Debug',
    subtitle: 'Boot process, GRUB, dmesg, strace và debug hệ thống',
    documents: [
      { id: 'kd-1', title: 'Boot Process từ BIOS đến OS', type: 'video', duration: '35 phút' },
      { id: 'kd-2', title: 'GRUB Bootloader', type: 'pdf', size: '9 trang' },
      { id: 'kd-3', title: 'Debug với strace và dmesg', type: 'video', duration: '25 phút' },
    ],
  },
];

// ─── Document Text Content ─────────────────────────────────────

export const documentTextContent: Record<string, string[]> = {
  'gd-2': [
    'Giao diện người dùng (UI) đã trải qua nhiều giai đoạn phát triển từ những năm 1960. Ban đầu, người dùng tương tác với máy tính thông qua giao diện dòng lệnh (CLI). Các hệ điều hành như Unix và MS-DOS yêu cầu người dùng nhập lệnh văn bản để thực hiện các tác vụ.',
    'Năm 1973, Xerox PARC giới thiệu Alto — máy tính đầu tiên có giao diện đồ họa (GUI). Khái niệm "desktop metaphor" ra đời, cho phép người dùng tương tác với biểu tượng, cửa sổ và menu. Đây là cuộc cách mạng thật sự trong cách con người tương tác với máy tính.',
    'Apple Macintosh (1984) và Microsoft Windows (1985) đã đưa GUI đến đại chúng. Steve Jobs đã thăm quan Xerox PARC và nhận ra tiềm năng của GUI, từ đó tích hợp vào thiết kế Mac. Sự cạnh tranh giữa Apple và Microsoft đã thúc đẩy sự phát triển của giao diện đồ họa trong nhiều thập kỷ.',
    'Từ đó, giao diện người dùng không ngừng phát triển với touch screen (iPhone 2007), voice control (Siri 2011), và gần đây nhất là AR/VR interface. Tương lai giao diện hướng đến não-máy tính interface (BCI) và không gian ảo, nơi ranh giới giữa thực và ảo ngày càng mờ nhạt.',
  ],
  'gd-4': [
    'Window Manager (WM) là thành phần phần mềm kiểm soát vị trí và giao diện của các cửa sổ trong môi trường đồ họa. Trong hệ sinh thái Linux, window manager hoạt động độc lập với desktop environment (DE), cho phép người dùng tùy biến cao.',
    'Có hai loại chính: Floating WM (như Openbox, Fluxbox) cho phép cửa sổ chồng lên nhau tự do, và Tiling WM (như i3, bspwm, sway) sắp xếp cửa sổ không chồng lên nhau, tối đa hóa không gian màn hình. Tiling WM rất phổ biến với lập trình viên vì tăng năng suất.',
    'Trên Windows, WM được tích hợp sâu vào Desktop Window Manager (DWM). macOS sử dụng Quartz Compositor. Cả hai đều cung cấp compositing — khả năng vẽ hiệu ứng transparency, shadow, và animation mượt mà nhờ GPU acceleration.',
  ],
  'kn-1': [
    'Hệ điều hành (Operating System — OS) là phần mềm hệ thống quản lý phần cứng máy tính và cung cấp dịch vụ cho các chương trình ứng dụng. Nó là lớp trung gian giữa phần cứng và phần mềm ứng dụng.',
    'Các chức năng cốt lõi của OS bao gồm: quản lý tiến trình (process management), quản lý bộ nhớ (memory management), quản lý thiết bị I/O, quản lý file system, và bảo mật. Không có OS, máy tính chỉ là một đống phần cứng không thể sử dụng.',
    'Kernel là trái tim của OS — phần duy nhất chạy ở chế độ đặc quyền (kernel mode) với toàn quyền truy cập phần cứng. Mọi ứng dụng người dùng chạy ở user mode và phải yêu cầu OS thực hiện các tác vụ đặc quyền thông qua system calls.',
  ],
};

// ─── Video Transcript ─────────────────────────────────────────

export const videoTranscripts: Record<string, string> = {
  'gd-1': '...trong phần này chúng ta sẽ so sánh hai phong cách tương tác chính với hệ điều hành: GUI — giao diện đồ họa với cửa sổ và biểu tượng, và CLI — giao diện dòng lệnh với text commands. Mỗi loại có ưu nhược điểm riêng...',
  'gd-3': '...UX design cho hệ điều hành đòi hỏi sự cân bằng giữa power user features và accessibility cho người mới. Chúng ta sẽ xem xét các nguyên tắc thiết kế của Fitts Law, Hick-Hyman Law và cách áp dụng trong OS design...',
  'kn-2': '...từ batch processing những năm 1950, đến time-sharing systems của MIT CTSS năm 1961, rồi Unix năm 1969, và cuối cùng là Linux kernel do Linus Torvalds viết năm 1991. Mỗi bước là một cú nhảy vọt về khả năng...',
};

// ─── Quiz Data ────────────────────────────────────────────────

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Máy tính đầu tiên có giao diện đồ họa (GUI) là?',
    options: [
      { label: 'A', text: 'Apple Macintosh', correct: false },
      { label: 'B', text: 'Xerox Alto', correct: true },
      { label: 'C', text: 'Microsoft Windows 1.0', correct: false },
      { label: 'D', text: 'IBM PC XT', correct: false },
    ],
    explanation:
      'Xerox Alto (1973) được phát triển tại Xerox PARC là máy tính đầu tiên có GUI với desktop metaphor. Apple Macintosh (1984) là máy tính đầu tiên thương mại hóa GUI thành công.',
  },
  {
    id: 'q2',
    question: '"Desktop Metaphor" trong thiết kế UI nghĩa là gì?',
    options: [
      { label: 'A', text: 'Hình nền màn hình đẹp', correct: false },
      { label: 'B', text: 'Giao diện mô phỏng bàn làm việc thực tế', correct: true },
      { label: 'C', text: 'Phần mềm quản lý desktop', correct: false },
      { label: 'D', text: 'Màu sắc giao diện', correct: false },
    ],
    explanation:
      'Desktop Metaphor là phép ẩn dụ thiết kế giao diện mô phỏng bàn làm việc thực tế: file, thư mục, thùng rác, cửa sổ. Được Xerox PARC phát minh và phổ biến bởi Apple.',
  },
  {
    id: 'q3',
    question: 'Steve Jobs gặp GUI lần đầu ở đâu?',
    options: [
      { label: 'A', text: 'MIT Media Lab', correct: false },
      { label: 'B', text: 'Bell Labs', correct: false },
      { label: 'C', text: 'Xerox PARC', correct: true },
      { label: 'D', text: 'Stanford Research Institute', correct: false },
    ],
    explanation:
      'Năm 1979, Steve Jobs thăm quan Xerox PARC và chứng kiến GUI của Alto. Ông ngay lập tức nhận ra đây là tương lai của máy tính cá nhân và đưa concept này vào Apple Lisa (1983) và Macintosh (1984).',
  },
];

// ─── Flashcard Data ───────────────────────────────────────────

export const flashcards: Flashcard[] = [
  {
    id: 'fc1',
    front: 'CLI là gì?',
    back: 'Command-Line Interface — giao diện dòng lệnh, người dùng nhập lệnh text để tương tác với OS. Ví dụ: Terminal trong Linux/macOS, CMD/PowerShell trong Windows.',
  },
  {
    id: 'fc2',
    front: 'Desktop Metaphor là gì?',
    back: 'Phép ẩn dụ desktop — giao diện mô phỏng bàn làm việc thực tế với biểu tượng file, thư mục, thùng rác. Được Xerox PARC phát minh năm 1973.',
  },
  {
    id: 'fc3',
    front: 'Xerox PARC là gì?',
    back: 'Palo Alto Research Center — trung tâm nghiên cứu của Xerox, nơi phát minh GUI, chuột máy tính, Ethernet, laser printer, object-oriented programming.',
  },
  {
    id: 'fc4',
    front: 'Window Manager (WM) là gì?',
    back: 'Phần mềm kiểm soát vị trí và giao diện cửa sổ. Có 2 loại: Floating WM (cửa sổ chồng lên nhau) và Tiling WM (cửa sổ xếp cạnh nhau, không chồng).',
  },
  {
    id: 'fc5',
    front: 'Compositing trong đồ họa là gì?',
    back: 'Kỹ thuật kết hợp nhiều lớp hình ảnh thành ảnh cuối cùng. Trong OS, compositing WM dùng GPU để vẽ hiệu ứng transparency, shadow, animation mượt mà.',
  },
  {
    id: 'fc6',
    front: 'Touch interface thay đổi UI như thế nào?',
    back: 'iPhone (2007) của Apple mang touch screen trực tiếp — ngón tay thay thế chuột. Yêu cầu UI elements to hơn (min 44×44pt), loại bỏ hover states, thêm gesture controls.',
  },
  {
    id: 'fc7',
    front: 'WIMP là viết tắt của gì?',
    back: 'Windows, Icons, Menus, Pointer — bốn yếu tố cốt lõi của GUI truyền thống. Được phát triển tại Xerox PARC và trở thành chuẩn mực cho GUI từ 1970s đến nay.',
  },
  {
    id: 'fc8',
    front: 'Fitts\' Law ảnh hưởng thế nào đến UI design?',
    back: 'Thời gian để di chuyển chuột đến mục tiêu tỉ lệ với khoảng cách/kích thước. UI tốt: đặt nút hay dùng ở góc/cạnh màn hình (kích thước vô hạn) và làm nút đủ to.',
  },
  {
    id: 'fc9',
    front: 'Tại sao terminal/CLI vẫn phổ biến dù GUI tồn tại?',
    back: 'CLI mạnh hơn cho automation, scripting, remote access qua SSH, và xử lý hàng loạt file. Các lệnh có thể pipe lại với nhau. CLI thường nhanh hơn GUI cho power users.',
  },
  {
    id: 'fc10',
    front: 'Wayland vs X11 là gì?',
    back: 'X11 (X Window System) — giao thức display server cũ, ra đời 1984. Wayland — giao thức mới hơn (2008), đơn giản hơn, bảo mật hơn, hiệu năng tốt hơn. Linux đang dần chuyển từ X11 sang Wayland.',
  },
];

// ─── Essay Question ───────────────────────────────────────────

export const essayQuestion: EssayQuestion = {
  id: 'e1',
  question: 'Phân tích ưu nhược điểm của GUI so với CLI trong bối cảnh quản trị hệ thống Linux. Cho ví dụ cụ thể.',
};

// ─── Teach AI ─────────────────────────────────────────────────

export const teachAIPrompt: TeachAIPrompt = {
  id: 'ta1',
  topic: 'Desktop Metaphor',
  aiQuestion:
    'Tôi chưa hiểu về khái niệm "Desktop Metaphor" trong thiết kế giao diện. Bạn có thể giải thích rõ hơn cho tôi không? Ví dụ cụ thể sẽ rất hữu ích!',
};

// ─── AI Chat Responses ────────────────────────────────────────

export const aiResponses: AIResponse[] = [
  {
    question: 'GUI ra đời khi nào?',
    answer:
      'GUI ra đời chính thức vào năm 1973 tại Xerox PARC với máy tính Alto. Tuy nhiên, để đến tay người dùng phổ thông phải đến năm 1984 khi Apple Macintosh ra mắt với mức giá 2.495 USD — đắt nhưng là lần đầu GUI được thương mại hóa thành công.',
  },
  {
    question: 'So sánh CLI vs GUI?',
    answer:
      'CLI (Command Line Interface): nhanh, mạnh, scriptable, dùng tốt qua SSH, nhưng có learning curve cao. GUI (Graphical User Interface): trực quan, dễ học, phù hợp người dùng phổ thông, nhưng chậm hơn cho power users và khó tự động hóa. Thực tế, sysadmin giỏi cần thành thạo cả hai.',
  },
  {
    question: 'Apple vs Windows?',
    answer:
      'Apple Lisa (1983) và Macintosh (1984) là những GUI đầu tiên thành công. Microsoft Windows 1.0 ra mắt năm 1985 — ban đầu là overlay chạy trên DOS. Cuộc chiến pháp lý giữa Apple và Microsoft về "look and feel" của GUI kéo dài đến 1994 và kết thúc không có người thắng rõ ràng.',
  },
  {
    question: 'Xerox PARC là gì?',
    answer:
      'Xerox PARC (Palo Alto Research Center) là trung tâm nghiên cứu của Xerox, được thành lập năm 1970. Đây là nơi phát minh ra GUI, chuột máy tính, Ethernet, laser printer, và object-oriented programming. Ironically, Xerox không thương mại hóa thành công các phát minh của mình — Apple và Microsoft là những người hưởng lợi chính.',
  },
];

export const suggestedQuestions = [
  'GUI ra đời khi nào?',
  'So sánh CLI vs GUI?',
  'Apple vs Windows?',
  'Xerox PARC là gì?',
];

// ─── Group Chat ───────────────────────────────────────────────

export const groupChatMessages: ChatMessage[] = [
  {
    id: 'cm1',
    sender: 'Minh Anh',
    text: 'Mọi người ơi, phần Shell có khó không? Mình thấy hơi choáng 😅',
    time: '14:23',
  },
  {
    id: 'cm2',
    sender: 'Hoàng',
    text: 'Không khó lắm đâu bạn ơi, xem video trước là hiểu thôi!',
    time: '14:25',
  },
  {
    id: 'cm3',
    sender: 'Linh',
    text: 'Mình cũng đang học phần này. Có ai làm bài tập chưa?',
    time: '14:30',
  },
  {
    id: 'cm4',
    sender: 'Hoàng',
    text: 'Rồi, bài 1-3 dễ. Bài 4 cần xem lại pipe và redirect',
    time: '14:31',
  },
];

// ─── Context Menu Units ───────────────────────────────────────

export const nearbyUnits = [
  'Bảo mật Hệ Thống',
  'Networking Cơ Bản',
  'Docker & Containers',
  'Quản Trị Server',
  'CI/CD Pipeline',
];
