import express from "express";
import tasksRoute from "./routes/tasksRoute.js";
import {connectDB} from "./config/db.js";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 5001;

const app = express();

//Thêm middlewares
app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRoute);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`server dang chay tren cong ${PORT}`);
    });
});

