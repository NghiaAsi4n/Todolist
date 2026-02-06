import React from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDarkMode } from '@/hooks/useDarkMode';

const AnalyticsPage = () => {
    const navigate = useNavigate();

    //đảm bảo dark mode được khôi phục từ localStorage
    useDarkMode();

    return (
        <div className="min-h-screen w-full bg-[#fefcff] dark:bg-black relative transition-colors duration-500">
            {/* Bg cho Light mode */}
            <div
                className="absolute inset-0 z-0 transition-opacity duration-500 dark:opacity-0"
                style={{
                    backgroundImage: `
                    radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.35), transparent 60%),
                    radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.4), transparent 60%)`,
                }}
            />

            {/* Bg cho Dark mode */}
            <div
                className="absolute inset-0 z-0 opacity-0 transition-opacity duration-500 dark:opacity-100"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99, 102, 241, 0.25), transparent 70%), #000000",
                }}
            />

            <div className="container pt-8 mx-auto relative z-10">
                <div className="w-full max-w-4xl p-6 mx-auto space-y-6">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/')}
                            className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
                        >
                            <ArrowLeft className="size-5" />
                        </Button>
                        <h1 className="text-2xl font-bold">Thống kê & Biểu đồ</h1>
                    </div>

                    <AnalyticsDashboard />
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
