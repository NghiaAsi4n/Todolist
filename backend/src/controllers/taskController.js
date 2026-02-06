import taskService from "../services/taskService.js";

export const getAllTasks = async (req, res) => {
  try {
    const { filter = "today", search } = req.query;
    const userId = req.user?._id;

    const data = await taskService.getAllTasks(userId, filter, search);

    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi gọi getAllTasks", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const createTask = async (req, res) => {
  try {
    //Nhận cả title và dueDate từ body
    const { title, dueDate, tag } = req.body;
    const userId = req.user?._id;

    // Truyền cả object chứa title và dueDate sang service
    const newTask = await taskService.createTask(userId,
      {
        title,
        dueDate,
        tag: tag || "general"
      });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Lỗi khi gọi createTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateTask = async (req, res) => {
  try {
    //Lấy thêm dueDate từ req.body
    const { title, status, completedAt, dueDate, tag } = req.body;
    const taskId = req.params.id;
    const userId = req.user?._id;

    //Gom các dữ liệu cần update vào một object
    const updateData = { title, status, completedAt, dueDate, tag };

    if (dueDate) {
      updateData.isReminded = false;
    }

    //Truyền object updateData vào service
    const updatedTask = await taskService.updateTask(userId, taskId, updateData);

    if (!updatedTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại hoặc bạn không có quyền sửa" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Lỗi khi gọi updateTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user?._id;

    const deletedTask = await taskService.deleteTask(userId, taskId);

    if (!deletedTask) {
      return res.status(404).json({ message: "Nhiệm vụ không tồn tại hoặc bạn không có quyền xóa" });
    }

    res.status(200).json(deletedTask);
  } catch (error) {
    console.error("Lỗi khi gọi deleteTask", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const getTaskAnalytics = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const data = await taskService.getAnalytics(userId);
    res.status(200).json(data);
  } catch (error) {
    console.error("Lỗi khi gọi getTaskAnalytics", error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};