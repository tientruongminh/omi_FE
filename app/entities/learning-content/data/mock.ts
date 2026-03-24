import {
  LearningDocument, MindmapNodeData, QuizQuestion, Flashcard,
  EssayQuestion, TeachAIPrompt, ChatMessage, AIResponse,
} from '../model/types';













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
  'kn-3': [
    'Hiện nay có ba hệ điều hành desktop phổ biến nhất: Windows, macOS và Linux. Mỗi hệ điều hành có triết lý thiết kế, ưu nhược điểm và đối tượng người dùng khác nhau.',
    'Windows (Microsoft): Chiếm ~72% thị phần desktop. Ưu điểm: phần mềm tương thích nhiều nhất (đặc biệt game và office), driver hỗ trợ rộng, quen thuộc với đa số người dùng. Nhược điểm: nặng tài nguyên, dễ bị malware, license phí, telemetry thu thập dữ liệu nhiều. Kernel: Windows NT — hybrid kernel.',
    'macOS (Apple): Chiếm ~16% thị phần desktop. Ưu điểm: UX mượt mà nhất, tích hợp tốt với hệ sinh thái Apple (iPhone, iPad, AirDrop), ổn định cao, terminal Unix-based. Nhược điểm: chỉ chạy trên phần cứng Apple (đắt), ít tùy biến, software ecosystem nhỏ hơn Windows. Kernel: XNU — hybrid kernel dựa trên Mach + BSD.',
    'Linux: Chiếm ~4% desktop nhưng >90% server và cloud. Ưu điểm: miễn phí hoàn toàn, mã nguồn mở, tùy biến cao nhất, nhẹ và nhanh, bảo mật tốt nhất, terminal mạnh mẽ. Nhược điểm: learning curve cao, hỗ trợ phần mềm thương mại hạn chế (Adobe, Microsoft Office), game ít hơn (nhưng đang cải thiện qua Proton). Kernel: Linux — monolithic kernel.',
    'Bảng so sánh nhanh: Giá → Windows: $139+, macOS: Miễn phí (kèm máy), Linux: Miễn phí. Bảo mật → Linux > macOS > Windows. Gaming → Windows > Linux > macOS. Lập trình → Linux ≈ macOS > Windows. Server → Linux > Windows > macOS. Dễ sử dụng → macOS > Windows > Linux.',
  ],
  'kt-2': [
    'Kiến trúc kernel là quyết định thiết kế quan trọng nhất của hệ điều hành. Hai kiến trúc chính là Monolithic Kernel và Microkernel, với nhiều biến thể lai (hybrid) ở giữa.',
    'Monolithic Kernel: Toàn bộ OS services (process management, memory management, file system, device drivers, network stack) chạy trong kernel space — một khối lớn duy nhất. Ưu điểm: hiệu năng cao nhất vì không cần IPC (Inter-Process Communication) giữa các module, system call nhanh. Nhược điểm: một lỗi trong driver có thể crash toàn bộ kernel, khó bảo trì, code base khổng lồ. Ví dụ: Linux kernel (~30 triệu dòng code).',
    'Microkernel: Chỉ giữ những chức năng tối thiểu trong kernel space: IPC, basic scheduling, memory management cơ bản. Mọi thứ khác (drivers, file system, network) chạy ở user space như các server processes. Ưu điểm: ổn định hơn (crash driver không crash kernel), bảo mật tốt hơn, dễ mở rộng. Nhược điểm: chậm hơn do overhead IPC. Ví dụ: MINIX, QNX, seL4.',
    'Hybrid Kernel: Kết hợp ưu điểm cả hai. Core services quan trọng (file system, driver chính) chạy trong kernel space cho hiệu năng, nhưng thiết kế modular cho phép load/unload components. Ví dụ: Windows NT kernel, macOS XNU kernel.',
    'Debate kinh điển: Năm 1992, Andrew Tanenbaum (tác giả MINIX) và Linus Torvalds tranh luận nổi tiếng. Tanenbaum cho rằng monolithic kernel là thiết kế lỗi thời ("a giant step back into the 1970s"). Torvalds phản biện: "Linux là monolithic, and proud of it". Thực tế chứng minh Linux thành công vượt trội dù là monolithic — nhưng Linux hiện đại hỗ trợ loadable kernel modules, mang lại sự linh hoạt gần microkernel.',
  ],
  'kt-3': [
    'Linux Kernel là một trong những dự án mã nguồn mở lớn nhất lịch sử phần mềm. Được Linus Torvalds viết năm 1991, hiện có hơn 30 triệu dòng code với hàng nghìn contributors toàn cầu.',
    'Cấu trúc Linux Kernel gồm các subsystem chính: Process Scheduler (CFS — Completely Fair Scheduler), Memory Manager (virtual memory, page cache, slab allocator), Virtual File System (VFS — abstraction layer cho ext4, btrfs, XFS, NFS), Network Stack (TCP/IP, socket layer, netfilter), và Device Drivers (chiếm >50% source code).',
    'Linux sử dụng monolithic architecture nhưng hỗ trợ Loadable Kernel Modules (LKM). Driver có thể được compile riêng và load/unload lúc runtime bằng insmod/rmmod mà không cần reboot. Ví dụ: lsmod để xem modules đã load, modprobe để load module có dependency resolution.',
    'System Call Interface: Ứng dụng user space giao tiếp với kernel qua system calls. Linux hỗ trợ khoảng 300-400 system calls (tùy architecture). Phổ biến: open(), read(), write(), close() (file I/O), fork(), execve(), wait() (process), socket(), bind(), listen() (networking). Strace là công cụ trace system calls: strace -p <PID> hoặc strace -c <command>.',
    'Memory Management trong Linux: Bộ nhớ chia thành zones (DMA, Normal, High). Page allocator dùng buddy algorithm, slab allocator (SLUB) cho kernel objects nhỏ. Page cache buffer I/O tăng hiệu năng. OOM Killer là cơ chế cuối cùng khi hết RAM — kill process chiếm nhiều bộ nhớ nhất để cứu hệ thống.',
    'Tham gia phát triển: Kernel development theo mô hình release cycle ~9 tuần. Linus merge patches từ subsystem maintainers. Gửi patch qua email (git send-email), reviewed trên LKML (Linux Kernel Mailing List). Documentation: kernel.org/doc.',
  ],
  'hdh-2': [
    'Windows là hệ điều hành desktop phổ biến nhất thế giới với hơn 1.4 tỷ thiết bị. Bên dưới giao diện quen thuộc là kiến trúc phức tạp được phát triển qua hơn 30 năm.',
    'Windows NT Kernel (NT = New Technology): Là hybrid kernel, kết hợp yếu tố monolithic và microkernel. Kernel mode bao gồm: Executive (process manager, memory manager, I/O manager, security reference monitor), Kernel proper (thread scheduling, interrupt handling), HAL (Hardware Abstraction Layer), và device drivers.',
    'User mode trong Windows bao gồm: Win32 subsystem (giao diện lập trình chính), NTDLL.dll (cầu nối user mode → kernel mode), và các subsystem environments (WSL cho Linux, SUA cho POSIX). Windows Services chạy ở user mode nhưng khởi động cùng OS.',
    'Windows Registry: Cơ sở dữ liệu phân cấp lưu trữ cấu hình hệ thống và ứng dụng. Gồm 5 root keys: HKEY_LOCAL_MACHINE, HKEY_CURRENT_USER, HKEY_CLASSES_ROOT, HKEY_USERS, HKEY_CURRENT_CONFIG. Regedit là công cụ chỉnh sửa — nhưng sai một registry key có thể làm OS không boot được.',
    'NTFS (New Technology File System): File system mặc định, hỗ trợ journaling (ghi nhật ký thay đổi để recovery nếu mất điện), file permissions (ACL — Access Control Lists), encryption (EFS), compression, hard/symbolic links, và file size tối đa 16 EB (exabytes). So sánh: FAT32 max file 4GB, exFAT hỗ trợ USB nhưng không có journaling.',
  ],
  'hdh-3': [
    'macOS là hệ điều hành của Apple, chạy trên Mac hardware. Nền tảng là Darwin — kernel mã nguồn mở kết hợp XNU kernel với BSD userspace.',
    'XNU Kernel ("X is Not Unix"): Hybrid kernel kết hợp Mach microkernel (từ Carnegie Mellon University) với FreeBSD monolithic components. Mach cung cấp: IPC (message passing), virtual memory, task/thread management. BSD layer cung cấp: POSIX API, networking (TCP/IP stack), file systems (APFS, HFS+), security framework.',
    'APFS (Apple File System): Thay thế HFS+ từ 2017. Tính năng: copy-on-write (CoW) cho crash protection, native encryption, space sharing (nhiều volumes dùng chung pool storage), snapshots, fast directory sizing. Tối ưu cho SSD và Flash storage.',
    'macOS Frameworks: Cocoa (Objective-C/Swift UI framework), Metal (GPU API thay thế OpenGL), Core ML (machine learning on-device), SwiftUI (declarative UI framework). Darwin cung cấp Terminal.app với Zsh shell mặc định (trước 2019 là Bash), hỗ trợ Homebrew package manager.',
    'Bảo mật macOS: System Integrity Protection (SIP) — ngăn chặn kể cả root user sửa đổi file hệ thống. Gatekeeper kiểm tra code signing trước khi chạy app. XProtect là antimalware tích hợp. App Sandbox giới hạn quyền truy cập của mỗi ứng dụng. T2/M-series chip có Secure Enclave cho encryption keys.',
  ],
  'sh-3': [
    'Bash scripting không chỉ dừng ở echo "Hello World". Trong thực tế, sysadmin viết scripts để tự động hóa hàng trăm tác vụ lặp đi lặp lại mỗi ngày.',
    'Backup Script: Tự động sao lưu database, file quan trọng theo lịch. Ví dụ: #!/bin/bash\nBACKUP_DIR="/backup/$(date +%Y%m%d)"\nmkdir -p "$BACKUP_DIR"\ntar -czf "$BACKUP_DIR/home.tar.gz" /home/\nmysqldump -u root mydb > "$BACKUP_DIR/mydb.sql"\nfind /backup -mtime +30 -delete  # Xóa backup cũ hơn 30 ngày',
    'Monitoring Script: Kiểm tra sức khỏe server, gửi alert khi có vấn đề. Theo dõi: CPU usage (>90% → alert), RAM usage (>85% → alert), disk space (<10% → critical), service status (nginx, mysql), SSL certificate expiry. Dùng cron job chạy mỗi 5 phút: */5 * * * * /opt/scripts/monitor.sh',
    'Deploy Script: Tự động hóa triển khai ứng dụng. Flow: git pull origin main → npm install → npm run build → kiểm tra build thành công → pm2 restart app → health check (curl localhost) → thông báo Slack. Nếu bất kỳ bước nào fail: rollback về version trước, gửi alert.',
    'Log Rotation & Analysis: Tự động nén log files cũ, phân tích log tìm patterns bất thường. Ví dụ: đếm số lần SSH login thất bại từ mỗi IP, tự động block IP có >10 lần fail bằng iptables. Kết hợp với logrotate để nén log hàng ngày, giữ 90 ngày.',
    'Mẹo viết script tốt: Luôn dùng set -euo pipefail (dừng khi lỗi). Dùng shellcheck để lint script. Log output ra file. Dùng trap để cleanup khi script bị interrupt. Biến sensitive (password) lấy từ env hoặc vault, KHÔNG hardcode trong script.',
  ],
  'kd-2': [
    'Debugging hệ thống Linux là kỹ năng quan trọng của mọi system administrator và developer. Ba công cụ chính là strace, ltrace và gdb.',
    'strace — System Call Tracer: Theo dõi mọi system call mà process thực hiện. Use cases: tìm hiểu tại sao ứng dụng fail ("Permission denied" ở file nào?), phát hiện file nào đang được đọc, tìm bottleneck I/O. Cú pháp: strace -p <PID> (attach vào process đang chạy), strace -c <command> (thống kê system calls), strace -e trace=open,read,write <command> (filter loại call cụ thể).',
    'ltrace — Library Call Tracer: Theo dõi dynamic library calls (printf, malloc, strlen...). Hữu ích khi cần biết application gọi thư viện nào và với tham số gì. Ví dụ: ltrace -e malloc+free ./myapp → phát hiện memory leak khi malloc nhiều hơn free.',
    'gdb — GNU Debugger: Debugger mạnh mẽ nhất cho C/C++ và nhiều ngôn ngữ khác. Cho phép: đặt breakpoint (break main), chạy từng dòng (step/next), xem giá trị biến (print x), xem memory (x/10x 0xaddr), backtrace khi crash (bt), và core dump analysis (gdb ./program core). Tip: compile với -g flag để giữ debug symbols.',
    'Bonus tools: perf — Linux profiler cho CPU performance analysis. valgrind — phát hiện memory leak và undefined behavior. ftrace — kernel function tracer. eBPF/bpftrace — modern tracing framework cho cả kernel và user space. SystemTap — scripted instrumentation.',
  ],
  'kd-3': [
    'System logs là "hộp đen" của hệ thống Linux — ghi lại mọi sự kiện từ boot đến lỗi ứng dụng. Nắm vững log system giúp bạn diagnose vấn đề nhanh gấp 10 lần.',
    'journalctl — Systemd Journal: Công cụ chính để xem logs trên hệ thống dùng systemd. Lệnh phổ biến: journalctl -u nginx (log của service cụ thể), journalctl -f (follow log real-time như tail -f), journalctl --since "2024-01-01" --until "2024-01-02" (filter theo thời gian), journalctl -p err (chỉ xem lỗi), journalctl -b -1 (log từ boot trước đó — hữu ích khi hệ thống vừa crash).',
    'Cấu trúc log truyền thống trong /var/log/: syslog hoặc messages (log tổng hợp), auth.log (đăng nhập, sudo, SSH), kern.log (kernel messages), dmesg (hardware và driver messages từ boot), nginx/access.log và error.log (web server), mysql/error.log (database). Mỗi dòng log thường có: timestamp, hostname, service name, PID, và message.',
    'dmesg — Kernel Ring Buffer: Hiển thị hardware-related messages. Dùng khi: USB device không nhận, disk có bad sectors, network interface down, driver lỗi. Ví dụ: dmesg | grep -i error, dmesg -T (hiện timestamp human-readable), dmesg -w (follow real-time).',
    'Log best practices: Centralized logging (gửi log về ELK stack hoặc Grafana Loki). Log rotation (logrotate — nén log cũ, xóa sau X ngày). Alert trên log patterns (prometheus-alertmanager). Không log sensitive data (passwords, tokens). Structured logging (JSON format) cho dễ parse.',
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
  'ql-3': '...I/O Management là subsystem quản lý giao tiếp giữa CPU và thiết bị ngoại vi: ổ cứng, keyboard, mouse, network card, GPU. Device Driver là phần mềm trung gian giữa OS và hardware — mỗi thiết bị cần driver riêng. Linux dùng device files trong /dev/: /dev/sda (ổ cứng), /dev/tty (terminal), /dev/null (black hole). I/O có 3 mode: Programmed I/O (CPU busy-wait), Interrupt-Driven I/O (CPU làm việc khác, nhận interrupt khi device sẵn sàng), DMA — Direct Memory Access (device tự chuyển data vào RAM không cần CPU). DMA là mode hiệu quả nhất, dùng cho disk và network...',
  'kt-1': '...Kernel là lõi hệ điều hành — chương trình duy nhất chạy ở chế độ đặc quyền (kernel mode) với toàn quyền truy cập CPU, RAM và thiết bị. Shell là lớp vỏ — giao diện để user giao tiếp với kernel. Bash, Zsh, Fish là các shell phổ biến. System Calls là cầu nối giữa user space và kernel space — khi ứng dụng cần đọc file, nó gọi open() → CPU chuyển từ user mode sang kernel mode → kernel thực hiện → trả kết quả về user mode. Ví dụ: printf("Hello") → gọi write() system call → kernel ghi vào stdout...',
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
    text: 'Thanks Lan! Chiều nay mình học nhóm ở thư viện nhé?',
    time: '10:38',
  },
];

// ─── Unit Summaries (AI-generated mock) ──────────────────────

export const unitSummaries: Record<string, string> = {
  'khai-niem': 'Đơn vị này giới thiệu các khái niệm nền tảng về hệ điều hành — từ lịch sử hình thành đến vai trò trung gian giữa phần cứng và phần mềm ứng dụng. Bạn sẽ hiểu tại sao OS không thể thiếu trong mọi thiết bị điện tử hiện đại.',
  'kien-truc': 'Khám phá cấu trúc bên trong của hệ điều hành: kernel, user space, system calls và device drivers. Nắm vững sự khác biệt giữa monolithic kernel và microkernel — nền tảng để hiểu Linux, Windows và macOS.',
  'quan-ly': 'Tìm hiểu cách OS quản lý ba tài nguyên quan trọng nhất: CPU (scheduling), RAM (paging/segmentation) và thiết bị I/O. Đây là trái tim của mọi hệ điều hành hiện đại.',
  'giao-dien': 'Từ dòng lệnh đơn sơ những năm 1960 đến giao diện cảm ứng và thực tế ảo ngày nay — đơn vị này theo dõi hành trình phát triển của UI/UX trong hệ điều hành và tìm hiểu Window Manager trên Linux.',
  'he-dieu-hanh': 'So sánh trực tiếp ba hệ điều hành phổ biến nhất: Windows, macOS và Linux. Phân tích ưu nhược điểm, use case phù hợp và các distro Linux nổi bật như Ubuntu, Fedora, Arch.',
  'lap-trinh-shell': 'Làm chủ Bash shell scripting từ cơ bản đến nâng cao. Viết script tự động hóa tác vụ, xử lý file hàng loạt và quản trị hệ thống như một sysadmin thực thụ.',
  'khoi-dong': 'Hiểu toàn bộ quy trình boot của Linux: từ khi nhấn nút nguồn đến khi desktop hiện ra. Học cách debug khi hệ thống gặp lỗi bằng strace, journalctl và dmesg.',
};

// ─── Additional Units (for right-click "Thêm đơn vị bài học") ─

export const additionalUnits = [
  { id: 'bao-mat', label: 'Bảo Mật Hệ Thống Linux', summary: 'Firewall, SELinux, mã hóa dữ liệu và các kỹ thuật hardening server Linux trước các mối đe dọa bảo mật phổ biến.' },
  { id: 'networking', label: 'Networking và TCP/IP', summary: 'Mô hình OSI, giao thức TCP/IP, cấu hình mạng Linux, DNS, DHCP và phân tích traffic với Wireshark.' },
  { id: 'docker', label: 'Docker và Containers', summary: 'Containerization với Docker: build image, compose multi-service apps và hiểu tại sao containers thay đổi cách deploy phần mềm.' },
  { id: 'server-admin', label: 'Quản Trị Server Linux', summary: 'Cài đặt và cấu hình các dịch vụ server: Nginx, Apache, MySQL, SSH, cron jobs và monitoring với Prometheus/Grafana.' },
  { id: 'cicd', label: 'CI/CD Pipeline với Bash', summary: 'Xây dựng pipeline tự động hóa: test, build và deploy ứng dụng bằng bash scripts kết hợp với GitHub Actions.' },
];

// ─── Context Menu Units ───────────────────────────────────────

export const nearbyUnits = [
  'Bảo Mật Hệ Thống Linux',
  'Networking và TCP/IP',
  'Docker và Containers',
  'Quản Trị Server Linux',
  'CI/CD Pipeline với Bash',
];

