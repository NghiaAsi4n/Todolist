import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Lưu googleSub là chuẩn xác để định danh user từ Google, 
    // tránh phụ thuộc vào email (vì email có thể thay đổi, nhưng sub id thì không).
    googleSub: { 
      type: String, 
      unique: true, 
      sparse: true, 
      index: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true },
    name: { 
      type: String, 
      default: "" },
    avatar: { 
      type: String, 
      default: "" },
    lastLoginAt: { 
      type: Date },
  },
  { 
    timestamps: true 
  }
);

const User = mongoose.model("User", userSchema);

export default User;
