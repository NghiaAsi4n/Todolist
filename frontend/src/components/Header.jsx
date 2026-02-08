import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import GoogleAuthButton from "./auth/GoogleAuthButton";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Moon, Sun, Timer, BarChart2 } from "lucide-react";
import { Button } from "./ui/button";
import { PomodoroWidget } from './PomodoroWidget';
import { useNavigate } from 'react-router';

export const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const navigate = useNavigate();

  // Render fixed buttons using Portal to ensure they're outside any parent transforms
  const fixedButtons = (
    <div className="fixed top-3 right-3 md:top-4 md:right-4 z-[9999] flex items-center gap-2 md:gap-3">
      {/* Pomodoro Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
        className={`rounded-full px-2 md:px-4 py-2 transition-all duration-300 border border-transparent backdrop-blur-md shadow-sm
          ${isPomodoroOpen
            ? 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/90 dark:text-rose-300 dark:border-rose-500/30'
            : 'bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-rose-900/50'
          }`}
        title="Pomodoro Timer"
      >
        <div className="flex items-center gap-2">
          <Timer className={`size-5 md:size-[18px] ${isPomodoroOpen ? 'text-rose-600 dark:text-rose-400' : 'text-rose-500 dark:text-rose-400'}`} />
          <span className={`text-sm font-medium hidden md:inline ${isPomodoroOpen ? 'text-rose-700 dark:text-rose-300' : 'text-slate-700 dark:text-slate-200'}`}>
            Pomodoro
          </span>
        </div>
      </Button>

      {/* Analytics Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/analytics')}
        className="rounded-full px-2 md:px-4 py-2 transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/50 border border-transparent"
        title="Xem thống kê"
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="size-5 md:size-[18px] text-indigo-500 dark:text-indigo-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:inline">
            Thống kê
          </span>
        </div>
      </Button>

      {/* Dark Mode Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        className="rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm hover:bg-muted size-9"
      >
        {isDarkMode ? (
          <Sun className="size-5 text-yellow-500" />
        ) : (
          <Moon className="size-5 text-slate-600" />
        )}
      </Button>

      {/* Google Auth */}
      <div className="rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm p-0.5">
        <GoogleAuthButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Use Portal to render fixed buttons at document.body level */}
      {createPortal(fixedButtons, document.body)}

      {/* Pomodoro Widget - also use Portal */}
      {createPortal(
        <PomodoroWidget isOpen={isPomodoroOpen} onClose={() => setIsPomodoroOpen(false)} />,
        document.body
      )}

      {/* HEADER CONTENT */}
      <header className="w-full">
        <div className="space-y-2 text-center pt-16 pb-6 px-4">
          <h1 className="text-4xl font-bold text-transparent bg-primary bg-clip-text animate-in fade-in zoom-in duration-500">
            TO DO LIST
          </h1>

          <p className="text-muted-foreground dark:text-slate-50 transition-colors text-sm sm:text-base">
            Không có việc gì khó, chỉ sợ mình không làm 🎯🚀
          </p>
        </div>
      </header>
    </>
  );
}

export default Header;