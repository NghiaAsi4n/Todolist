import authService from "../services/authService.js";
import { setAuthCookie, clearAuthCookie } from "../utils/authCookies.js";

export async function googleLogin(req, res) {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: "Thiếu credential" });

    const { user, token, isNewUser } = await authService.loginWithGoogle(credential);

    setAuthCookie(res, token);

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      isNewUser,
    });

  } catch (err) {
    console.error("googleLogin error:", err);
    return res.status(500).json({ message: err.message || "Lỗi đăng nhập Google" });
  }
}

export async function me(req, res) {
  const u = req.user;
  return res.status(200).json({
    user: {
      _id: u._id,
      email: u.email,
      name: u.name,
      avatar: u.avatar,
    },
  });
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Đã đăng xuất" });
}