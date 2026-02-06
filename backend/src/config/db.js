import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("Kết nối database thành công!");
    }
    catch (error) {
        console.error("Lỗi khi kết nối database:", error)
        process.exit(1); //exit with error
    }
};