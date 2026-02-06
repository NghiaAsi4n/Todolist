import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Kiểm tra xem code có đang chạy ở trình duyệt không
    if (typeof window !== "undefined") {
      // Ưu tiên lấy cấu hình đã lưu trong localStorage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // Nếu chưa lưu, lấy theo cài đặt giao diện của hệ thống
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false; // Mặc định là Light mode
  });

  // 2. useEffect để cập nhật class
  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Trả về Object
  return { isDarkMode, toggleDarkMode };
}