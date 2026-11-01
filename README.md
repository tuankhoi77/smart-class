# SmartEdu - Web App Quản Lý Lớp Học Thông Minh

Nền tảng quản lý lớp học và giáo dục thông minh đa vai trò (Admin, Giáo viên, Học sinh, Phụ huynh) với đầy đủ nghiệp vụ: Quản lý lớp, Hồ sơ học sinh 360°, Điểm danh tốc độ cao (mobile-first), Bài tập & Chấm điểm, Đề kiểm tra & Quiz trực tuyến, Ngân hàng câu hỏi, Kho học liệu số, AI Trợ giảng sư phạm (Gemini API), Sổ điểm & GPA, Thi đua & Rèn luyện, Cảnh báo học tập thông minh, Bộ công cụ lớp học (Vòng quay, Gọi ngẫu nhiên, Chia nhóm, Đếm ngược, Quick Quiz) và Quản trị hệ thống Multi-school / Multi-tenant.

---

## 1. Tài khoản Test Demo (4 Vai trò)

Trên thanh tiêu đề (Navbar) hoặc màn hình Đăng nhập (`/login`), bạn có thể chuyển đổi tức thì giữa 4 vai trò chỉ bằng một cú nhấp chuột:

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Giáo viên (Teacher)** | `gv.nguyenvana@smartclass.edu.vn` | `123456` | Thầy Nguyễn Văn An - Chủ nhiệm 10A1, dạy Toán |
| **Quản trị viên (Admin)** | `admin@smartclass.edu.vn` | `123456` | Admin Vũ Hoàng Minh - Quản trị toàn hệ thống |
| **Học sinh (Student)** | `hs.lehoangan@smartclass.edu.vn` | `123456` | Em Lê Hoàng An - Học sinh lớp 10A1 |
| **Phụ huynh (Parent)** | `ph.letienthanh@smartclass.edu.vn` | `123456` | Anh Lê Tiến Thành - Phụ huynh em Hoàng An |

---

## 2. Cấu trúc Thư mục Dự án

```text
/
├── server.ts                    # Backend Express + Vite middleware & API AI Gemini
├── index.html                   # Entry point HTML với SEO & OpenGraph
├── metadata.json                # AI Studio Metadata cấu hình quyền & Server API
├── package.json                 # Cấu hình dependencies & scripts
├── src/
│   ├── types/
│   │   └── index.ts             # Toàn bộ Interface TypeScript (RBAC, Entity Model)
│   ├── data/
│   │   └── initialData.ts       # Dữ liệu hạt giống chuẩn trường học Việt Nam
│   ├── services/
│   │   └── storage.ts           # Service lưu trữ reactive, CRUD, Audit Log & CSV
│   ├── contexts/
│   │   ├── AuthContext.tsx      # Quản lý phiên, 4 vai trò, chuyển đổi & RBAC
│   │   └── ClassContext.tsx     # Giữ context lớp học (classId) xuyên suốt các tabs
│   ├── layouts/
│   │   └── AppLayout.tsx        # Layout chuẩn SaaS gồm Navbar, Sidebar & Breadcrumbs
│   ├── components/
│   │   └── common/
│   │       ├── Navbar.tsx       # Thanh điều hướng, tìm kiếm toàn cục, tạo nhanh
│   │       ├── Sidebar.tsx      # Sidebar phân quyền động theo từng vai trò
│   │       ├── Breadcrumbs.tsx  # Thanh điều hướng đường dẫn
│   │       ├── RoleGuard.tsx    # Bảo vệ route và chặn truy cập trái phép (403)
│   │       └── GlobalSearchModal.tsx # Hộp thoại tìm kiếm tức thì toàn hệ thống
│   ├── pages/
│   │   ├── auth/                # Đăng nhập, Đăng ký, Quên mật khẩu
│   │   ├── errors/              # Trang 403 Forbidden & 404 Not Found
│   │   ├── teacher/             # Phân hệ Giáo viên (15 phân hệ chuyên sâu)
│   │   ├── student/             # Phân hệ Học sinh (Dashboard, Bài tập, Quiz, Điểm)
│   │   ├── parent/              # Phân hệ Phụ huynh (Chuyên cần con, Điểm, Chat GV)
│   │   └── admin/               # Phân hệ Quản trị (Trường, User, Audit log, Backup)
│   ├── App.tsx                  # Thiết lập Router và phân quyền
│   ├── index.css                # Tailwind CSS v4 và Typography
│   └── main.tsx                 # React DOM Root
```

---

## 3. Kiến trúc Cơ sở Dữ liệu & Schema Quan hệ

Hệ thống được thiết kế theo mô hình quan hệ chuẩn giáo dục (Relational Schema):
- **User** `(id, name, email, role, phone, status, schoolId, createdAt)`
- **School** `(id, name, code, address, phone, email, principalName)`
- **AcademicYear** `(id, name, isCurrent, startDate, endDate)`
- **GradeLevel** `(id, name, level)` & **Subject** `(id, name, code, color)`
- **ClassRoom** `(id, name, gradeLevelId, academicYear, teacherId, room, joinCode, studentCount, status)`
- **Student** `(id, code, fullName, gender, birthDate, classId, group, orderNumber, gpa, attendanceRate, rewardPoints)`
- **AttendanceRecord** `(id, classId, date, period, studentId, status, reason, updatedBy, updatedAt)`
- **ScheduleItem** `(id, classId, dayOfWeek, period, subject, room, teacherName)`
- **Assignment** `(id, classId, title, description, assignedDate, dueDate, maxScore, status)`
- **Submission** `(id, assignmentId, studentId, submittedAt, content, score, feedback, status)`
- **Quiz** & **QuizQuestion** `(id, classId, title, durationMinutes, shuffleQuestions, questions[])`
- **GradeItem** `(id, classId, studentId, subject, term, type, score, weight)`
- **BehaviorRecord** & **RewardBadge** `(id, studentId, type, points, title, badgeName)`
- **SmartAlert** `(id, studentId, classId, type, severity, status, resolvedNote)`
- **AuditLog** `(id, userId, userName, userRole, action, module, details, timestamp, ip)`

*Ghi chú về dữ liệu:* Hệ thống đã tích hợp tầng lưu trữ Reactive Storage với Local Storage persistence cho phiên bản Client SPA, kết hợp cùng Server Express API hỗ trợ đầy đủ kết nối sang PostgreSQL / Supabase khi chuyển sang môi trường Production.

---

## 4. Hướng dẫn Cài đặt & Chạy Thực tế

### Bước 1: Cài đặt thư viện
```bash
npm install
```

### Bước 2: Khởi chạy môi trường phát triển (Dev Server)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại cổng `http://localhost:3000`.

### Bước 3: Kiểm tra chất lượng mã nguồn & Build
```bash
# Kiểm tra Type & Linter
npm run lint

# Build bản phát hành Production
npm run build
```

---

## 5. Hướng dẫn Triển khai (Deploy)

### Triển khai lên Vercel:
1. Đẩy mã nguồn lên kho chứa GitHub.
2. Đăng nhập Vercel và chọn **Import Project**.
3. Framework Preset: **Vite**.
4. Cấu hình biến môi trường `GEMINI_API_KEY` (tùy chọn để kích hoạt thêm trí tuệ nhân tạo).
5. Nhấn **Deploy**.

### Triển khai lên Netlify:
1. Build command: `npm run build`.
2. Publish directory: `dist`.
3. Thêm file `_redirects` với nội dung `/* /index.html 200` để hỗ trợ SPA Routing.

---

## 6. Tóm tắt Kiểm thử Nghiệp vụ Đã Hoàn thành

- ✅ **Authentication & RBAC:** Đăng nhập, đăng xuất, chuyển vai trò, route guard chặn URL trái quyền và trả về trang 403 Forbidden.
- ✅ **Lớp học & Context:** Giữ nguyên `classId` khi chuyển đổi giữa các module; hỗ trợ tạo, lưu trữ, sao chép sang năm học mới và mã QR.
- ✅ **Học sinh & Hồ sơ 360°:** Đầy đủ thông tin, KPI (GPA, chuyên cần, bài tập, điểm rèn luyện), biểu đồ tiến độ.
- ✅ **Quy trình Import 8 bước chuẩn:** Tải file mẫu CSV -> Upload -> Ánh xạ cột -> Xem trước -> Kiểm tra lỗi dòng/cột -> Xác nhận của giáo viên -> Lưu vào cơ sở dữ liệu.
- ✅ **Điểm danh di động tốc độ cao:** Đánh dấu tất cả có mặt, chuyển trạng thái ngoại lệ (Có phép, Không phép, Trễ, Về sớm), mô phỏng QR scanner, nút lưu dính chân màn hình và ghi nhật ký Audit Log.
- ✅ **Bài tập & Chấm điểm:** Giao bài, nộp bài trực tuyến, giao diện chấm điểm chia đôi màn hình, nhận xét và nhắc nhở học sinh nợ bài.
- ✅ **Đề kiểm tra & Quiz:** Đảo câu hỏi/đáp án, giới hạn thời gian, tự động chấm điểm tức thì.
- ✅ **AI Trợ giảng (Gemini API):** Tạo đề kiểm tra, soạn giáo án, viết nhận xét học sinh và phân tích kết quả học tập; luôn cho phép giáo viên chỉnh sửa trước khi lưu.
- ✅ **Công cụ tương tác lớp học:** Vòng quay may mắn, gọi tên ngẫu nhiên (chống trùng lặp), chia nhóm, đồng hồ đếm ngược chuông báo và chế độ máy chiếu Fullscreen.
- ✅ **Báo cáo & Xuất file:** Xuất Excel/CSV chính xác theo bộ lọc hiện tại, hỗ trợ in ấn.
