import { Router } from "express";
import {
	login,
	resendOtp,
	resetPasswordRequest,
	signup,
	updatePasswordRequest,
	verifyOtp,
	verifyResetPassword,
	verifyUpdatePassword,
} from "../controller/auth.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Authentication Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/reset-password", resetPasswordRequest);
router.post("/verify-reset", verifyResetPassword);
router.post("/update-password", authMiddleware, updatePasswordRequest);
router.post("/verify-update", authMiddleware, verifyUpdatePassword);

export default router;
