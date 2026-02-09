import React, { useState } from "react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Calendar, CheckCircle2, Circle, SquarePen, Trash2, CalendarClock, Tag, StickyNote } from "lucide-react";
import { Input } from "./ui/input";
import { useTask } from "@/hooks/useTask";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Textarea } from "./ui/textarea";

const isOverdue = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
};

import { useEffect, useRef } from "react";

const TaskCard = ({ task, index, handleTaskChanged }) => {
    //State quản lý việc hiển thị input sửa và lưu giá trị đang nhập liệu
    const [isEditting, setIsEditting] = useState(false);
    const cardRef = useRef(null); // Ref to track the card element
    const [titleInput, setTitleInput] = useState(task.title || "");
    const [tagInput, setTagInput] = useState(task.tag || "general");
    const [noteInput, setNoteInput] = useState(task.note || "");

    //Call Hook
    const { deleteTask, updateTaskContent, toggleTaskStatus, isLoading, tags } = useTask(handleTaskChanged);

    // Theo dõi giá trị prop cũ để reset state khi prop thay đổi (Thay thế useEffect)
    const [prevTask, setPrevTask] = useState(task);

    if (itemChanged(prevTask, task)) {
        setPrevTask(task);
        setTitleInput(task.title || "");
        setTagInput(task.tag || "general");
        setNoteInput(task.note || "");
    }

    function itemChanged(prev, current) {
        return prev.title !== current.title || prev.tag !== current.tag || prev.note !== current.note || prev._id !== current._id;
    }

    const handleSaveTitle = async () => {
        //Nếu rỗng hoặc không đổi thì coi như Hủy
        if ((!titleInput.trim() || titleInput === task.title) && tagInput === task.tag && noteInput === task.note) {
            handleCancelEdit();
            return;
        }

        const success = await updateTaskContent(task, {
            title: titleInput,
            tag: tagInput,
            note: noteInput
        });

        if (success) {
            setIsEditting(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditting(false);
        setTitleInput(task.title || "");
        setNoteInput(task.note || "");
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSaveTitle();
        } else if (event.key === "Escape") {
            handleCancelEdit();
        }
    };

    // Click outside handler logic
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isEditting && cardRef.current && !cardRef.current.contains(event.target)) {
                // If clicking outside the card while editing, cancel edit
                handleCancelEdit();
            }
        };

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditting]); // Re-run if isEditting changes

    const taskTag = tags.find(t => t.value === task.tag) || tags[0];

    return (
        <Card
            ref={cardRef}
            className={cn(
                "p-4 bg-gradient-card border-0 shadow-custom-md hover:shadow-custom-lg transition-all duration-200 animate-fade-in group",
                task.status === "complete" && "opacity-75"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center gap-4">
                {/* nút tròn */}
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "flex-shrink-0 size-8 rounded-full transition-all duration-200",
                        task.status === "complete"
                            ? "text-success hover:text-success/80"
                            : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={() => toggleTaskStatus(task)}
                    disabled={isLoading || isEditting}
                >
                    {task.status === "complete" ? (
                        <CheckCircle2 className="size-5" />
                    ) : (
                        <Circle className="size-5" />
                    )}
                </Button>

                {/* hiển thị hoặc chỉnh sửa tiêu đề */}
                <div className="flex-1 min-w-0">
                    {isEditting ? (
                        <div className="flex flex-col gap-2 w-full">
                            <Input
                                placeholder="Cần phải làm gì?"
                                className="flex-1 h-12 text-base border-border/50 focus:border-primary/50 focus:ring-primary/20"
                                type="text"
                                value={titleInput}
                                onChange={(e) => setTitleInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />

                            <Textarea
                                placeholder="Ghi chú..."
                                value={noteInput}
                                onChange={(e) => setNoteInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="text-sm bg-secondary/30 min-h-[60px] resize-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <p
                                className={cn(
                                    "text-base transition-all duration-200 select-none cursor-default",
                                    task.status === "complete"
                                        ? "line-through text-muted-foreground"
                                        : "text-foreground"
                                )}
                            >
                                {task.title}
                            </p>
                            {/* Note Icon - cùng hàng và cùng kích thước với task title */}
                            {task.note && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 p-0 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary/80 flex-shrink-0"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <StickyNote className="size-3.5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4" align="start" side="bottom">
                                        <div className="flex flex-col gap-2">
                                            <h4 className="font-semibold leading-none text-base">Ghi chú</h4>
                                            <p className="text-base text-muted-foreground whitespace-pre-wrap">{task.note}</p>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                    )}

                    {/* ngày tạo & ngày hoàn thành */}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {/* Ngày tạo */}
                        <div className="flex items-center gap-1">
                            <Calendar className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                                Tạo: {new Date(task.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Deadline */}
                        {task.dueDate && task.status !== 'complete' && (
                            <div className={cn(
                                "flex items-center gap-1",
                                isOverdue(task.dueDate) ? "text-destructive font-bold" : "text-orange-500"
                            )}>
                                <CalendarClock className="size-3" />
                                <span className="text-xs">
                                    Hạn: {new Date(task.dueDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        )}

                        {/* Container cho Tag */}
                        <div className="flex items-center gap-2 ml-auto">
                            {/* Tag Display */}
                            {isEditting ? (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <div
                                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: tags.find(t => t.value === tagInput)?.dot || tags[0].dot }}
                                            ></span>
                                            <span style={{ color: tags.find(t => t.value === tagInput)?.dot || tags[0].dot }} className="font-medium">
                                                {tags.find(t => t.value === tagInput)?.label || "Chung"}
                                            </span>
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2" align="start">
                                        <div className="flex flex-col gap-2">
                                            <span className="text-xs font-medium text-muted-foreground px-2">Chọn nhãn</span>
                                            {tags.map((tag) => (
                                                <div
                                                    key={tag.value}
                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-secondary transition-colors ${tagInput === tag.value ? 'bg-secondary' : ''}`}
                                                    onClick={() => setTagInput(tag.value)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: tag.dot }}
                                                    />
                                                    <span className="text-sm">{tag.label}</span>
                                                    {tagInput === tag.value && (
                                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            ) : (
                                task.tag && task.tag !== 'general' && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary text-[10px] border border-white/10">
                                        <span
                                            className="w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: taskTag.dot }}
                                        ></span>
                                        <span style={{ color: taskTag.dot }} className="font-medium">
                                            {taskTag.label}
                                        </span>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* nút chỉnh và xoá */}
                <div className="hidden gap-2 group-hover:inline-flex animate-slide-up">
                    {/* nút edit */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-info"
                        onClick={() => {
                            setIsEditting(true);
                            setTitleInput(task.title || "");
                            setTagInput(task.tag || "general");
                            setNoteInput(task.note || "");
                        }}
                    >
                        <SquarePen className="size-4" />
                    </Button>

                    {/* nút xoá */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 transition-colors size-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteTask(task._id)}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default TaskCard;