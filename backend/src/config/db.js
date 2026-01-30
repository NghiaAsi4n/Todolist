import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING);
        console.log("lien ket DB thanh cong!");
    }
    catch (error) {
        console.error("loi khi lien ket DB:", error)
        process.exit(1); //exit with error
    }
};