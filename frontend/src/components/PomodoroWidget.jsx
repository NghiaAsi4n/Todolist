import React, { useState, useEffect } from 'react';
import { usePomodoro, POMODORO_MODES } from '@/hooks/usePomodoro';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Play, Pause, RotateCcw, X, Settings as SettingsIcon, Coffee, Brain, Timer, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const PomodoroWidget = ({ isOpen, onClose }) => {
    const {
        mode,
        timeLeft,
        isActive,
        settings,
        changeMode,
        toggleTimer,
        resetTimer,
        updateSettings
    } = usePomodoro();

    const [localSettings, setLocalSettings] = useState(settings);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getProgress = () => {
        const totalSeconds = settings[mode] * 60;
        return ((totalSeconds - timeLeft) / totalSeconds) * 100;
    };

    const handleSettingsChange = (modeId, value) => {
        setLocalSettings(prev => ({
            ...prev,
            [modeId]: parseInt(value) || 0
        }));
    };

    const saveSettings = (e) => {
        e?.preventDefault();
        e?.stopPropagation();

        try {
            updateSettings(localSettings);

            toast.success('Pomodoro mới đã được thêm vào.');

            // Đóng popover
            setSettingsOpen(false);
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Có lỗi xảy ra khi lưu cài đặt');
        }
    };

    if (!isOpen) return null;

    const getModeConfig = () => {
        switch (mode) {
            case 'focus':
                return {
                    gradient: 'from-rose-500 via-pink-500 to-orange-500',
                    text: 'text-rose-600 dark:text-rose-400',
                    bg: 'bg-gradient-to-br from-rose-50/95 via-pink-50/90 to-orange-50/95 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-orange-950/50',
                    border: 'border-rose-300/70 dark:border-rose-700/50',
                    shadow: 'shadow-xl shadow-rose-200/40 dark:shadow-rose-900/40',
                    glow: 'shadow-[0_0_50px_-12px_rgba(244,63,94,0.5)] dark:shadow-[0_0_50px_-12px_rgba(244,63,94,0.4)]',
                    ringLight: '#f43f5e',
                    ringDark: '#fb7185',
                    circleBg: 'text-rose-200/40 dark:text-rose-800/30',
                    icon: Brain,
                    label: 'Tập trung'
                };
            case 'short':
                return {
                    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    bg: 'bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-cyan-50/95 dark:from-emerald-950/50 dark:via-teal-950/40 dark:to-cyan-950/50',
                    border: 'border-emerald-300/70 dark:border-emerald-700/50',
                    shadow: 'shadow-xl shadow-emerald-200/40 dark:shadow-emerald-900/40',
                    glow: 'shadow-[0_0_50px_-12px_rgba(16,185,129,0.5)] dark:shadow-[0_0_50px_-12px_rgba(16,185,129,0.4)]',
                    ringLight: '#10b981',
                    ringDark: '#34d399',
                    circleBg: 'text-emerald-200/40 dark:text-emerald-800/30',
                    icon: Coffee,
                    label: 'Nghỉ ngắn'
                };
            case 'long':
                return {
                    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
                    text: 'text-blue-600 dark:text-blue-400',
                    bg: 'bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-purple-50/95 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-purple-950/50',
                    border: 'border-blue-300/70 dark:border-blue-700/50',
                    shadow: 'shadow-xl shadow-blue-200/40 dark:shadow-blue-900/40',
                    glow: 'shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)] dark:shadow-[0_0_50px_-12px_rgba(59,130,246,0.4)]',
                    ringLight: '#3b82f6',
                    ringDark: '#60a5fa',
                    circleBg: 'text-blue-200/40 dark:text-blue-800/30',
                    icon: Timer,
                    label: 'Nghỉ dài'
                };
            default:
                return {};
        }
    };

    const config = getModeConfig();
    const ModeIcon = config.icon;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-500">
            <Card className={cn(
                "w-[380px] backdrop-blur-xl border-2 transition-all duration-700 overflow-hidden",
                config.bg,
                config.border,
                config.shadow,
                isActive && config.glow
            )}>
                <CardContent className="p-8 relative">
                    {/* Decorative Background */}
                    <div className="absolute inset-0 opacity-20 dark:opacity-25 pointer-events-none">
                        <div className={cn(
                            "absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl bg-gradient-to-br",
                            config.gradient
                        )} />
                        <div className={cn(
                            "absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl bg-gradient-to-tr",
                            config.gradient
                        )} />
                    </div>

                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full hover:bg-gray-200/60 dark:hover:bg-white/10 transition-all hover:rotate-90 z-10 text-gray-600 dark:text-gray-400"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>

                    {/* Header with Icon */}
                    <div className="text-center mb-6 relative z-10">
                        <div className={cn(
                            "inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br shadow-lg mb-3 transition-transform hover:scale-110 duration-300",
                            config.gradient
                        )}>
                            <ModeIcon className="w-7 h-7 text-white drop-shadow" />
                        </div>
                        <h3 className={cn(
                            "text-lg font-bold tracking-tight",
                            config.text
                        )}>
                            {config.label}
                        </h3>
                    </div>

                    {/* Mode Tabs */}
                    <div className="flex justify-center gap-2 mb-8 bg-white/80 dark:bg-gray-900/40 p-1.5 rounded-2xl backdrop-blur-md border border-gray-200/60 dark:border-gray-700/40 shadow-sm relative z-10">
                        {Object.values(POMODORO_MODES).map((m) => {
                            const Icon = m.id === 'focus' ? Brain : m.id === 'short' ? Coffee : Timer;
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => changeMode(m.id)}
                                    className={cn(
                                        "flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-1.5",
                                        mode === m.id
                                            ? "bg-white dark:bg-gray-800 shadow-md text-gray-900 dark:text-white scale-105"
                                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/40 hover:scale-102"
                                    )}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">{m.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Timer Display */}
                    <div className="text-center mb-6 relative">
                        {/* Outer Glow Ring */}
                        <div className={cn(
                            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl transition-opacity duration-1000",
                            isActive ? "opacity-25 dark:opacity-30" : "opacity-10 dark:opacity-15",
                            `bg-gradient-to-br ${config.gradient}`
                        )} />

                        {/* Progress Circle Background */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 -rotate-90 pointer-events-none">
                            <circle
                                cx="112" cy="112" r="104"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                className={config.circleBg}
                            />
                        </svg>

                        {/* Progress Circle Active */}
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 -rotate-90 pointer-events-none">
                            <defs>
                                <linearGradient id="progressGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={config.ringLight} stopOpacity="0.9" />
                                    <stop offset="100%" stopColor={config.ringLight} stopOpacity="0.6" />
                                </linearGradient>
                                <linearGradient id="progressGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={config.ringDark} stopOpacity="1" />
                                    <stop offset="100%" stopColor={config.ringDark} stopOpacity="0.7" />
                                </linearGradient>
                            </defs>
                            <circle
                                cx="112" cy="112" r="104"
                                fill="none"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 104}
                                strokeDashoffset={2 * Math.PI * 104 * (1 - getProgress() / 100)}
                                className="transition-all duration-1000 ease-out dark:hidden"
                                strokeLinecap="round"
                                stroke="url(#progressGradientLight)"
                                style={{
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                }}
                            />
                            <circle
                                cx="112" cy="112" r="104"
                                fill="none"
                                strokeWidth="8"
                                strokeDasharray={2 * Math.PI * 104}
                                strokeDashoffset={2 * Math.PI * 104 * (1 - getProgress() / 100)}
                                className="transition-all duration-1000 ease-out hidden dark:block"
                                strokeLinecap="round"
                                stroke="url(#progressGradientDark)"
                                style={{
                                    filter: 'drop-shadow(0 0 6px currentColor)'
                                }}
                            />
                        </svg>

                        {/* Timer Text - Ở GIỮA HÌNH TRÒN */}
                        <div className="relative z-10 flex items-center justify-center h-56">
                            <div className={cn(
                                "text-7xl font-black tabular-nums tracking-tighter bg-clip-text text-transparent bg-gradient-to-br transition-all duration-500 select-none",
                                config.gradient,
                                "drop-shadow-sm"
                            )}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Status Badge - DƯỚI HÌNH TRÒN */}
                    <div className="flex justify-center mb-6 relative z-10">
                        <div className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
                            isActive
                                ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                                : "bg-gray-200/90 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 shadow-sm"
                        )}>
                            {isActive && <Sparkles className="w-3 h-3 animate-pulse" />}
                            {isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-3 relative z-10">
                        {/* Play/Pause Button */}
                        <Button
                            onClick={toggleTimer}
                            className={cn(
                                "w-16 h-16 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 text-white border-0",
                                `bg-gradient-to-br ${config.gradient}`,
                                "hover:brightness-110 active:scale-105"
                            )}
                        >
                            {isActive ?
                                <Pause className="w-7 h-7 fill-current" /> :
                                <Play className="w-7 h-7 fill-current ml-0.5" />
                            }
                        </Button>

                        {/* Reset Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetTimer}
                            className="w-12 h-12 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:rotate-180 duration-500 text-gray-700 dark:text-gray-300 shadow-sm"
                            title="Đặt lại"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>

                        {/* Settings Button */}
                        <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="w-12 h-12 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:rotate-90 duration-300 text-gray-700 dark:text-gray-300 shadow-sm"
                                    title="Cài đặt"
                                >
                                    <SettingsIcon className="w-5 h-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-80 p-5 backdrop-blur-xl bg-white/98 dark:bg-gray-900/98 border-gray-200/80 dark:border-gray-700/60 shadow-2xl rounded-2xl"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                            >
                                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-md",
                                        config.gradient
                                    )}>
                                        <SettingsIcon className="w-5 h-5 text-white" />
                                    </div>
                                    <h4 className="font-bold text-base text-gray-800 dark:text-white">
                                        Cài đặt thời gian
                                    </h4>
                                </div>

                                <div className="grid gap-3">
                                    {Object.values(POMODORO_MODES).map((m) => {
                                        const Icon = m.id === 'focus' ? Brain : m.id === 'short' ? Coffee : Timer;
                                        return (
                                            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200/50 dark:border-gray-700/50">
                                                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                                                <Label htmlFor={m.id} className="flex-1 font-medium text-sm text-gray-700 dark:text-gray-300">
                                                    {m.label}
                                                </Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Input
                                                        id={m.id}
                                                        type="number"
                                                        min="1"
                                                        max="120"
                                                        className="w-16 h-9 text-center font-semibold text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                        value={localSettings[m.id]}
                                                        onChange={(e) => handleSettingsChange(m.id, e.target.value)}
                                                    />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">phút</span>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <Button
                                        type="button"
                                        onClick={saveSettings}
                                        className={cn(
                                            "w-full mt-2 h-11 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]",
                                            `bg-gradient-to-r ${config.gradient} text-white border-0`
                                        )}
                                    >
                                        💾 Lưu cài đặt
                                    </Button>

                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed px-2 bg-gray-100/50 dark:bg-gray-800/50 py-2 rounded-lg">
                                        💡 Thay đổi sẽ áp dụng khi bạn chuyển chế độ hoặc reset timer
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};