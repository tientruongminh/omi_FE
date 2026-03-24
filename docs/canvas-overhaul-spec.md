# Feature Spec: Canvas Workspace Overhaul

## Tổng hợp yêu cầu từ Tiền (2026-03-24)

### 1. Context Menu (chuột phải vào vùng trống)
**Bỏ:** "Thêm chủ đề mới"
**Giữ:**
- Thêm đơn vị bài học → hover hiện submenu list chủ đề từ Roadmap (cùng cấp node lớn nhất)
  - Khi chọn → load toàn bộ workflow của chủ đề đó vào canvas hiện tại (2 workflow chung 1 workspace)
- Thêm ghi chú → tạo note node
- Tạo node tổng hợp

### 2. Node Ghi Chú (note)
- Click vào → mở editor cho user ghi note/insight
- Có nút **"AI hoàn thiện ý tưởng"** → AI polish nội dung note cho trơn tru hơn
- Có thể **nối (edge) tới node khác** → AI dựa trên nội dung node được nối mà trả lời
- Editable content

### 3. Node Tổng Hợp (synthesis)
- Có thể **nối nhiều node khác lại**
- Dựa trên yêu cầu tổng hợp của user + nội dung tất cả node được nối (bao gồm: thảo luận chatbot, nội dung video, text...)
- Tổng hợp theo ý muốn user

### 4. Đổi Màu Node
- Bấm "Đổi màu" → hiện **color picker palette** thật
- Chọn màu → đổi màu node thật (không chỉ log)

### 5. Thêm Tài Liệu (add-document)
- Khi bấm "Thêm tài liệu" vào chapter → hiện 2 loại node:
  - **Text** (document)
  - **Video** (YouTube)
- Đây phải hoạt động thật (hiện tại đang bị lỗi?)

### 6. Node Zoom/Expand Behavior
- Click node → **phóng to** (zoom/expand) - giữ nguyên
- Chuột phải node đã phóng to → vẫn hiện context menu (AI hỏi đáp / AI ôn tập)
- Khi tạo AI node mới từ node đã phóng to:
  - Node mới zoom lên **cùng cấp** với node đang zoom
  - Node cũ tự **dịch sang trái** nhường chỗ cho node mới (SplitView)
  - Khi node mới đang phóng to tạo thêm node → node mới đó ẩn về node nhỏ, node mới nhất thế chỗ

### 7. Roadmap Integration
- "Thêm đơn vị bài học" → hover submenu hiện danh sách từ Roadmap
- Chọn → load workflow vào canvas chung
