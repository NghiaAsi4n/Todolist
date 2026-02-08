import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export const useTask = (refreshTasks) => {
    const [isLoading, setIsLoading] = useState(false);

    const deleteTask = async (taskId) => {
        setIsLoading(true);
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success("Nhiệm vụ đã xoá.");
            if (refreshTasks) refreshTasks();
        } catch (error) {
            console.error("Lỗi xóa task:", error);
            toast.error("Không thể xoá nhiệm vụ.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateTaskContent = async (task, updates) => {
        setIsLoading(true);
        try {
            await api.put(`/tasks/${task._id}`, {
                title: updates.title || task.title,
                status: task.status,
                completedAt: task.completedAt,
                tag: updates.tag || task.tag,
                note: updates.note !== undefined ? updates.note : task.note
            });
            toast.success("Cập nhật thành công!");
            if (refreshTasks) refreshTasks();
            return true; // Trả về true để component biết mà tắt chế độ edit
        } catch (error) {
            console.error("Lỗi update task:", error);
            toast.error("Lỗi cập nhật nhiệm vụ.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Đổi trạng thái (Hoàn thành <-> Đang làm)
    const toggleTaskStatus = async (task) => {
        setIsLoading(true);
        try {
            const isComplete = task.status === "complete";
            const newStatus = isComplete ? "active" : "complete";

            await api.put(`/tasks/${task._id}`, {
                status: newStatus,
                completedAt: newStatus === "complete" ? new Date().toISOString() : null,
            });

            toast.success(newStatus === "complete" ? "Đã hoàn thành nhiệm vụ!" : "Đã mở lại nhiệm vụ.");
            if (refreshTasks) refreshTasks();
        } catch (error) {
            console.error("Lỗi toggle status:", error);
            toast.error("Lỗi cập nhật trạng thái.");
        } finally {
            setIsLoading(false);
        }
    };

    const tags = [
        { value: "general", label: "Chung", color: "bg-slate-500", dot: "#64748b" },
        { value: "work", label: "Công ty", color: "bg-orange-500", dot: "#f97316" },
        { value: "study", label: "Học tập", color: "bg-blue-500", dot: "#3b82f6" },
        { value: "personal", label: "Cá nhân", color: "bg-pink-500", dot: "#ec4899" },
    ];

    return {
        deleteTask,
        updateTaskContent,
        toggleTaskStatus,
        isLoading,
        tags
    };
};