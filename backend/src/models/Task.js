import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    // Việc đánh index cho userId là rất quan trọng để tối ưu tốc độ khi lọc task theo người dùng (GET /api/tasks).
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "complete"],
      default: "active",
    },
    completedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date
    },
    isReminded: {
      type: Boolean,
      default: false
    },
    tag: {
      type: String,
      enum: ["general", "work", "study", "personal"],
      enum: ["general", "work", "study", "personal"],
      default: "general",
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },

  {
    timestamps: true, // createdAt và updatedAt tự động thêm vào
  }
);

// Index kép: Giúp query "Lấy task của user X và sắp xếp mới nhất" chạy siêu nhanh
taskSchema.index({ userId: 1, createdAt: -1 });

const Task = mongoose.model("Task", taskSchema);

export default Task;