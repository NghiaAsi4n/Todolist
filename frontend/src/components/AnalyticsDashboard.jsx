import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import api from '@/lib/axios';


const AnalyticsDashboard = ({ triggerRefresh }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/tasks/analytics');
            setData(res.data);
        } catch (error) {
            console.error("Lỗi tải thống kê:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [triggerRefresh]);

    if (loading || !data) return null;

    // Chuẩn bị dữ liệu cho PieChart (Tổng quan)
    // data.overview là mảng [{ _id: 'active', count: 5 }, { _id: 'complete', count: 3 }]
    const overviewData = [
        { name: 'Đang làm', value: data.overview?.find(i => i._id === 'active')?.count || 0, color: '#f59e0b' }, // Orange-500
        { name: 'Hoàn thành', value: data.overview?.find(i => i._id === 'complete')?.count || 0, color: '#22c55e' }, // Green-500
    ].filter(item => item.value > 0);

    // Chuẩn bị dữ liệu cho Tag Chart
    const tagColors = {
        'general': '#64748b',
        'work': '#f97316',
        'study': '#3b82f6',
        'personal': '#ec4899'
    };

    // Mapping tag key sang label hiển thị
    const tagLabels = {
        'general': 'Chung',
        'work': 'Công ty',
        'study': 'Học tập',
        'personal': 'Cá nhân'
    };

    const tagData = (data.tags || []).map(item => ({
        name: tagLabels[item._id] || item._id,
        value: item.count,
        color: tagColors[item._id] || '#8884d8'
    }));

    // Dữ liệu biểu đồ cột 7 ngày
    const barData = (data.daily_7days || []).map(item => ({
        date: item._id,
        count: item.count
    }));

    if (overviewData.length === 0 && tagData.length === 0 && barData.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8">
                Chưa có dữ liệu thống kê. Hãy tạo và hoàn thành task để xem biểu đồ!
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Biểu đồ tròn: Tổng quan & Tags */}
            <Card className="col-span-3 bg-gradient-to-br from-purple-50/80 via-white/90 to-violet-50/80 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/40 border border-purple-200/50 dark:border-white/10 backdrop-blur-sm shadow-xl hover:shadow-purple-200/40 dark:hover:shadow-indigo-500/20 transition-all duration-300 hover:border-purple-300/70 dark:hover:border-white/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 animate-pulse"></div>
                            Phân bổ công việc
                        </CardTitle>
                        <div className="text-xs text-gray-600 dark:text-slate-400 bg-purple-100/60 dark:bg-slate-800/50 px-3 py-1 rounded-full font-medium">
                            Tổng: {overviewData.reduce((sum, item) => sum + item.value, 0)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <defs>
                                {overviewData.map((entry, index) => (
                                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={overviewData}
                                cx="50%"
                                cy="45%"
                                innerRadius={65}
                                outerRadius={95}
                                paddingAngle={3}
                                dataKey="value"
                                animationBegin={0}
                                animationDuration={800}
                            >
                                {overviewData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={`url(#gradient-${index})`}
                                        stroke="rgba(255,255,255,0.3)"
                                        strokeWidth={2}
                                        className="dark:stroke-white/10"
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    borderColor: 'rgba(168, 85, 247, 0.3)',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(168, 85, 247, 0.2)'
                                }}
                                itemStyle={{
                                    color: '#374151',
                                    fontWeight: '500'
                                }}
                                labelStyle={{
                                    color: '#6b7280',
                                    fontSize: '12px',
                                    marginBottom: '4px'
                                }}
                                wrapperClassName="dark:[&>div]:!bg-slate-900/95 dark:[&>div]:!border-white/20"
                                itemClassName="dark:!text-white"
                                labelClassName="dark:!text-slate-400"
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={50}
                                iconType="circle"
                                wrapperStyle={{
                                    paddingTop: '20px',
                                    fontSize: '13px'
                                }}
                                formatter={(value, entry) => (
                                    <span className="text-gray-700 dark:text-slate-200">
                                        {value} ({entry.payload.value})
                                    </span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Biểu đồ cột: Hiệu suất 7 ngày */}
            <Card className="col-span-4 bg-gradient-to-br from-blue-50/80 via-white/90 to-indigo-50/80 dark:from-slate-950/40 dark:via-slate-900/60 dark:to-blue-950/40 border border-blue-200/50 dark:border-white/10 backdrop-blur-sm shadow-xl hover:shadow-blue-200/40 dark:hover:shadow-blue-500/20 transition-all duration-300 hover:border-blue-300/70 dark:hover:border-white/20">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse"></div>
                            Hiệu suất 7 ngày qua
                        </CardTitle>
                        <div className="text-xs text-gray-600 dark:text-slate-400 bg-blue-100/60 dark:bg-slate-800/50 px-3 py-1 rounded-full font-medium">
                            Tổng: {barData.reduce((sum, item) => sum + item.count, 0)}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="h-[320px] pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={barData}
                            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                        >
                            <defs>
                                {/* Gradient cho Light Mode */}
                                <linearGradient id="colorBarLight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
                                </linearGradient>

                                {/* Gradient cho Dark Mode */}
                                <linearGradient id="colorBarDark" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                                </linearGradient>

                                <filter id="glow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(209, 213, 219, 0.5)"
                                className="dark:stroke-slate-700/30"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                className="dark:stroke-slate-500"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{
                                    stroke: 'rgba(209, 213, 219, 0.5)',
                                    className: 'dark:stroke-slate-700'
                                }}
                                tick={{
                                    fill: '#6b7280',
                                    className: 'dark:fill-slate-400'
                                }}
                            />
                            <YAxis
                                stroke="#6b7280"
                                className="dark:stroke-slate-500"
                                fontSize={12}
                                tickLine={false}
                                axisLine={{
                                    stroke: 'rgba(209, 213, 219, 0.5)',
                                    className: 'dark:stroke-slate-700'
                                }}
                                tick={{
                                    fill: '#6b7280',
                                    className: 'dark:fill-slate-400'
                                }}
                                tickFormatter={(value) => `${value}`}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{
                                    fill: 'rgba(168, 85, 247, 0.08)',
                                    className: 'dark:fill-purple-500/10',
                                    radius: 4
                                }}
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                                    borderColor: 'rgba(168, 85, 247, 0.3)',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(168, 85, 247, 0.2)'
                                }}
                                labelStyle={{
                                    color: '#374151',
                                    fontWeight: '600',
                                    marginBottom: '4px'
                                }}
                                itemStyle={{
                                    color: '#7c3aed',
                                    fontWeight: '500'
                                }}
                                wrapperClassName="dark:[&>div]:!bg-slate-900/95 dark:[&>div]:!border-purple-500/30"
                                itemClassName="dark:!text-purple-400"
                                labelClassName="dark:!text-slate-300"
                            />
                            <Bar
                                dataKey="count"
                                name="Hoàn thành"
                                fill="url(#colorBarLight)"
                                className="dark:fill-[url(#colorBarDark)]"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={60}
                                animationBegin={0}
                                animationDuration={800}
                                animationEasing="ease-out"
                            >
                                {barData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        filter="url(#glow)"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default AnalyticsDashboard;
