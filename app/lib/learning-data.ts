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
    subtitle: 'Các khái niệm nền tảng về hệ điều hành và vai trò của nó trong hệ thống máy tính',
    documents: [
      { id: 'kn-1', title: 'Hệ điều hành là gì? Tổng quan 60 phút', type: 'video', duration: '60 phút' },
      { id: 'kn-2', title: 'Lịch sử phát triển HĐH: từ Batch Processing đến Cloud OS', type: 'pdf', size: '15 trang' },
      { id: 'kn-3', title: 'So sánh các loại HĐH: Windows vs Linux vs macOS', type: 'pdf', size: '8 trang' },
      { id: 'kn-4', title: 'Bài tập: Phân loại hệ điều hành', type: 'worksheet', size: '3 trang' },
    ],
  },
  {
    id: 'kien-truc',
    label: 'Kiến Trúc Hệ Thống',
    subtitle: 'Cấu trúc nội tại của hệ điều hành — kernel, user space, system calls, drivers',
    documents: [
      { id: 'kt-1', title: 'Kernel, Shell và System Calls', type: 'video', duration: '45 phút' },
      { id: 'kt-2', title: 'Kiến trúc monolithic vs microkernel', type: 'pdf', size: '12 trang' },
      { id: 'kt-3', title: 'Linux Kernel Architecture deep dive', type: 'pdf', size: '20 trang' },
    ],
  },
  {
    id: 'quan-ly',
    label: 'Quản Lý Tài Nguyên',
    subtitle: 'CPU scheduling, memory management, I/O management và file system',
    documents: [
      { id: 'ql-1', title: 'Process Management trong Linux', type: 'video', duration: '50 phút' },
      { id: 'ql-2', title: 'Memory Management: Paging và Segmentation', type: 'pdf', size: '18 trang' },
      { id: 'ql-3', title: 'I/O Management và Device Drivers', type: 'video', duration: '35 phút' },
    ],
  },
  {
    id: 'giao-dien',
    label: 'Giao Diện Người Dùng (UI)',
    subtitle: 'Tổng quan về giao diện người dùng trong hệ điều hành — từ CLI đến GUI hiện đại',
    documents: [
      { id: 'gd-1', title: 'GUI vs CLI — So sánh chi tiết', type: 'video', duration: '45 phút' },
      { id: 'gd-2', title: 'Lịch sử phát triển giao diện: từ CLI đến AR/VR', type: 'pdf', size: '12 trang' },
      { id: 'gd-3', title: 'Thiết kế UX cho Hệ Điều Hành', type: 'video', duration: '30 phút' },
      { id: 'gd-4', title: 'Window Manager: X11, Wayland và tương lai', type: 'pdf', size: '8 trang' },
      { id: 'gd-5', title: 'Thực hành: Tùy chỉnh Desktop Environment trên Linux', type: 'worksheet', size: '5 trang' },
    ],
  },
  {
    id: 'he-dieu-hanh',
    label: 'Hệ Điều Hành Phổ Biến',
    subtitle: 'So sánh Windows, macOS, Linux và các hệ điều hành phổ biến khác',
    documents: [
      { id: 'hdh-1', title: 'Linux Distributions: Ubuntu, Fedora, Arch', type: 'video', duration: '40 phút' },
      { id: 'hdh-2', title: 'Windows Internals tóm tắt', type: 'pdf', size: '10 trang' },
      { id: 'hdh-3', title: 'macOS và Darwin Kernel', type: 'pdf', size: '8 trang' },
    ],
  },
  {
    id: 'lap-trinh-shell',
    label: 'Lập Trình Shell (BASH)',
    subtitle: 'Scripting Bash, tự động hóa tác vụ hệ thống với shell script',
    documents: [
      { id: 'sh-1', title: 'Bash Scripting từ zero đến hero', type: 'video', duration: '90 phút' },
      { id: 'sh-2', title: 'Cheat sheet: 50 lệnh Linux quan trọng nhất', type: 'pdf', size: '5 trang' },
      { id: 'sh-3', title: 'Viết script tự động hóa: backup, monitoring, deploy', type: 'pdf', size: '15 trang' },
      { id: 'sh-4', title: 'Lab: Viết 5 bash scripts thực tế', type: 'worksheet', size: '10 trang' },
    ],
  },
  {
    id: 'khoi-dong',
    label: 'Khởi Động và Debug',
    subtitle: 'Boot process, GRUB, systemd, dmesg, strace và debug hệ thống Linux',
    documents: [
      { id: 'kd-1', title: 'Linux Boot Process: BIOS → GRUB → Kernel → Init', type: 'video', duration: '35 phút' },
      { id: 'kd-2', title: 'Debugging với strace, ltrace, gdb', type: 'pdf', size: '12 trang' },
      { id: 'kd-3', title: 'System logs và journalctl', type: 'pdf', size: '8 trang' },
    ],
  },
];

// ─── Document Text Content ─────────────────────────────────────

export const documentTextContent: Record<string, string[]> = {
  'gd-2': [
    'Giao diện người dùng (User Interface - UI) đã trải qua hành trình phát triển dài hơn 60 năm, từ những dòng lệnh đơn giản đến các giao diện thực tế ảo ngày nay.',
    'Thời kỳ Dòng Lệnh (1960s-1980s)\nNhững hệ điều hành đầu tiên như UNIX (1969) và MS-DOS (1981) sử dụng giao diện dòng lệnh (CLI - Command Line Interface). Người dùng phải gõ lệnh văn bản chính xác để thực hiện mọi tác vụ. Ví dụ, để sao chép file trong UNIX: cp file1.txt /home/user/backup/. Dù khó sử dụng cho người mới, CLI vẫn là công cụ mạnh mẽ nhất cho quản trị hệ thống cho đến ngày nay.',
    'Sự Ra Đời của GUI (1973-1984)\nNăm 1973, Xerox PARC (Palo Alto Research Center) giới thiệu Alto — máy tính đầu tiên có giao diện đồ họa. Khái niệm "Desktop Metaphor" ra đời: màn hình mô phỏng bàn làm việc thực tế với biểu tượng file, thư mục, và thùng rác. Tuy nhiên, Alto chỉ là sản phẩm thử nghiệm.\n\nApple Macintosh (1984) là máy tính thương mại đầu tiên phổ biến GUI đến người dùng. Steve Jobs, sau chuyến thăm Xerox PARC, đã phát triển Lisa (1983) và sau đó Macintosh với giao diện trực quan, chuột, và hệ thống menu pull-down.',
    'Kỷ Nguyên Windows (1985-2000s)\nMicrosoft Windows 1.0 ra mắt năm 1985, nhưng phải đến Windows 95 (1995) mới thực sự thay đổi cuộc chơi với thanh taskbar, nút Start, và khả năng đa nhiệm. Windows XP (2001) mang đến giao diện Luna đầy màu sắc, trở thành HĐH phổ biến nhất lịch sử.',
    'Giao Diện Hiện Đại (2007-nay)\niPhone (2007) cách mạng hóa giao diện chạm (touch interface). Multi-touch, gestures, và responsive design trở thành tiêu chuẩn. Windows 8 (2012) thử nghiệm giao diện Metro cho touch screen. macOS và Linux desktop environments (GNOME, KDE) tiếp tục phát triển với animations mượt mà và tối ưu UX.\n\nTương lai thuộc về voice UI (Siri, Alexa), AR/VR interface (Apple Vision Pro, Meta Quest), và brain-computer interfaces đang được nghiên cứu.',
  ],
  'gd-4': [
    'Window Manager (WM) là thành phần phần mềm kiểm soát vị trí và giao diện của các cửa sổ trong môi trường đồ họa. Trong hệ sinh thái Linux, window manager hoạt động độc lập với desktop environment (DE), cho phép người dùng tùy biến cao.',
    'Có hai loại chính: Floating WM (như Openbox, Fluxbox) cho phép cửa sổ chồng lên nhau tự do, và Tiling WM (như i3, bspwm, sway) sắp xếp cửa sổ không chồng lên nhau, tối đa hóa không gian màn hình. Tiling WM rất phổ biến với lập trình viên vì tăng năng suất.',
    'X11 (X Window System) là giao thức display server cổ điển, ra đời năm 1984, được dùng rộng rãi trong nhiều thập kỷ. Wayland là giao thức thế hệ mới (2008) với thiết kế đơn giản hơn, bảo mật tốt hơn và hiệu năng cao hơn. Linux đang dần chuyển từ X11 sang Wayland trong những năm gần đây.',
    'Trên Windows, WM được tích hợp sâu vào Desktop Window Manager (DWM). macOS sử dụng Quartz Compositor. Cả hai đều cung cấp compositing — khả năng vẽ hiệu ứng transparency, shadow, và animation mượt mà nhờ GPU acceleration.',
  ],
  'kn-2': [
    'Hệ điều hành (Operating System — OS) là phần mềm hệ thống quản lý phần cứng máy tính và cung cấp dịch vụ cho các chương trình ứng dụng. Nó là lớp trung gian giữa phần cứng và phần mềm ứng dụng, giúp người dùng và lập trình viên làm việc mà không cần hiểu chi tiết về phần cứng.',
    'Các chức năng cốt lõi của OS bao gồm: quản lý tiến trình (process management), quản lý bộ nhớ (memory management), quản lý thiết bị I/O, quản lý file system, và bảo mật hệ thống. Không có OS, máy tính chỉ là một tập hợp phần cứng không thể sử dụng được.',
    'Kernel là trái tim của OS — phần duy nhất chạy ở chế độ đặc quyền (kernel mode) với toàn quyền truy cập phần cứng. Mọi ứng dụng người dùng chạy ở user mode và phải yêu cầu OS thực hiện các tác vụ đặc quyền thông qua system calls.',
    'Lịch sử phát triển OS bắt đầu từ những năm 1950 với batch processing. Đến 1961, MIT phát triển CTSS — hệ thống time-sharing đầu tiên. UNIX ra đời năm 1969 tại Bell Labs, đặt nền móng cho nhiều OS hiện đại. Linux Kernel được Linus Torvalds viết năm 1991, hiện là nền tảng của Android, Ubuntu, và nhiều server trên toàn thế giới.',
    'Các loại hệ điều hành chính bao gồm: Batch OS (xử lý hàng loạt), Time-Sharing OS (chia thời gian cho nhiều user), Real-Time OS (đảm bảo thời gian phản hồi), Distributed OS (phân tán trên nhiều máy), và Embedded OS (nhúng trong thiết bị IoT, xe hơi, máy móc công nghiệp).',
  ],
  'ql-2': [
    'Memory Management là một trong những chức năng quan trọng nhất của hệ điều hành, chịu trách nhiệm phân bổ và quản lý bộ nhớ RAM cho các tiến trình đang chạy.',
    'Paging (Phân trang) là kỹ thuật chia bộ nhớ vật lý thành các khung (frames) có kích thước cố định, và chia không gian địa chỉ của tiến trình thành các trang (pages) cùng kích thước. OS duy trì page table để ánh xạ địa chỉ ảo sang địa chỉ vật lý. Kỹ thuật này loại bỏ vấn đề phân mảnh ngoài (external fragmentation).',
    'Segmentation (Phân đoạn) chia bộ nhớ theo đơn vị logic như code segment, data segment, stack segment. Mỗi đoạn có kích thước khác nhau phù hợp với nhu cầu thực tế. Nhiều kiến trúc hiện đại kết hợp cả paging và segmentation.',
    'Virtual Memory (Bộ nhớ ảo) là kỹ thuật cho phép chương trình sử dụng nhiều bộ nhớ hơn RAM thực tế bằng cách dùng đĩa cứng (swap space) làm phần mở rộng. OS sử dụng demand paging — chỉ tải page vào RAM khi cần thiết. Khi RAM đầy, thuật toán page replacement (LRU, FIFO, Clock) sẽ chọn page nào cần đẩy ra đĩa.',
  ],
  'sh-2': [
    'Bash (Bourne Again Shell) là shell phổ biến nhất trong Linux/macOS. Dưới đây là 50 lệnh quan trọng nhất mọi sysadmin và developer cần biết.',
    'Quản lý file và thư mục: ls (liệt kê file), cd (chuyển thư mục), pwd (in đường dẫn hiện tại), mkdir (tạo thư mục), rm (xóa file), cp (sao chép), mv (di chuyển/đổi tên), find (tìm kiếm file), locate (tìm nhanh), tree (hiển thị cấu trúc thư mục).',
    'Xem và xử lý nội dung file: cat (xem toàn bộ), less/more (xem từng trang), head/tail (xem đầu/cuối), grep (tìm kiếm text), sed (chỉnh sửa stream), awk (xử lý cột dữ liệu), cut (cắt cột), sort (sắp xếp), uniq (loại bỏ trùng lặp), wc (đếm dòng/từ/ký tự).',
    'Quản lý tiến trình: ps (liệt kê process), top/htop (monitor real-time), kill/killall (dừng process), bg/fg (chạy nền/foreground), jobs (liệt kê jobs), nice/renice (điều chỉnh priority), nohup (chạy không bị ngắt khi logout).',
    'Mạng máy tính: ping (kiểm tra kết nối), curl/wget (tải file từ web), ssh (kết nối remote), scp (sao chép qua SSH), netstat/ss (xem kết nối mạng), ifconfig/ip (cấu hình network interface), nmap (quét mạng), traceroute (theo dõi đường đi gói tin).',
    'Quản lý hệ thống: df (dung lượng đĩa), du (kích thước thư mục), free (RAM khả dụng), uname (thông tin kernel), lsblk (liệt kê thiết bị block), mount/umount (gắn/tháo ổ đĩa), chmod (phân quyền file), chown (thay đổi chủ sở hữu), sudo (chạy với quyền root), systemctl (quản lý services).',
  ],
};

// ─── Video Transcript ─────────────────────────────────────────

export const videoTranscripts: Record<string, string> = {
  'gd-1': '...trong phần này chúng ta sẽ so sánh hai phong cách tương tác chính với hệ điều hành: GUI — giao diện đồ họa với cửa sổ và biểu tượng, và CLI — giao diện dòng lệnh với text commands. GUI trực quan, dễ học cho người mới nhưng tốn tài nguyên hơn. CLI mạnh hơn cho automation, scripting và quản trị hệ thống từ xa qua SSH...',
  'gd-3': '...UX design cho hệ điều hành đòi hỏi sự cân bằng giữa power user features và accessibility cho người mới. Chúng ta sẽ xem xét các nguyên tắc thiết kế của Fitts Law — thời gian di chuyển chuột tỉ lệ thuận với khoảng cách và tỉ lệ nghịch với kích thước mục tiêu. Đây là lý do thanh taskbar nằm ở cạnh màn hình — vô hạn kích thước theo một chiều...',
  'kn-1': '...hệ điều hành là phần mềm nền tảng quản lý toàn bộ tài nguyên phần cứng. Hãy tưởng tượng OS như người quản lý của một tòa nhà văn phòng — nó phân chia không gian (bộ nhớ), lên lịch sử dụng thang máy (CPU scheduling), và đảm bảo các phòng không xung đột nhau (process isolation)...',
  'ql-1': '...Process Management là cơ chế OS quản lý các chương trình đang chạy. Mỗi process có PCB (Process Control Block) lưu trữ: PID, trạng thái (running/waiting/blocked), program counter, CPU registers, và thông tin bộ nhớ. CPU Scheduling quyết định process nào được dùng CPU: FCFS (First Come First Served), Round Robin, Priority Scheduling, và CFS (Completely Fair Scheduler) của Linux...',
  'sh-1': '...chào mừng đến với khóa học Bash Scripting từ zero đến hero! Script đầu tiên của bạn sẽ là Hello World: #!/bin/bash echo "Hello World". Dòng đầu tiên là shebang — chỉ định trình thông dịch. Biến trong bash: NAME="Minh" echo "Xin chào $NAME". Vòng lặp for: for i in {1..5}; do echo $i; done. Conditional: if [ $? -eq 0 ]; then echo "OK"; else echo "Error"; fi...',
  'kd-1': '...quá trình khởi động Linux đi qua các bước: BIOS/UEFI → POST (Power-On Self Test) → MBR/GPT (Master Boot Record) → GRUB (bootloader) → Kernel decompression → initramfs → init/systemd → runlevel/target → login prompt. GRUB cho phép bạn chọn kernel hoặc boot từ ổ đĩa khác. systemd là init system hiện đại, khởi động các services song song để tăng tốc boot...',
  'hdh-1': '...Linux có hàng trăm distributions nhưng phổ biến nhất là: Ubuntu (dễ dùng, hỗ trợ tốt, phù hợp người mới), Fedora (bleeding-edge, sponsored bởi Red Hat, tốt cho developer), Arch Linux (rolling release, cấu hình thủ công hoàn toàn, dành cho advanced users). Mỗi distro có package manager riêng: apt (Ubuntu/Debian), dnf (Fedora), pacman (Arch)...',
};

// ─── Quiz Data ────────────────────────────────────────────────

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Máy tính đầu tiên có giao diện đồ họa (GUI) là?',
    options: [
      { label: 'A', text: 'Apple Macintosh (1984)', correct: false },
      { label: 'B', text: 'Xerox Alto (1973)', correct: true },
      { label: 'C', text: 'Microsoft Windows 1.0 (1985)', correct: false },
      { label: 'D', text: 'IBM PC XT (1983)', correct: false },
    ],
    explanation:
      'Xerox Alto (1973) được phát triển tại Xerox PARC là máy tính đầu tiên có GUI với desktop metaphor. Apple Macintosh (1984) là máy tính thương mại đầu tiên đưa GUI đến tay người dùng phổ thông.',
  },
  {
    id: 'q2',
    question: 'Linux Kernel được viết bởi ai và vào năm nào?',
    options: [
      { label: 'A', text: 'Dennis Ritchie, 1969', correct: false },
      { label: 'B', text: 'Richard Stallman, 1983', correct: false },
      { label: 'C', text: 'Linus Torvalds, 1991', correct: true },
      { label: 'D', text: 'Ken Thompson, 1975', correct: false },
    ],
    explanation:
      'Linus Torvalds, sinh viên Đại học Helsinki (Phần Lan), viết Linux Kernel năm 1991 khi 21 tuổi. Ông công bố trên newsgroup comp.os.minix với tin nhắn nổi tiếng: "I\'m doing a (free) operating system (just a hobby, won\'t be big and professional like gnu)".',
  },
  {
    id: 'q3',
    question: 'Lệnh nào trong Linux dùng để liệt kê các file trong thư mục?',
    options: [
      { label: 'A', text: 'ls', correct: true },
      { label: 'B', text: 'dir', correct: false },
      { label: 'C', text: 'list', correct: false },
      { label: 'D', text: 'show', correct: false },
    ],
    explanation:
      'Lệnh ls (list) là lệnh cơ bản nhất trong Linux để liệt kê file. Các option phổ biến: ls -la (hiện tất cả file gồm ẩn, dạng chi tiết), ls -lh (kích thước dễ đọc), ls -lt (sắp xếp theo thời gian). Lệnh dir tồn tại nhưng ít dùng hơn.',
  },
  {
    id: 'q4',
    question: 'Một process đang chờ I/O (ví dụ: đọc file từ đĩa) ở trạng thái nào?',
    options: [
      { label: 'A', text: 'Running — đang chiếm CPU', correct: false },
      { label: 'B', text: 'Ready — sẵn sàng chạy', correct: false },
      { label: 'C', text: 'New — vừa được tạo', correct: false },
      { label: 'D', text: 'Waiting/Blocked — đang chờ sự kiện', correct: true },
    ],
    explanation:
      'Khi process yêu cầu I/O (đọc file, nhận network packet), nó chuyển từ Running sang Waiting/Blocked và nhường CPU cho process khác. Khi I/O hoàn tất, OS đưa process về Ready queue để chờ được CPU cấp phát lại. Đây là cơ chế cho phép CPU không bị lãng phí khi chờ I/O chậm.',
  },
  {
    id: 'q5',
    question: 'GRUB trong Linux là gì?',
    options: [
      { label: 'A', text: 'Một desktop environment', correct: false },
      { label: 'B', text: 'Bootloader — chương trình khởi động Linux', correct: true },
      { label: 'C', text: 'Trình quản lý package', correct: false },
      { label: 'D', text: 'Công cụ debug kernel', correct: false },
    ],
    explanation:
      'GRUB (GRand Unified Bootloader) là bootloader phổ biến nhất trong Linux. Nó được BIOS/UEFI gọi sau POST, cho phép người dùng chọn OS hoặc kernel để boot. GRUB2 là phiên bản hiện đại hỗ trợ UEFI, GPT partition và nhiều tính năng nâng cao.',
  },
];

// ─── Flashcard Data ───────────────────────────────────────────

export const flashcards: Flashcard[] = [
  {
    id: 'fc1',
    front: 'Desktop Metaphor là gì?',
    back: 'Phép ẩn dụ desktop — giao diện mô phỏng bàn làm việc thực tế với biểu tượng file, thư mục, thùng rác. Được Xerox PARC phát minh năm 1973, phổ biến bởi Apple Macintosh 1984.',
  },
  {
    id: 'fc2',
    front: 'CLI là gì?',
    back: 'Command Line Interface — giao diện dòng lệnh, người dùng nhập lệnh text để tương tác với OS. Ví dụ: Terminal trong Linux/macOS, CMD/PowerShell trong Windows. Mạnh hơn GUI cho automation và scripting.',
  },
  {
    id: 'fc3',
    front: 'Kernel là gì?',
    back: 'Lõi hệ điều hành — phần mềm chạy ở kernel mode với toàn quyền truy cập phần cứng. Quản lý CPU, RAM, I/O, và cung cấp system calls cho ứng dụng. Linux kernel do Linus Torvalds viết năm 1991.',
  },
  {
    id: 'fc4',
    front: 'Process vs Thread khác nhau thế nào?',
    back: 'Process là chương trình đang chạy có không gian bộ nhớ riêng biệt (isolated). Thread là đơn vị thực thi nhỏ nhất trong process, chia sẻ bộ nhớ với các thread cùng process. Multi-threading nhanh hơn multi-processing nhưng dễ gây race condition.',
  },
  {
    id: 'fc5',
    front: 'Virtual Memory là gì?',
    back: 'Bộ nhớ ảo — kỹ thuật cho phép chương trình sử dụng nhiều RAM hơn thực tế bằng cách dùng đĩa cứng (swap space) làm phần mở rộng. OS dùng demand paging: chỉ tải page vào RAM khi thực sự cần, đẩy page ít dùng ra đĩa.',
  },
  {
    id: 'fc6',
    front: 'Wayland vs X11 khác nhau thế nào?',
    back: 'X11 (X Window System, 1984) là display protocol cũ, phức tạp, có bảo mật kém. Wayland (2008) là protocol mới đơn giản hơn, bảo mật tốt hơn, hiệu năng cao hơn nhờ ít overhead. Linux đang dần chuyển từ X11 sang Wayland.',
  },
  {
    id: 'fc7',
    front: 'System Call là gì?',
    back: 'Cơ chế để ứng dụng user mode yêu cầu OS thực hiện tác vụ đặc quyền (truy cập phần cứng, tạo process, đọc file). Ví dụ: open(), read(), write(), fork(), exec(). System call chuyển CPU từ user mode sang kernel mode một cách an toàn.',
  },
  {
    id: 'fc8',
    front: 'BASH shebang (#!/bin/bash) là gì?',
    back: 'Shebang là dòng đầu tiên của script, chỉ định trình thông dịch sẽ chạy script. #!/bin/bash → dùng Bash. #!/usr/bin/env python3 → dùng Python 3. #!/bin/sh → dùng POSIX shell tương thích. Thiếu shebang, OS sẽ không biết cách chạy file.',
  },
];

// ─── Essay Question ───────────────────────────────────────────

export const essayQuestion: EssayQuestion = {
  id: 'e1',
  question:
    'Phân tích ưu nhược điểm của GUI so với CLI trong quản trị hệ thống Linux. Cho ví dụ cụ thể cho từng trường hợp sử dụng phù hợp.',
};

// ─── Teach AI ─────────────────────────────────────────────────

export const teachAIPrompt: TeachAIPrompt = {
  id: 'ta1',
  topic: 'Process Scheduling',
  aiQuestion:
    'Tôi chưa hiểu về Process Scheduling trong Linux. Bạn có thể giải thích các thuật toán scheduling chính không? Đặc biệt là CFS (Completely Fair Scheduler) mà Linux đang dùng.',
};

// ─── AI Chat Responses ────────────────────────────────────────

export const aiResponses: AIResponse[] = [
  {
    question: 'GUI ra đời khi nào?',
    answer:
      'GUI ra đời chính thức vào năm 1973 tại Xerox PARC với máy tính Alto. Tuy nhiên, để đến tay người dùng phổ thông phải đến năm 1984 khi Apple Macintosh ra mắt. Steve Jobs đã thăm Xerox PARC năm 1979 và nhận ra tiềm năng của GUI, từ đó tích hợp vào Apple Lisa (1983) và Macintosh (1984).',
  },
  {
    question: 'So sánh CLI vs GUI?',
    answer:
      'CLI (Command Line Interface): nhanh, mạnh, scriptable, hoạt động tốt qua SSH remote, xử lý hàng loạt file dễ dàng, nhưng có learning curve cao. GUI (Graphical User Interface): trực quan, dễ học, phù hợp người dùng phổ thông, nhưng chậm hơn cho power users và khó tự động hóa. Sysadmin giỏi cần thành thạo cả hai: GUI cho visual tasks, CLI cho automation và server management.',
  },
  {
    question: 'Kernel Linux là gì?',
    answer:
      'Linux Kernel là lõi của hệ điều hành Linux, được Linus Torvalds viết năm 1991. Đây là monolithic kernel — tất cả driver và dịch vụ OS chạy trong kernel space. Kernel quản lý: CPU scheduling (CFS), memory (paging, virtual memory), file systems (ext4, btrfs), device drivers, và network stack. Linux kernel hiện có khoảng 30 triệu dòng code và được đóng góp bởi hàng nghìn developer toàn cầu.',
  },
  {
    question: 'Process Scheduling là gì?',
    answer:
      'Process Scheduling là cơ chế OS quyết định process nào được chạy trên CPU. Các thuật toán: FCFS (First Come First Served) — đơn giản nhưng có convoy effect. Round Robin — mỗi process được dùng CPU một lượng thời gian cố định (time quantum). Priority Scheduling — ưu tiên process quan trọng hơn. CFS (Completely Fair Scheduler) của Linux — dùng red-black tree để đảm bảo mọi process được CPU thời gian công bằng dựa trên weight.',
  },
  {
    question: 'Xerox PARC là gì?',
    answer:
      'Xerox PARC (Palo Alto Research Center) là trung tâm nghiên cứu của Xerox, thành lập năm 1970. Đây là nơi phát minh ra: GUI và desktop metaphor (1973), chuột máy tính, Ethernet (mạng LAN), laser printer, object-oriented programming (Smalltalk), và WYSIWYG text editor. Ironically, Xerox không thương mại hóa được các phát minh của mình — Apple và Microsoft hưởng lợi chính từ GUI.',
  },
  {
    question: 'Linux Boot Process?',
    answer:
      'Quá trình boot Linux: 1) BIOS/UEFI POST (Power-On Self Test). 2) BIOS tìm MBR/GPT trên đĩa khởi động. 3) GRUB bootloader được nạp — hiển thị menu chọn kernel. 4) Kernel được giải nén và nạp vào RAM. 5) Kernel khởi tạo hardware, mount initramfs. 6) systemd (init system) chạy — khởi động các services song song. 7) Login prompt hiển thị. Toàn bộ quá trình thường mất 10-30 giây trên SSD.',
  },
];

export const suggestedQuestions = [
  'GUI ra đời khi nào?',
  'So sánh CLI vs GUI?',
  'Kernel Linux là gì?',
  'Process Scheduling là gì?',
];

// ─── Group Chat ───────────────────────────────────────────────

export const groupChatMessages: ChatMessage[] = [
  {
    id: 'cm1',
    sender: 'Minh Anh',
    text: 'Mọi người làm lab 3 chưa? Phần bash script ý 😅',
    time: '10:30',
  },
  {
    id: 'cm2',
    sender: 'Hoàng',
    text: 'Rồi, nhưng bài 4 hơi khó. Ai biết cách dùng awk không?',
    time: '10:32',
  },
  {
    id: 'cm3',
    sender: 'Lan',
    text: 'Để mình share link tutorial nhé. Cái này giải thích rõ lắm',
    time: '10:35',
  },
  {
    id: 'cm4',
    sender: 'Minh Anh',
    text: 'Thanks Lan! Chiều nay mình học nhóm ở thư viện nhé? 📚',
    time: '10:38',
  },
];

// ─── Context Menu Units ───────────────────────────────────────

export const nearbyUnits = [
  'Bảo Mật Hệ Thống Linux',
  'Networking và TCP/IP',
  'Docker và Containers',
  'Quản Trị Server Linux',
  'CI/CD Pipeline với Bash',
];
