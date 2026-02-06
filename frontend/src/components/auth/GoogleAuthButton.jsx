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
        <span className="text-sm text-muted-foreground truncate max-w-[180px] dark:text-slate-200">
          {user.name || user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Đăng xuất
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