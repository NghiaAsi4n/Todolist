import cron from "node-cron";
import Task from "../models/Task.js";
import User from "../models/User.js";
import emailService from "./emailService.js";

const startCronJobs = () => {
  //NHẮC VIỆC HÔM NAY (07:00 sáng)
    cron.schedule("0 7 * * *", async () => {
    console.log("--- 🌅 Bắt đầu quét Task hôm nay ---");
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const tasks = await Task.find({
        dueDate: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: "complete" }
      }).populate("userId");

      const userTasksMap = {};
      tasks.forEach(task => {
        if (!task.userId) return;
        const uid = task.userId._id.toString();
        if (!userTasksMap[uid]) {
          userTasksMap[uid] = { user: task.userId, tasks: [] };
        }
        userTasksMap[uid].tasks.push(task);
      });

      for (const uid in userTasksMap) {
        const { user, tasks } = userTasksMap[uid];
        emailService.sendDailyReminder(user.email, user.name, tasks).catch(console.error);
        console.log(`📧 Đã gửi Daily Reminder cho ${user.email}`);
      }
    } catch (error) {
        console.error("Lỗi Cron Daily:", error);
    }
  });


  //QUÉT TASK SẮP HẾT HẠN (Mỗi phút)
 cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Quét rộng 30 phút để không bỏ sót, vì đã có cờ isReminded chặn trùng
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000); 

      //Tìm danh sách ứng viên (Chưa khóa)
      const candidates = await Task.find({
        dueDate: { $gte: now, $lte: thirtyMinutesLater },
        status: { $ne: "complete" },
        isReminded: false 
      });

      if (candidates.length > 0) {
        // console.log(`🔎 Tìm thấy ${candidates.length} ứng viên tiềm năng...`);

        for (const task of candidates) {
          //THỰC HIỆN KHÓA & LẤY DỮ LIỆU (Atomic Operation)
          //Câu lệnh này vừa update vừa trả về data mới.
          //Nếu server khác đã update trước, lệnh này sẽ trả về null -> Không gửi mail.
          const taskToProcess = await Task.findOneAndUpdate(
            { _id: task._id, isReminded: false }, //Điều kiện: Phải chưa được nhắc
            { isReminded: true },                 //Action: Đánh dấu đã nhắc NGAY LẬP TỨC
            { new: true }                         //Option: Trả về dữ liệu sau khi update
          ).populate("userId", "email name");

          //Chỉ gửi mail nếu chiếm được quyền (taskToProcess tồn tại)
          if (taskToProcess && taskToProcess.userId) {
             try {
                //[LOG MỚI] Để bạn biết là code mới đang chạy
                console.log(`🔒 Đã khóa task "${taskToProcess.title}" -> Đang gửi mail...`);
                
                await emailService.sendUpcomingReminder(
                    taskToProcess.userId.email, 
                    taskToProcess.userId.name, 
                    taskToProcess
                );

                console.log(`✅ Gửi thành công cho: ${taskToProcess.userId.email}`);
            } catch (err) {
                console.error(`❌ Gửi lỗi, hoàn tác flag cho: ${taskToProcess.title}`);
                //Nếu gửi lỗi thì mở khóa để lần sau quét lại
                await Task.findByIdAndUpdate(taskToProcess._id, { isReminded: false });
            }
          }
        }
      }
    } catch (error) {
      console.error("❌ Lỗi Cron Real-time:", error);
    }
  });


  //CẢNH BÁO QUÁ HẠN (09:00 sáng)
  cron.schedule("0 9 * * *", async () => {
    console.log("--- ⚠️ Bắt đầu quét Task quá hạn ---");
    try {
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      
      const yesterdayEnd = new Date();
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);

      const tasks = await Task.find({
        dueDate: { $gte: yesterdayStart, $lte: yesterdayEnd },
        status: { $ne: "complete" }
      }).populate("userId");

      const userTasksMap = {};
      tasks.forEach(task => {
        if (!task.userId) return;
        const uid = task.userId._id.toString();
        if (!userTasksMap[uid]) userTasksMap[uid] = { user: task.userId, tasks: [] };
        userTasksMap[uid].tasks.push(task);
      });

      for (const uid in userTasksMap) {
        const { user, tasks } = userTasksMap[uid];
        emailService.sendOverdueWarning(user.email, user.name, tasks).catch(console.error);
      }
    } catch (error) {
      console.error("Lỗi Cron Overdue:", error);
    }
  });


  //TỔNG KẾT TUẦN (21:00 tối Chủ Nhật)
  cron.schedule("0 21 * * 0", async () => {
    console.log("--- 📊 Bắt đầu tổng kết tuần ---");
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const report = await Task.aggregate([
        {
          $match: {
            status: "complete",
            completedAt: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: "$userId",
            count: { $sum: 1 }
          }
        }
      ]);

      for (const item of report) {
        const user = await User.findById(item._id);
        if (user && item.count > 0) {
          emailService.sendWeeklyReport(user.email, user.name, item.count).catch(console.error);
        }
      }
    } catch (error) {
      console.error("Lỗi Cron Weekly:", error);
    }
  });
};

export default { startCronJobs };