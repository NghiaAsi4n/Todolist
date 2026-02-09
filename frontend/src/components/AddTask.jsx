import React, { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Calendar, Tag, StickyNote } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";
import { useTask } from "@/hooks/useTask";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Textarea } from "./ui/textarea";
import { useAuth } from "@/hooks/useAuth";

const AddTask = ({ handleNewTaskAdded }) => {
    const { tags } = useTask();
    const { user } = useAuth();
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [note, setNote] = useState("");
    const [dueDate, setDueDate] = useState(null);
    const [newTag, setNewTag] = useState("general");

    // Lấy thông tin tag hiện tại để hiển thị màu
    const currentTag = tags.find(t => t.value === newTag) || tags[0];

    const addTask = async () => {
        if (!user) {
            toast.error("Vui lòng đăng nhập để thêm nhiệm vụ!", {
                duration: 3000,
                position: 'top-center'
            });
            return;
        }

        if (newTaskTitle.trim()) {
            try {
                await api.post("/tasks", {
                    title: newTaskTitle,
                    dueDate: dueDate,
                    tag: newTag,
                    note: note
                });

                toast.success(`Đã thêm: ${newTaskTitle}`);
                handleNewTaskAdded();
                setNewTaskTitle(""); // Reset ô nhập
                setNote("");
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
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
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
                        placeholder="Nhập công việc cần làm..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        // Mobile: h-9 (nhỏ hơn chút), text-sm
                        className="h-10 sm:h-11 border-slate-200 dark:border-slate-700 focus-visible:ring-primary/20 text-sm sm:text-base"
                    />
                </div>

                {/* 2. Cụm nút chức năng: Mobile nằm dòng dưới, PC nằm cùng dòng */}
                <div className="flex items-center justify-between sm:justify-start gap-2">

                    {/* Date Picker (Moved back to start) */}
                    <div className="relative">
                        <DatePicker
                            selected={dueDate}
                            onChange={(date) => setDueDate(date)}
                            dateFormat="dd/MM"
                            locale={vi}
                            popperPlacement="bottom-start"
                            popperModifiers={[
                                {
                                    name: "offset",
                                    options: {
                                        offset: [10, 10],
                                    },
                                },
                                {
                                    name: "preventOverflow",
                                    options: {
                                        rootBoundary: "viewport",
                                        tether: false,
                                        altAxis: true,
                                    },
                                },
                            ]}
                            customInput={
                                <Button
                                    variant="outline"
                                    className={`h-9 sm:h-11 px-2.5 font-normal border-slate-200 dark:border-slate-700 transition-colors ${dueDate ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground hover:text-primary"}`}
                                >
                                    <Calendar className="size-4 mr-0.1" />
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
                                size="sm"
                                className={`h-9 sm:h-11 px-3 font-normal border-slate-200 dark:border-slate-700 transition-colors ${newTag !== 'general' ? 'bg-secondary/50' : 'text-muted-foreground hover:text-primary'}`}
                            >
                                {/* Icon Tag có màu theo loại tag đang chọn */}
                                <div
                                    className="size-3 rounded-full sm:mr-0.1 border border-white/20"
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

                    {/* Note Input (Popover) */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className={`h-9 sm:h-11 px-3 font-normal border-slate-200 dark:border-slate-700 transition-colors ${note ? "text-primary border-primary/30 bg-primary/5" : "text-muted-foreground hover:text-primary"}`}
                                title="Thêm ghi chú"
                            >
                                <StickyNote className="size-4 sm:mr-0.1" />
                                <span className="hidden sm:inline text-xs sm:text-sm">Ghi chú</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 p-3" align="end">
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">Ghi chú</span>
                                <Textarea
                                    placeholder="Nhập ghi chú..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}

                                    className="min-h-[80px] text-sm resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                                    autoFocus
                                />
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Nút Thêm */}
                    <Button
                        onClick={addTask}
                        size="sm"
                        className="h-9 sm:h-11 px-4 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 ml-auto"
                    >
                        <Plus className="size-5 sm:mr-0.1" />
                        <span className="hidden sm:inline">Thêm</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default AddTask;