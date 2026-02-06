import express from "express";
import {
    createTask,
    deleteTask,
    getAllTasks,
    updateTask,
    getTaskAnalytics
} from "../controllers/taskController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.use(requireAuth); //Áp dụng middleware requireAuth cho tất cả các routes

router.get("/analytics", getTaskAnalytics);

router.get("/", getAllTasks);

router.post("/", createTask); //nghĩa là POST tới /api/tasks sẽ gọi createTask

router.put("/:id", updateTask);

router.delete("/:id", deleteTask);

export default router;
