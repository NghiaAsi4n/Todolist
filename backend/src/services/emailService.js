import nodemailer from "nodemailer";
import "dotenv/config";

//Hàm helper để tạo transport (tránh lặp code)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

export const sendWelcomeEmail = async (to, name) => {
  //Cấu hình Transporter đảm bảo đọc được .env
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const subject = `Chào mừng ${name} đến với Pro Task Manager! 🚀`;
  const appUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const html = `
      <div style="background-color: #f3f4f6; padding: 40px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          
          <div style="background-color: #6366f1; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">To-Do List App</h1>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px;">Xin chào ${name}, 👋</h2>
            
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Cảm ơn bạn đã tin tưởng và đăng ký tài khoản. Chúng tôi rất vui được đồng hành cùng bạn trên hành trình quản lý công việc và nâng cao hiệu suất mỗi ngày.
            </p>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Mọi thứ đã sẵn sàng! Hãy tạo nhiệm vụ đầu tiên để bắt đầu ngay bây giờ.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${appUrl}" style="background-color: #6366f1; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px;">
                Bắt đầu ngay
              </a>
            </div>

            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Chúc bạn một ngày làm việc hiệu quả!<br/>
              Thân mến,<br/>
              <strong>Đội ngũ Pro Task Manager</strong>
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Đây là email tự động, vui lòng không trả lời email này.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">
              &copy; ${new Date().getFullYear()} To-Do List App. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `;

  await transporter.sendMail({
    from: `"Pro Task Manager App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  // Chỉ log khi thành công
  console.log(`✅ Đã gửi thông báo chào mừng đến người dùng ${to}`);
};

export const sendDailyReminder = async (to, name, tasks) => {
  const transporter = createTransporter();
  const taskListHtml = tasks.map(t => `<li style="margin-bottom: 5px;">🔥 <b>${t.title}</b> (Hết hạn vào lúc: ${new Date(t.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f3f4f6;">
      <div style="background-color: #fff; padding: 20px; border-radius: 8px;">
        <h2 style="color: #ea580c;">☀️ Chào buổi sáng ${name}!</h2>
        <p>Hôm nay bạn có <b>${tasks.length} nhiệm vụ</b> cần hoàn thành:</p>
        <ul style="color: #374151;">${taskListHtml}</ul>
        <p>Hãy khởi động ngày mới thật năng lượng nhé! 💪</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block; margin-top:10px; padding:10px 20px; background:#ea580c; color:#fff; text-decoration:none; border-radius:5px;">Xem chi tiết</a>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"Pro Task Manager" <${process.env.EMAIL_USER}>`, to, subject: `📅 Kế hoạch hôm nay: ${tasks.length} việc cần làm`, html });
};

export const sendUpcomingReminder = async (to, name, task) => {
  const transporter = createTransporter();

  // --- 1. TÍNH TOÁN THỜI GIAN CÒN LẠI ---
  const now = new Date();
  const dueDate = new Date(task.dueDate);

  // Tính độ lệch (milliseconds)
  const diffMs = dueDate - now;

  // Đổi sang phút và làm tròn lên (VD: 14.2 phút -> 15 phút)
  // Math.max(0, ...) để đảm bảo không bị số âm nếu lỡ quá hạn vài giây
  const minutesLeft = Math.max(0, Math.ceil(diffMs / 60000));

  // Tạo chuỗi hiển thị (VD: "15 phút" hoặc "Dưới 1 phút")
  const timeLeftString = minutesLeft > 0 ? `${minutesLeft} phút` : "vài giây";

  // --- 2. CẬP NHẬT TIÊU ĐỀ & NỘI DUNG ---
  // Tiêu đề cũng nên sửa lại cho đúng số phút thực tế
  const subject = `[SẮP HẾT HẠN] ⏳ Task "${task.title}" còn ${timeLeftString}!`;

  const timeString = new Date(task.dueDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff7ed;">
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #f97316;">
        <h2 style="color: #ea580c; margin-top: 0;">⏳ Nhắc nhở khẩn cấp!</h2>
        <p>Chào <b>${name}</b>,</p>
        <p>Task <b style="font-size: 1.1em;">"${task.title}"</b> của bạn sẽ hết hạn vào lúc: 
           <strong style="color: #c2410c; font-size: 1.2em;">${timeString}</strong>
        </p>
        
        <p style="font-size: 16px;">
           Chỉ còn <b>${timeLeftString}</b> nữa thôi. Hãy tập trung hoàn thành ngay nhé! 🏃‍♂️💨
        </p>
        
        <div style="margin-top: 20px;">
            <a href="${process.env.CLIENT_URL}" style="display:inline-block; padding:10px 20px; background:#ea580c; color:#fff; text-decoration:none; border-radius:5px; font-weight: bold;">Đánh dấu hoàn thành ngay</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 15px; color: #9ca3af; font-size: 12px;">
        Email được gửi tự động từ hệ thống Pro Task Manager
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Pro Task Manager" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};

export const sendOverdueWarning = async (to, name, tasks) => {
  const transporter = createTransporter();
  const taskListHtml = tasks.map(t => `<li style="margin-bottom: 5px; color: #dc2626;">🚫 <b>${t.title}</b> (Hạn: ${new Date(t.dueDate).toLocaleDateString('vi-VN')})</li>`).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fef2f2;">
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #dc2626;">
        <h2 style="color: #dc2626;">⚠️ Bạn đã bỏ lỡ nhiệm vụ!</h2>
        <p>Chào ${name}, các task sau đây đã <b>quá hạn</b> nhưng chưa hoàn thành:</p>
        <ul>${taskListHtml}</ul>
        <p>Đừng nản chí! Hãy hoàn thành chúng ngay hôm nay hoặc dời lịch lại nhé.</p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block; margin-top:10px; padding:10px 20px; background:#dc2626; color:#fff; text-decoration:none; border-radius:5px;">Xử lý ngay</a>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"Pro Task Manager" <${process.env.EMAIL_USER}>`, to, subject: `⚠️ Báo động: Bạn có ${tasks.length} task quá hạn!`, html });
};


export const sendWeeklyReport = async (to, name, count) => {
  const transporter = createTransporter();
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #eff6ff;">
      <div style="background-color: #fff; padding: 20px; border-radius: 8px; text-align: center;">
        <h1 style="color: #2563eb;">🎉 TUYỆT VỜI! 🎉</h1>
        <h3>Tuần qua bạn đã hoàn thành <span style="font-size: 24px; color: #2563eb;">${count}</span> nhiệm vụ.</h3>
        <p>Bạn thực sự rất chăm chỉ và kỷ luật. Hãy tự thưởng cho mình một món quà nhỏ nhé! 🎁</p>
        <p style="color: #6b7280; font-size: 14px;">"Thành công là tập hợp của những nỗ lực nhỏ lặp lại mỗi ngày."</p>
      </div>
    </div>
  `;
  await transporter.sendMail({ from: `"Pro Task Manager" <${process.env.EMAIL_USER}>`, to, subject: `🏆 Tổng kết tuần: Bạn thật chăm chỉ!`, html });
};


export default { sendWelcomeEmail, sendDailyReminder, sendOverdueWarning, sendWeeklyReport, sendUpcomingReminder };