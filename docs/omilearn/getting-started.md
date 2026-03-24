# Cài đặt & Chạy — OmiLearn

> Hướng dẫn cài đặt môi trường, chạy development và production cho OmiLearn.

---

## 1. Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu | Ghi chú |
|---------|-------------------|---------|
| **Node.js** | 18.x trở lên | Khuyến nghị 20.x LTS |
| **npm** | 9.x trở lên | Đi kèm Node.js |
| **Git** | 2.x | Để clone repo |
| **OS** | Linux / macOS / Windows WSL2 | Windows native chưa được kiểm thử đầy đủ |

> [!IMPORTANT]
> Next.js 16 yêu cầu **Node.js 18.18.0 trở lên**. Kiểm tra version bằng `node -v`.

## 2. Cài đặt

### 2.1 Clone dự án

```bash
git clone <repo-url>
cd omilearn
```

### 2.2 Cài đặt dependencies

```bash
cd app
npm install
```

> [!NOTE]
> Dự án không có file `.env` riêng — tất cả dữ liệu hiện tại là mock data nội bộ, không cần API key bên ngoài.

### 2.3 Kiểm tra cài đặt

```bash
# Kiểm tra Node.js
node -v
# → v20.x.x (hoặc 18.x.x)

# Kiểm tra npm
npm -v
# → 9.x.x hoặc 10.x.x

# Kiểm tra dependencies đã cài
ls node_modules | head -5
# → @xyflow  framer-motion  lucide-react  next  ...
```

## 3. Chạy dự án

### 3.1 Development mode

```bash
cd app
npm run dev
```

Server sẽ khởi động tại:
- **Local:** `http://localhost:3000`
- Hot reload được bật sẵn (Next.js Turbopack)

### 3.2 Production mode

```bash
cd app

# Build
npm run build

# Start production server
npm run start
# → mặc định port 3000

# Hoặc chỉ định port khác
PORT=3005 npm run start
# → http://localhost:3005
```

### 3.3 Lint

```bash
cd app
npm run lint
```

## 4. Xác nhận cài đặt

Sau khi server chạy, kiểm tra từng route:

```bash
# Trang chủ — danh sách dự án
curl -I http://localhost:3000/
# → HTTP/1.1 200 OK

# Infinite Canvas
curl -I http://localhost:3000/learn
# → HTTP/1.1 200 OK

# Dashboard
curl -I http://localhost:3000/dashboard
# → HTTP/1.1 200 OK

# Roadmap
curl -I http://localhost:3000/roadmap
# → HTTP/1.1 200 OK

# Lịch học
curl -I http://localhost:3000/schedule
# → HTTP/1.1 200 OK

# Landing page
curl -I http://localhost:3000/landing
# → HTTP/1.1 200 OK
```

### 4.1 Bảng routes

| Route | Mô tả | Widget chính |
|-------|-------|-------------|
| `/` | Danh sách dự án | — |
| `/learn` | Infinite Canvas workspace | `infinite-canvas` |
| `/dashboard` | Danh sách dashboard | — |
| `/dashboard/[projectId]` | Dashboard chi tiết | `project-dashboard` |
| `/roadmap` | Lộ trình học tập | `roadmap-graph` |
| `/schedule` | Lịch học hàng tuần | — |
| `/workspace` | File manager + AI chat | `chat-box` |
| `/landing` | Trang giới thiệu | `landing-page` |

## 5. Các vấn đề thường gặp

### 5.1 Port 3000 đã bị chiếm

```bash
# Dùng port khác
PORT=3001 npm run dev

# Hoặc tìm và kill process đang dùng port 3000
lsof -ti:3000 | xargs kill -9
```

### 5.2 Lỗi `node_modules` không tìm thấy

```bash
cd app
rm -rf node_modules package-lock.json
npm install
```

### 5.3 Lỗi TypeScript khi build

```bash
# Kiểm tra lỗi TypeScript
cd app
npx tsc --noEmit

# Nếu lỗi trong generated files
rm -rf .next
npm run build
```

### 5.4 Lỗi Tailwind CSS không apply

```bash
# Đảm bảo đang dùng Tailwind v4 (không phải v3)
cat package.json | grep tailwindcss
# → "tailwindcss": "^4"

# Xóa cache Next.js
rm -rf .next
npm run dev
```

> [!WARNING]
> Dự án dùng **Tailwind CSS v4** với cú pháp mới — không tương thích ngược với config Tailwind v3. Không được downgrade.
