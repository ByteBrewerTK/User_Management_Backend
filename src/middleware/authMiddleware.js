import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/dotenv.js";

const authMiddleware = (req, res, next) => {
	const token = req.cookies.token || req.header("x-auth-token");
	if (!token) return res.status(401).json({ message: "Access denied" });

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (err) {
		res.status(400).json({ message: "Invalid token" });
	}
};

export default authMiddleware;
