import express from "express";
import {
	signup,
	login,
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
} from "../controller/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Authentication Routes
router.post("/signup", signup);
router.post("/login", login);

// User Routes
router.get("/users", authMiddleware, getAllUsers);
router.get("/users/:id", authMiddleware, getUserById);
router.put("/users/:id", authMiddleware, updateUser);
router.delete(
	"/users/:id",
	authMiddleware,
	deleteUser
);

export default router;
