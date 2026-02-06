import React, { useState } from 'react';
import GoogleAuthButton from "./auth/GoogleAuthButton";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Sun, Timer } from "lucide-react";
import { Button } from "./ui/button";
import { PomodoroWidget } from './PomodoroWidget';
import { useNavigate } from 'react-router';

export const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="relative py-6 w-full">
      {/* fixed: Cố định vị trí theo cửa sổ trình duyệt
            top-5 right-5: Căn lề trên và phải 16px
            z-50: Đảm bảo nút luôn nổi lên trên cùng
        */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {/* Pomodoro Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
          className={`rounded-full px-4 py-2 transition-all duration-300 border border-transparent 
            ${isPomodoroOpen
              ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-500/30'
              : 'hover:bg-gradient-to-r hover:from-rose-50 hover:to-orange-50 dark:hover:from-rose-900/30 dark:hover:to-orange-900/30 hover:border-rose-200 dark:hover:border-rose-500/30'
            }`}
          title="Pomodoro Timer"
        >
          <div className="flex items-center gap-2">
            <Timer className={`w-[18px] h-[18px] ${isPomodoroOpen ? 'text-rose-600 dark:text-rose-400' : 'text-rose-500 dark:text-rose-400'}`} />
            <span className={`text-sm font-medium ${isPomodoroOpen ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-200'}`}>Pomodoro</span>
          </div>
        </Button>

        {/* Analytics Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/analytics')}
          className="rounded-full px-4 py-2 transition-all duration-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
          title="Xem thống kê"
        >
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-indigo-500 dark:text-indigo-400"
            >
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Thống kê</span>
          </div>
        </Button>

        {/* Dark Mode Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-full transition-transform duration-300 hover:bg-muted"
          title={isDarkMode ? "Bật chế độ sáng" : "Bật chế độ tối"}
        >
          {isDarkMode ? (
            <Sun className="size-5 text-yellow-500 transition-all duration-300" />
          ) : (
            <Moon className="size-5 text-slate-600 transition-all duration-300" />
          )}
        </Button>

        {/* Google Auth Button */}
        <GoogleAuthButton />
      </div>

      {/* Pomodoro Widget */}
      <PomodoroWidget isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />

      {/* Tiêu đề */}
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text">
          TO DO LIST
        </h1>

        <p className="text-muted-foreground dark:text-slate-50 transition-colors">
          Không có việc gì khó, chỉ sợ mình không làm ( っ'-')╮ =͟͟͞͞🏀
        </p>
      </div>

    </header>
  );
}

export default Header;