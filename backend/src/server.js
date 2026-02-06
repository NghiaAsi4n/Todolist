import "dotenv/config"
import dotenv from "dotenv";
import express from "express";
import taskRoute from "./routes/taskRoute.js";
import authRoute from "./routes/authRoute.js";
import { connectDB } from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import cronService from "./services/cronService.js";
import Task from "./models/Task.js";

dotenv.config();

const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

const app = express();

//Thêm middlewares
const isDevAllowedOrigin = (origin) => {
    // Vite thường dùng 5173 và tự tăng nếu bị chiếm (5174, 5175...).
    return /^http:\/\/localhost:517\d$/.test(origin);
};

app.use(cors({
    origin: (origin, cb) => {
        //Cho phép server-to-server hoặc không có origin
        if (!origin) return cb(null, true);

        //Cho phép Localhost (Dev)
        if (isDevAllowedOrigin(origin)) return cb(null, true);

        //Cho phép Domain chính thức
        if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
            return cb(null, true);

        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
})
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

// Route Ping để giữ server alive (dùng cho UptimeRobot)
app.get("/ping", (req, res) => {
    res.status(200).send("Pong! Server is alive and Cron Jobs are running 🤖");
});

app.use("/api/tasks", taskRoute);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
    });
}


connectDB().then(() => {
    cronService.startCronJobs();
    const server = app.listen(PORT, () => {
        console.log(`Server đang chạy trên cổng ${PORT}`);
    });

    server.on("error", (err) => {
        if (err?.code === "EADDRINUSE") {
            console.error(
                `Cổng ${PORT} đang được sử dụng. Hãy tắt process đang chạy port này hoặc đổi PORT trong backend/.env`
            );
        } else {
            console.error("Lỗi server:", err);
        }
        process.exit(1);
    });
});

