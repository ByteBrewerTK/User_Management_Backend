import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { JWT_SECRET } from "../config/dotenv.js"

// Signup (Register User)
export const signup = async (req, res) => {
	const { name, email, password, role } = req.body;
	console.log(name)

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser)
			return res.status(400).json({ message: "User already exists" });

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
		});

		// Assign role (default to 'User' if no role provided)
		const assignedRole = await Role.findOne({
			where: { name: role || "User" },
		});
		if (assignedRole) await user.addRole(assignedRole);

		// Generate JWT Token
		const token = jwt.sign({ id: user.id }, JWT_SECRET, {
			expiresIn: "1h",
		});

		res.status(201).json({
			message: "User registered successfully",
			token,
		});
	} catch (err) {
		res.status(500).json({
			message: "Error while signing up",
			error: err.message,
		});
	}
};

// Login
export const login = async (req, res) => {
	const { email, password } = req.body;

	try {
		// Check if user exists
		const user = await User.findOne({ where: { email }, include: Role });
		if (!user) return res.status(400).json({ message: "User not found" });

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		// Get user roles
		const roles = user.Roles.map((role) => role.name);

		// Generate JWT Token
		const token = jwt.sign({ id: user.id, roles }, JWT_SECRET, {
			expiresIn: "1h",
		});

		res.status(200).json({ message: "Login successful", token });
	} catch (err) {
		res.status(500).json({
			message: "Error during login",
			error: err.message,
		});
	}
};

// Get All Users (Only for Admin)
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.findAll({ include: Role });
		res.status(200).json(users);
	} catch (err) {
		res.status(500).json({
			message: "Error fetching users",
			error: err.message,
		});
	}
};

// Get User by ID
export const getUserById = async (req, res) => {
	try {
		const user = await User.findByPk(req.params.id, { include: Role });
		if (!user) return res.status(404).json({ message: "User not found" });

		res.status(200).json(user);
	} catch (err) {
		res.status(500).json({
			message: "Error fetching user",
			error: err.message,
		});
	}
};

// Update User (Only for Admin or Self)
export const updateUser = async (req, res) => {
	try {
		const { name, email, password, role } = req.body;
		const user = await User.findByPk(req.params.id);

		if (!user) return res.status(404).json({ message: "User not found" });

		// Only allow user or admin to update
		if (req.user.id !== user.id && !req.user.roles.includes("Admin")) {
			return res.status(403).json({ message: "Unauthorized" });
		}

		// Update fields
		if (name) user.name = name;
		if (email) user.email = email;
		if (password) user.password = await bcrypt.hash(password, 10);

		await user.save();

		//Update role (if provided)
		if (role) {
			const assignedRole = await Role.findOne({ where: { name: role } });
			if (assignedRole) await user.setRoles([assignedRole]);
		}

		res.status(200).json({ message: "User updated successfully" });
	} catch (err) {
		res.status(500).json({
			message: "Error updating user",
			error: err.message,
		});
	}
};

// Delete User (Only for Admin)
export const deleteUser = async (req, res) => {
	try {
		const user = await User.findByPk(req.params.id);
		if (!user) return res.status(404).json({ message: "User not found" });

		await user.destroy();
		res.status(200).json({ message: "User deleted successfully" });
	} catch (err) {
		res.status(500).json({
			message: "Error deleting user",
			error: err.message,
		});
	}
};
