import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";

export const authMiddleware = async (req, res, next) => {
	const token = req.cookies.token || req.header("x-auth-token");
	if (!token) return res.status(401).json({ message: "Access denied" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findByPk(decoded.id, {
			include: [
				{
					model: Role,
					attributes: ["id", "name"],
				},
			],
		});

		req.user = user;

		next();
	} catch (err) {
		res.status(400).json({ message: "Invalid token" });
	}
};

export const authorizeRoles = (...allowedRoles) => {
	return (req, res, next) => {
		const user = req.user;
		console.log(user.Role.name);
		if (!user || !allowedRoles.includes(user.Role.name)) {
			return res
				.status(403)
				.json({ message: "Forbidden: Insufficient permissions" });
		}
		next();
	};
};
