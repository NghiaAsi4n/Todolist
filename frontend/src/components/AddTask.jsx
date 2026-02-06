import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, CalendarClock, Tag } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useTask } from "@/hooks/useTask";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const AddTask = ({ handleNewTaskAdded }) => {
    const { tags } = useTask();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [dueDate, setDueDate] = useState(null);
    const [newTag, setNewTag] = useState("general");

    // Lấy thông tin tag hiện tại để hiển thị màu
    const currentTag = tags.find(t => t.value === newTag) || tags[0];

    const addTask = async () => {
        if (newTaskTitle.trim()) {
            try {
                await api.post("/tasks", {
                    title: newTaskTitle,
                    dueDate: dueDate,
                    tag: newTag
                });

                toast.success(`Đã thêm: ${newTaskTitle}`);
                handleNewTaskAdded();
                setNewTaskTitle(""); // Reset ô nhập
                setDueDate(null);
                setNewTag("general");

            } catch (error) {
                console.error("Lỗi xảy ra:", error);
                toast.error("Không thể thêm nhiệm vụ.");
            }
        }
    };

    // Xử lý khi nhấn Enter
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    };

    return (
        <Card className="p-3 sm:p-4 mb-6 shadow-sm border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            {/* LAYOUT MOBILE: Flex Column (Dọc)
                LAYOUT PC (sm trở lên): Flex Row (Ngang)
            */}
            <div className="flex flex-col sm:flex-row gap-3">

                {/* 1. Ô Input: Luôn full chiều rộng ở mobile, PC thì giãn ra (flex-1) */}
                <div className="flex-1">
                    <Input
                        placeholder="Hôm nay bạn muốn làm gì?"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        // Mobile: h-9 (nhỏ hơn chút), text-sm
                        className="h-10 sm:h-11 border-slate-200 dark:border-slate-700 focus-visible:ring-primary/20 text-sm sm:text-base"
                    />
                </div>

                {/* 2. Cụm nút chức năng: Mobile nằm dòng dưới, PC nằm cùng dòng */}
                <div className="flex items-center justify-between sm:justify-start gap-2">

                    {/* Nhóm chọn Ngày & Tag */}
                    <div className="flex gap-2">
                        {/* Date Picker */}
                        <div className="relative">
                            <DatePicker
                                selected={dueDate}
                                onChange={(date) => setDueDate(date)}
                                dateFormat="dd/MM"
                                locale={vi}
                                customInput={
                                    <Button
                                        variant="outline"
                                        size="sm" // Size nhỏ
                                        className={`h-9 sm:h-11 px-3 font-normal border-slate-200 dark:border-slate-700 ${dueDate ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground"
                                            }`}
                                    >
                                        <CalendarClock className="size-4 mr-2" />
                                        {/* Mobile: Chỉ hiện ngày ngắn gọn. PC: Hiện đầy đủ nếu cần */}
                                        <span className="text-xs sm:text-sm">
                                            {dueDate ? format(dueDate, "dd/MM") : "Hạn chót"}
                                        </span>
                                    </Button>
                                }
                            />
                        </div>

                        {/* Tag Selector */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm" // Size nhỏ
                                    className={`h-9 sm:h-11 px-3 border-slate-200 dark:border-slate-700 ${newTag !== 'general' ? 'bg-secondary/50' : ''
                                        }`}
                                >
                                    {/* Icon Tag có màu theo loại tag đang chọn */}
                                    <div
                                        className="size-3 rounded-full sm:mr-2 border border-white/20"
                                        style={{ backgroundColor: currentTag.dot }}
                                    />
                                    {/* Mobile: Ẩn chữ tên tag, chỉ hiện màu. PC: Hiện tên */}
                                    <span className="hidden sm:inline text-xs sm:text-sm ml-2 sm:ml-0">
                                        {currentTag.label}
                                    </span>
                                    {/* Mobile: Hiện icon Tag nếu cần, hoặc chỉ hiện chấm màu ở trên là đủ đẹp */}
                                    <span className="sm:hidden ml-2 text-xs text-muted-foreground">
                                        {currentTag.label}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-2" align="end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-muted-foreground px-2 py-1">Chọn loại công việc</span>
                                    {tags.map((tag) => (
                                        <div
                                            key={tag.value}
                                            className={`flex items-center gap-2 px-2 py-2 rounded-md cursor-pointer hover:bg-secondary transition-colors ${newTag === tag.value ? 'bg-secondary' : ''}`}
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

                    {/* Nút Thêm (Nằm bên phải cùng trên mobile) */}
                    <Button
                        onClick={addTask}
                        size="sm" // Size nhỏ
                        className="h-9 sm:h-11 px-4 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
                    >
                        <Plus className="size-5 sm:mr-1" />
                        <span className="hidden sm:inline">Thêm</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default AddTask;