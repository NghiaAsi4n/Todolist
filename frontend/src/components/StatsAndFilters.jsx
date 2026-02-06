import React from "react";
import { Badge } from "./ui/badge";
import { FilterType } from "@/lib/data";
import { Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

export const StatsAndFilters = ({
    completedTasksCount = 0,
    activeTasksCount = 0,
    filter = "all",
    setFilter,
    searchQuery,
    setSearchQuery
}) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                {/* Phần thống kê */}
                <div className="flex gap-3">
                    <Badge
                        variant="secondary"
                        className="bg-white/50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-sky-400 dark:border-sky-400/30"
                    >
                        {activeTasksCount} {FilterType.active}
                    </Badge>

                    <Badge
                        variant="secondary"
                        className="bg-white/50 text-green-700 border-green-200 dark:bg-slate-800 dark:text-green-400 dark:border-green-400/30"
                    >
                        {completedTasksCount} {FilterType.completed}
                    </Badge>
                </div>

                {/* Phần bộ lọc */}
                <div className="flex flex-wrap gap-2 items-center">
                    {/* Nút bật/tắt tìm kiếm */}
                    <Button
                        id="filter-btn"
                        variant={searchQuery ? 'default' : 'ghost'}
                        size="sm"
                        className={`capitalize transition-all border border-dashed ${searchQuery
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20'
                            : 'text-slate-600 border-slate-300 hover:bg-slate-100 dark:text-slate-400 dark:border-slate-700 dark:hover:text-white dark:hover:bg-slate-800'
                            }`}
                        onClick={() => setSearchQuery(prev => prev === undefined ? "" : undefined)}
                    >
                        <Search className="size-4 mr-1" />
                        Lọc
                    </Button>

                    {
                        Object.keys(FilterType).map((type) => (
                            <Button
                                key={type}
                                variant={filter === type ? 'default' : 'ghost'}
                                size='sm'
                                className={`capitalize transition-all ${filter === type
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                                    }`}
                                onClick={() => setFilter(type)}
                            >
                                <Filter className="size-4" />
                                {FilterType[type]}
                            </Button>
                        ))}
                </div>
            </div>

            {/* Input Tìm kiếm - Chỉ hiện khi searchQuery khác undefined */}
            {searchQuery !== undefined && (
                <div className="relative w-full animate-in fade-in slide-in-from-top-2 duration-200">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        autoFocus
                        placeholder="Nhập từ khoá tìm kiếm..."
                        className="pl-9 h-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-border/50 focus:border-primary/50 focus:ring-primary/20"
                        value={searchQuery || ""}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onBlur={(e) => {
                            // Nếu click vào nút Filter thì để nút đó xử lý toggle, không ẩn ở đây
                            if (e.relatedTarget?.id !== "filter-btn") {
                                setSearchQuery(undefined);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default StatsAndFilters;