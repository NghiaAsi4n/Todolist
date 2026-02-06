import express from "express";
import { googleLogin, logout, me } from "../controllers/authController.js"; 
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.post("/google", googleLogin);
router.get("/me", requireAuth, me);
router.post("/logout", logout);

export default router;

