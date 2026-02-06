import User from "../models/User.js";
import { getAuthCookie, verifyAccessToken } from "../utils/authCookies.js";

export async function requireAuth(req, res, next) {
  try {
    const token = getAuthCookie(req);
    if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId).lean();
    if (!user) return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ" });

    req.user = user;
    next();
  } catch (err) {
      return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ" });
  }
}

