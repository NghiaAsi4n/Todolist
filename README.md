# 🚀 Pro Task Manager
> Một hệ thống quản lý hiệu suất công việc toàn diện tích hợp phương pháp Pomodoro và Dashboard thống kê trực quan. Tối ưu hóa trải nghiệm tìm kiếm thời gian thực, tự động gửi email thông báo tự động.

## 🔗 Demo
* **Live App:** [https://todo-app-frontend-bice-five.vercel.app](https://todo-app-frontend-bice-five.vercel.app)
* **Backend API:** [https://to-do-list-afyb.onrender.com/ping](https://to-do-list-afyb.onrender.com/ping)

---

## ✨ Tính năng nổi bật

### 🎯 Quản lý công việc thông minh
* **CRUD Task:** Thêm, sửa, xóa công việc nhanh chóng.
* **Tagging System:** Phân loại công việc theo màu sắc (Work, Study, Personal).
* **Smart Filter & Search:**
    * Lọc theo thời gian (Hôm nay, Tuần, Tháng).
    * Tìm kiếm theo từ khóa với công nghệ **Debounce** (giảm tải server).

### 🍅 Nâng cao năng suất
* **Pomodoro Widget:** Đồng hồ đếm ngược tích hợp sẵn (Focus / Short Break / Long Break) với âm thanh thông báo.
* **Analytics Dashboard:** Biểu đồ trực quan (Bar/Pie Chart) thống kê hiệu suất làm việc, tự động thích ứng với giao diện Sáng/Tối.

### 🤖 Hệ thống tự động hóa
* **One-Tap Login:** Đăng nhập nhanh bằng **Google OAuth 2.0**.
* **Daily Reminder:** Tự động gửi email nhắc việc vào **07:00 sáng** mỗi ngày.
* **Real-time Warning:** Quét mỗi phút và gửi cảnh báo qua email nếu có task sắp hết hạn trong 30 phút.
* **Weekly Report:** Tự động gửi báo cáo tổng kết hiệu suất vào tối Chủ Nhật.

### 🎨 Trải nghiệm người dùng (UX/UI)
* **Dark Mode / Light Mode:** Chuyển đổi giao diện mượt mà, lưu cài đặt vào LocalStorage.
* **Responsive Design:** Tương thích hoàn hảo trên Mobile và Desktop.
* **Modern UI:** Sử dụng bộ thư viện **Shadcn UI** (Radix based) cho các component cao cấp.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Shadcn UI, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, MongoDB (Mongoose), JSON Web Token (JWT) |
| **Services** | Node-cron (Job Scheduling), Nodemailer (SMTP Email), Google OAuth 2.0 |
| **DevOps** | Vercel (Frontend), Render (Backend), UptimeRobot (Keep-alive) |

---

### 🚀 High-Performance Data Aggregation
Thay vì thực hiện nhiều truy vấn rời rạc, dự án sử dụng **MongoDB Aggregation Pipeline** với stage **`$facet`** để xử lý song song 3 luồng dữ liệu phức tạp (Thống kê tổng quan, Phân bổ theo Tag, Biểu đồ xu hướng 7 ngày).
> **Kết quả:** Giảm 66% số lần Round-trip tới Database, tối ưu hóa thời gian phản hồi API.

### 🛡️ Secure Cross-Domain Authentication
Giải quyết bài toán bảo mật khi tách rời Frontend (Vercel) và Backend (Render) bằng kiến trúc **Reverse Proxy** (Vercel Rewrites).
* **Chống XSS:** Token được lưu trong **HttpOnly Cookie** (JavaScript không thể truy cập).
* **Chống CSRF:** Cấu hình **SameSite Policy** (`Strict`/`Lax`) linh hoạt theo môi trường Dev/Prod.

### ⚡ Concurrency & Data Integrity
Xử lý vấn đề tranh chấp dữ liệu (Race Condition) trong các tác vụ nền (Cron Jobs) bằng kỹ thuật **Atomic Operations** (`findOneAndUpdate`). Đảm bảo tính nhất quán của dữ liệu và ngăn chặn việc gửi trùng lặp email thông báo ngay cả khi mở rộng Server (Scaling).
