import Task from "../models/Task.js";

const getStartDateByFilter = (filter) => {
  const now = new Date();
  switch (filter) {
    case "today": {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
    case "week": {
      const mondayDate =
        now.getDate() - (now.getDay() - 1) - (now.getDay() === 0 ? 7 : 0);
      return new Date(now.getFullYear(), now.getMonth(), mondayDate);
    }
    case "month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    case "all":
    default: {
      return null;
    }
  };
}

const getAllTasks = async (userId, filter, search) => {
  const startDate = getStartDateByFilter(filter);

  //Query để lấy task của user đó
  const query = {
    userId: userId,
    ...(startDate ? { createdAt: { $gte: startDate } } : {}),
    ...(search ? { title: { $regex: search, $options: "i" } } : {}) // Tìm kiếm theo title không phân biệt hoa thường
  };

  const result = await Task.aggregate([
    { $match: query },
    {
      $facet: {
        tasks: [{ $sort: { createdAt: -1 } }],
        activeCount: [{ $match: { status: "active" } }, { $count: "count" }],
        completeCount: [{ $match: { status: "complete" } }, { $count: "count" }],
      },
    },
  ]);

  //Xử lý khi mảng rỗng (tránh crash nếu user mới chưa có task)
  const tasks = result[0].tasks;
  const activeCount = result[0].activeCount[0]?.count || 0;
  const completeCount = result[0].completeCount[0]?.count || 0;

  return { tasks, activeCount, completeCount };
};

const createTask = async (userId, taskData) => {
  const { title, dueDate, tag } = taskData;
  const task = new Task({
    title,
    userId,
    dueDate: dueDate || null,
    tag: tag || "general"
  });

  return await task.save();
};

const updateTask = async (userId, taskId, data) => {
  const updateData = {};
  //Chỉ thêm vào updateData nếu giá trị đó CÓ tồn tại (không undefined)
  //Để tránh việc ghi đè title thành null/undefined khi chỉ update status
  if (data.title !== undefined) updateData.title = data.title;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;
  if (data.tag !== undefined) updateData.tag = data.tag;

  return await Task.findOneAndUpdate(
    { _id: taskId, userId },
    updateData,
    { new: true }
  );
};

const deleteTask = async (userId, taskId) => {
  return await Task.findOneAndDelete({ _id: taskId, userId });
};


const getAnalytics = async (userId) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

  const result = await Task.aggregate([
    { $match: { userId: userId } },
    {
      $facet: {
        // Tổng quan: Active vs Completed
        overview: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 }
            }
          }
        ],
        // Phân bổ theo Tag
        tags: [
          {
            $group: {
              _id: "$tag",
              count: { $sum: 1 }
            }
          }
        ],
        // Hiệu suất 7 ngày qua (chỉ tính task đã hoàn thành)
        daily_7days: [
          {
            $match: {
              status: "complete",
              completedAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%d/%m", date: "$completedAt" }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } } // Sắp xếp theo ngày tăng dần
        ]
      }
    }
  ]);

  return result[0];
};

export default { getAllTasks, createTask, updateTask, deleteTask, getAnalytics };