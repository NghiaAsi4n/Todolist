import { useState, useEffect, useRef } from 'react';

// Âm thanh Base64 cho tiếng "Ding" nhẹ nhàng (Tiếng ly thủy tinh)
const ALARM_SOUND = "data:audio/mp3;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAG84n41+49kAAAa8J+NfuPZAAABtDf/n+aaf///+l4qpP/7p7f//ygAAAAAAOBCiBAkEAQQAf/8EQgAAgQBAAKAQMAAwAAAAAAgAAgAAAAAAFz3jM18zO/8zZf/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z/zP/M/8z//uQZAQAABiM+AABpAAAAGIz4AAGkAAAAWaa2fk4AAAtY1s/JwAAAB3zL5/l8W2acc4utmu8uxO7LzM3F3/xuK85yxr/7p7f//+ajf//6n/1/8s8AAAAAABJcnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYnT/tS/sxMSkrFhVU3/tYn";

export const POMODORO_MODES = {
    FOCUS: { id: 'focus', label: 'Tập trung', defaultTime: 25 },
    SHORT_BREAK: { id: 'short', label: 'Nghỉ ngắn', defaultTime: 5 },
    LONG_BREAK: { id: 'long', label: 'Nghỉ dài', defaultTime: 15 },
};

const STORAGE_KEY = 'pomodoro_timer_state';

export const usePomodoro = () => {
    // Tải cài đặt từ localStorage hoặc dùng mặc định
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('pomodoro_settings');
            if (saved) return JSON.parse(saved);
        }
        return {
            [POMODORO_MODES.FOCUS.id]: POMODORO_MODES.FOCUS.defaultTime,
            [POMODORO_MODES.SHORT_BREAK.id]: POMODORO_MODES.SHORT_BREAK.defaultTime,
            [POMODORO_MODES.LONG_BREAK.id]: POMODORO_MODES.LONG_BREAK.defaultTime,
        };
    });

    // Chế độ xem hiện tại (Tab nào đang được hiển thị)
    const [viewMode, setViewMode] = useState(POMODORO_MODES.FOCUS.id);

    // Tải trạng thái timer từ localStorage với khả năng phục hồi thời gian
    const [timers, setTimers] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                const now = Date.now();

                // Tính toán lại thời gian cho timer đang chạy
                const recovered = {};
                Object.keys(parsed).forEach(modeId => {
                    const timer = parsed[modeId];
                    if (timer.isActive && timer.startedAt) {
                        // Tính thời gian đã trôi qua kể từ lần lưu cuối
                        const elapsed = Math.floor((now - timer.startedAt) / 1000);
                        const remaining = Math.max(0, timer.timeLeft - elapsed);

                        recovered[modeId] = {
                            timeLeft: remaining,
                            isActive: remaining > 0, // Dừng nếu hết giờ
                            startedAt: remaining > 0 ? timer.startedAt : null
                        };
                    } else {
                        recovered[modeId] = {
                            timeLeft: timer.timeLeft,
                            isActive: false,
                            startedAt: null
                        };
                    }
                });
                return recovered;
            }
        }
        return {
            focus: { timeLeft: settings.focus * 60, isActive: false, startedAt: null },
            short: { timeLeft: settings.short * 60, isActive: false, startedAt: null },
            long: { timeLeft: settings.long * 60, isActive: false, startedAt: null },
        };
    });

    // Ref cho Audio
    const audioRef = useRef(null);

    // Khởi tạo âm thanh
    useEffect(() => {
        audioRef.current = new Audio(ALARM_SOUND);
        audioRef.current.volume = 0.5;
    }, []);

    // Lưu cài đặt khi có thay đổi
    useEffect(() => {
        localStorage.setItem('pomodoro_settings', JSON.stringify(settings));
    }, [settings]);

    // Lưu trạng thái timer vào localStorage mỗi khi thay đổi
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timers));
    }, [timers]);

    // Logic Timer - chạy cho TẤT CẢ các timer đang hoạt động
    useEffect(() => {
        const interval = setInterval(() => {
            setTimers(prev => {
                const updated = { ...prev };

                Object.keys(updated).forEach(modeId => {
                    if (updated[modeId].isActive && updated[modeId].timeLeft > 0) {
                        updated[modeId] = {
                            ...updated[modeId],
                            timeLeft: updated[modeId].timeLeft - 1
                        };
                    } else if (updated[modeId].isActive && updated[modeId].timeLeft === 0) {
                        // Timer kết thúc cho chế độ này
                        updated[modeId] = { ...updated[modeId], isActive: false, startedAt: null };

                        // Phát âm thanh
                        if (audioRef.current) {
                            audioRef.current.play().catch(e => console.error("Audio play failed", e));
                        }

                        // Thông báo
                        const modeLabel = Object.values(POMODORO_MODES).find(m => m.id === modeId)?.label || modeId;
                        if ("Notification" in window && Notification.permission === "granted") {
                            new Notification("Đã hết giờ!", {
                                body: `Bạn đã hoàn thành phiên ${modeLabel}`,
                            });
                        } else if ("Notification" in window && Notification.permission !== "denied") {
                            Notification.requestPermission();
                        }
                    }
                });

                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Đổi chế độ xem (chỉ đổi tab hiển thị, không ảnh hưởng timer đang chạy)
    const changeMode = (newMode) => {
        setViewMode(newMode);
    };

    // Cập nhật cài đặt
    const updateSettings = (newSettings) => {
        setSettings(newSettings);
        // Reset tất cả timer khi cài đặt thay đổi
        setTimers({
            focus: { timeLeft: newSettings.focus * 60, isActive: false, startedAt: null },
            short: { timeLeft: newSettings.short * 60, isActive: false, startedAt: null },
            long: { timeLeft: newSettings.long * 60, isActive: false, startedAt: null },
        });
    };

    // Điều khiển - chỉ MỘT timer được phép chạy tại một thời điểm
    const toggleTimer = () => {
        setTimers(prev => {
            const isCurrentlyActive = prev[viewMode].isActive;

            if (isCurrentlyActive) {
                // Tạm dừng: lưu thời gian còn lại, xóa startedAt
                return {
                    ...prev,
                    [viewMode]: {
                        ...prev[viewMode],
                        isActive: false,
                        startedAt: null
                    }
                };
            } else {
                // Bắt đầu: dừng TẤT CẢ timer khác, chỉ chạy timer này với timestamp
                const newTimers = {};
                Object.keys(prev).forEach(modeId => {
                    if (modeId === viewMode) {
                        newTimers[modeId] = {
                            ...prev[modeId],
                            isActive: true,
                            startedAt: Date.now()
                        };
                    } else {
                        newTimers[modeId] = {
                            ...prev[modeId],
                            isActive: false,
                            startedAt: null
                        };
                    }
                });
                return newTimers;
            }
        });
    };

    const resetTimer = () => {
        setTimers(prev => ({
            ...prev,
            [viewMode]: {
                timeLeft: settings[viewMode] * 60,
                isActive: false,
                startedAt: null
            }
        }));
    };

    // Giá trị tính toán cho chế độ xem hiện tại
    const currentTimer = timers[viewMode];

    return {
        mode: viewMode,
        timeLeft: currentTimer.timeLeft,
        isActive: currentTimer.isActive,
        settings,
        timers, // Public tất cả timer để UI hiển thị indicator
        changeMode,
        toggleTimer,
        resetTimer,
        updateSettings
    };
};
