import { Router } from "express";
import {
	getAllUsers,
	getUserById,
	updateUser,
	deleteUser,
	addUser,
} from "../controller/user.controller.js";
import {
	authMiddleware,
	authorizeRoles,
} from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// User Routes
router.post("/", authorizeRoles("Admin"), addUser);
router.get("/", authorizeRoles("Admin"), getAllUsers);
router.get("/:id", authorizeRoles("Admin"), getUserById);
router.put("/:id", authorizeRoles("Admin"), updateUser);
router.delete("/:id", authorizeRoles("Admin"), deleteUser);

export default router;
