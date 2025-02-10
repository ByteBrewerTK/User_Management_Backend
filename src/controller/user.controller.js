import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import { sendWelcomeEmailAdmin } from "../../utils/nodemailer.js";
import { uploadCloudinary } from "../../utils/cloudinary.js";

const isValidDate = (dob) => {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(dob)) return false;

	const date = new Date(dob);
	return !isNaN(date.getTime()) && date.toISOString().split("T")[0] === dob;
};

const generatePassword = (name) => {
	const nameSubstring = name.length > 4 ? name.slice(0, 4) : name;

	const randomHex = Math.floor(Math.random() * 16777215)
		.toString(16)
		.padStart(4, "0");

	const specialChars = [
		"!",
		"@",
		"#",
		"$",
		"%",
		"^",
		"&",
		"*",
		"(",
		")",
		"_",
		"-",
		"=",
		"+",
	];
	const randomSpecialChar =
		specialChars[Math.floor(Math.random() * specialChars.length)];

	let password = nameSubstring + randomHex + randomSpecialChar;

	password = password.slice(0, 8);

	return password;
};

export const addUser = async (req, res) => {
	const { name, dob, role, email } = req.body;
	try {
		console.log(name, dob, role, email);

		// Check if all required fields exist
		if (!name || !dob || !role || !email) {
			return res
				.status(400)
				.json({ message: "All fields are required!" });
		}

		// Validate Date of Birth format (YYYY-MM-DD)
		if (!isValidDate(dob)) {
			return res
				.status(400)
				.json({ message: "Invalid DOB format! Use YYYY-MM-DD." });
		}

		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.status(409).json({
				message: "User already exists with this email!",
			});
		}

		console.log("file : ", req.file);
		let cloudinaryResult;
		if (req.file) {
			// Validate file type (image only)
			const mimetype = req.file.mimetype;
			if (!mimetype.startsWith("image/")) {
				return res
					.status(400)
					.json({ message: "Only image files are allowed!" });
			}

			// Upload profile image to Cloudinary using the file buffer
			cloudinaryResult = await uploadCloudinary(
				req.file.path,
				req.file.originalname
			);

			console.log("cloudinaryResult : ", cloudinaryResult);
		}

		const profileImageUrl = cloudinaryResult
			? cloudinaryResult?.secure_url
			: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
					name
			  )}`;

		const password = generatePassword(name);
		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Check if the role exists in the Role table
		const roleRecord = await Role.findOne({ where: { name: role } });
		if (!roleRecord) {
			return res.status(400).json({ message: "Invalid role!" });
		}

		// Save user with profile image and role
		console.log("cloudinaryResult : ", cloudinaryResult);
		const newUser = await User.create({
			name,
			dob,
			email,
			password: hashedPassword,
			avatar: profileImageUrl,
			roleId: roleRecord.id,
		});

		if (!newUser) {
			return res.status(500).json({ message: "Error while adding user" });
		}

		// Send welcome email to the admin with credentials
		sendWelcomeEmailAdmin(name, email, password);

		res.status(200).json({
			message: "User created successfully!",
			user: newUser,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Error creating user",
			error: err.message,
		});
	}
};

// Get All Users (Only for Admin)
export const getAllUsers = async (_, res) => {
	try {
		const users = await User.findAll({
			include: [{ model: Role }],
		});
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
		const { name, email, password, role, avatar } = req.body;
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
