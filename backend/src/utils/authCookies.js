import jwt from "jsonwebtoken";

const COOKIE_NAME = "auth_token";

function isSecureCookie() {
  // Dev trên http://localhost cần secure=false để cookie set được.
  // Nếu deploy https, set NODE_ENV=production và/hoặc COOKIE_SECURE=true.
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

export function signAccessToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Không tìm thấy JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyAccessToken(token) { //giải mã JWT và lấy payload.userId
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Không tìm thấy JWT_SECRET");
  return jwt.verify(token, secret);
}

// Gửi Token Về Frontend (HttpOnly Cookie)
export function setAuthCookie(res, token) {
  const secure = isSecureCookie();
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: secure ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  const secure = isSecureCookie();
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure,
    sameSite: secure ? "strict" : "lax",
    path: "/",
  });
}

export function getAuthCookie(req) {
  return req.cookies?.[COOKIE_NAME];
}

