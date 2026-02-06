import React from "react";
import { Card } from "./ui/card";
import { Circle } from "lucide-react";

const TaskEmptyState = ({ filter }) => {
  return (
    <Card className="p-8 text-center border-0 bg-gradient-card shadow-custom-md dark:bg-slate-900/50 dark:border-slate-800">
      <div className="space-y-3">
        <Circle className="mx-auto size-12 text-muted-foreground dark:text-primary/80" />
        <div>
          <h3 className="font-medium text-foreground dark:text-slate-200">
            {filter === "active"
              ? "Không có nhiệm vụ nào đang làm."
              : filter === "completed"
                ? "Chưa có nhiệm vụ nào hoàn thành."
                : "Chưa có nhiệm vụ."}
          </h3>

          <p className="text-sm text-muted-foreground dark:text-slate-400">
            {filter === "all"
              ? "Thêm nhiệm vụ đầu tiên vào để bắt đầu!"
              : `Chuyển sang "tất cả" để thấy những nhiệm vụ ${filter === "active" ? "đã hoàn thành." : "đang làm."
              }`}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TaskEmptyState;