import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import emailService from "./emailService.js";
import { signAccessToken } from "../utils/authCookies.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginWithGoogle = async (credential) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Thiếu GOOGLE_CLIENT_ID trong .env");

  //Xác thực Google Token
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) throw new Error("Google token không hợp lệ");

  const { email, name, picture: avatar, sub: googleSub } = payload;

  //Logic Tìm hoặc Tạo User
  console.log("Bắt đầu xử lý đăng nhập cho:", email);

  let user = await User.findOne({ 
    $or: [{ googleSub }, { email: email.toLowerCase() }] 
  });

  let isNewUser = false;

  if (user) {
    //Cập nhật thông tin user cũ
    user.googleSub = googleSub;
    user.name = name;
    user.avatar = avatar;
    user.lastLoginAt = new Date();
    await user.save();
  } else {
    // Tạo user mới
    console.log("{Đang lưu thông tin user...}");
    user = await User.create({
      googleSub,
      email: email.toLowerCase(),
      name,
      avatar,
      lastLoginAt: new Date(),
    });
    isNewUser = true;

    console.log("{Đang gọi emailService...}");

    //Gửi Email Chào mừng (Background task). Không dùng await để tránh block user
    emailService.sendWelcomeEmail(user.email, user.name)
      .then(() => {
        console.log("Gửi mail thành công!")
      })
      .catch(error => {
        console.error("{Gửi mail thất bại. Lỗi:}", error)
      });
    }

  //Tạo Token
  const token = signAccessToken({ userId: user._id.toString() });

  //Trả về dữ liệu thô
  return { user, token, isNewUser };
};

export default { loginWithGoogle };