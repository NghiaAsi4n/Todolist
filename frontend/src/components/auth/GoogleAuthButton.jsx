import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth"; // Import hook useAuth

const GoogleAuthButton = () => {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Lấy toàn bộ data và action từ useAuth
  const { user, loading, loginGoogle, logout } = useAuth();

  // Xử lý đăng nhập
  const handleLoginSuccess = async (credentialResponse) => {
    // Gọi hàm login từ hook
    const success = await loginGoogle(credentialResponse?.credential);

    // Nếu login thành công, bắn sự kiện để HomePage biết mà load lại Task
    // (Giữ lại dòng này để tương thích với HomePage hiện tại)
    if (success) {
      window.dispatchEvent(new Event("auth-changed"));
    }
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    await logout(); // Hook tự xử lý API và Toast
    window.dispatchEvent(new Event("auth-changed"));
  };

  // Nếu đang check login thì không hiện gì cả (tránh nhấp nháy)
  if (loading) return null;

  // --- TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP ---
  if (user) {
    return (
      <div className="flex items-center justify-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name || user.email}
            className="w-8 h-8 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : null}
        <span className="text-sm text-muted-foreground truncate max-w-[180px] dark:text-slate-200 hidden md:block">
          {user.name || user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 md:px-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
          <span className="hidden md:inline">Đăng xuất</span>
          <span className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          </span>
        </Button>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 2: CHƯA CẤU HÌNH CLIENT ID ---
  if (!googleClientId) {
    return (
      <div className="flex justify-center">
        <span className="text-sm text-muted-foreground">
          Thiếu cấu hình Google Client ID (tạo `frontend/.env` và set `VITE_GOOGLE_CLIENT_ID`).
        </span>
      </div>
    );
  }

  // --- TRƯỜNG HỢP 3: CHƯA ĐĂNG NHẬP (Hiện nút Google) ---
  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => toast.error("Lỗi kết nối Google Login")}
        useOneTap
      />
    </div>
  );
};

export default GoogleAuthButton;