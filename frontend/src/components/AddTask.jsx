import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, CalendarClock, Tag } from "lucide-react"; // Combined imports
import { toast } from "sonner";
import api from "@/lib/axios";
import { useTask } from "@/hooks/useTask";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

//gọi handleNewTaskAdded để cập nhật UI
const AddTask = ({ handleNewTaskAdded }) => {
    const { tags } = useTask();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [dueDate, setDueDate] = useState(null);
    const [newTag, setNewTag] = useState("general");

    const addTask = async () => {
        if (newTaskTitle.trim()) {
            try {
                {/* api là axios instance ở axios.js. Ở dev baseURL = http://localhost:5001/api
                    --> gửi POST tới: http://localhost:5001/api/tasks
                */}
                await api.post("/tasks", {
                    title: newTaskTitle,
                    dueDate: dueDate,
                    tag: newTag
                });

                toast.success(`Nhiệm vụ ${newTaskTitle} đã được thêm vào.`);
                handleNewTaskAdded();
                setDueDate(null);
                setNewTag("general");

            } catch (error) {
                console.error("Lỗi xảy ra khi thêm task.", error);
                toast.error("Lỗi xảy ra khi thêm nhiệm vụ mới.");
            }
            //Dù thành công hay thất bại cũng sẽ reset input về rỗng
            setNewTaskTitle("");
        } else {
            toast.error("Bạn cần nhập nội dung của nhiệm vụ.");
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    }

    return (
        <Card className="p-6 border-0 bg-gradient-card shadow-custome-lg">
            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    type="text"
                    placeholder="Cần phải làm gì?"
                    className="flex-1 h-12 text-base bg-slate-50 dark:bg-slate-900/50 dark:text-white sm:flex-1 border-border/50 focus:border-primary/50 focus:ring-primary/20 placeholder:text-gray-400"
                    //Kết nối nội dung ô nhập với state
                    value={newTaskTitle}
                    //onChange: Cập nhật state theo đúng nội dung input mỗi lần gõ chữ
                    //value: Kiểm soát nội dung hiển thị trong ô
                    //Ví dụ khi nhấn enter để tạo nv thì ô về lại rỗng
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    //eventHandler, sẽ chạy mỗi khi user gõ phím trong ô input
                    onKeyPress={handleKeyPress}
                />

                {/* Chọn ngày giờ */}
                <div className="relative w-[180px]">
                    <DatePicker
                        selected={dueDate}
                        onChange={(date) => setDueDate(date)}
                        showTimeSelect // Cho phép chọn giờ
                        timeFormat="HH:mm"
                        timeIntervals={15} // Khoảng cách mỗi lần chọn giờ (15p)
                        dateFormat="dd/MM/yyyy h:mm aa" // Định dạng hiển thị (VD: 04/02/2026 8:00 PM)
                        placeholderText="Chọn deadline..."

                        className="w-full h-12 px-3 pl-10 bg-secondary/50 rounded-md border-0 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer placeholder:text-muted-foreground"
                        autoComplete="off"
                        onKeyDown={(e) => e.preventDefault()}
                    />

                    {/* Icon đồng hồ */}
                    <div className="absolute top-1/2 left-3 -translate-y-1/2 pointer-events-none">
                        <CalendarClock className="text-muted-foreground w-4 h-4" />
                    </div>
                </div>

                <Button
                    variant="gradient"
                    size="xl"
                    className="px-2"
                    onClick={addTask}
                    disabled={!newTaskTitle.trim()}
                >
                    <Plus className="size-5" />
                    Thêm
                </Button>

                {/* tag */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="h-12 w-12 p-0 rounded-full border-dashed border-2">
                            {/* Hiển thị màu hiện tại hoặc icon Tag */}
                            {newTag === 'general' ? (
                                <Tag className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <div
                                    className="h-5 w-5 rounded-full"
                                    style={{ backgroundColor: tags.find(t => t.value === newTag)?.dot }}
                                />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2" align="end">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-muted-foreground px-2">Loại công việc</span>
                            {tags.map((tag) => (
                                <div
                                    key={tag.value}
                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary transition-colors ${newTag === tag.value ? 'bg-secondary' : ''}`}
                                    onClick={() => setNewTag(tag.value)}
                                >
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ backgroundColor: tag.dot }}
                                    />
                                    <span className="text-sm">{tag.label}</span>
                                    {newTag === tag.value && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </PopoverContent>
                </Popover>

            </div>
        </Card>
    )
}

export default AddTask;