import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const loginGoogle = async (credential) => {
        try {
            await api.post("/auth/google", { credential });
            toast.success("Đăng nhập thành công!");
            await fetchUser(); // Load lại user
            return true;
        } catch (error) {
            console.error(error);
            toast.error("Đăng nhập thất bại");
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
            setUser(null);
            toast.success("Đã đăng xuất");
            // Reload trang hoặc redirect về login
            // window.location.reload(); 
        } catch (error) {
            toast.error("Lỗi đăng xuất");
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    return { user, loading, loginGoogle, logout, refreshUser: fetchUser };
};