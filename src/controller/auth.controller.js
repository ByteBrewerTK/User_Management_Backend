import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import Role from "../models/role.model.js";
import OTP from "../models/otp.model.js";
import {
	sendConfirmationOtp,
	sendResetPasswordMail,
} from "../../utils/nodemailer.js";
import PasswordReset from "../models/passwordReset.model.js";

const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000);
};
function generateExpiryTime(minutesFromNow = 5) {
	const date = new Date();
	date.setMinutes(date.getMinutes() + minutesFromNow);

	// Format: YYYY-MM-DD HH:mm:ss
	return date.toISOString().slice(0, 19).replace("T", " ");
}

// Signup (Register User)
export const signup = async (req, res) => {
	const { name, email, password } = req.body;
	if (!(name && email && password)) {
		return res.status(403).json({ message: "All fields are required" });
	}

	try {
		// Check if user already exists
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) {
			return res.status(400).json({ message: "User already exists" });
		}

		// Find the role (default to "User" if not provided)
		const assignedRole = await Role.findOne({
			where: { name: "User" },
		});

		if (!assignedRole) {
			return res.status(400).json({ message: "Role not defined" });
		}

		const avatar = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(
			name
		)}`;

		// Create user
		const user = await User.create({
			name,
			email,
			password,
			avatar,
			roleId: assignedRole.id,
		});

		const otp = generateOTP();

		const otpRecord = await OTP.create({
			userId: user.id,
			type: "user_registration",
			expiresIn: generateExpiryTime(5),
			otp,
		});

		if (!otpRecord) {
			return res.status(500).json({
				message: "Something went wrong while generating OTP",
			});
		}

		await sendConfirmationOtp(email, otp);

		res.status(201).json({
			message: "OTP generated successfully verify the user using otp",
		});
	} catch (err) {
		res.status(500).json({
			message: "Error while signing up",
			error: err.message,
		});
	}
};

export const verifyOtp = async (req, res) => {
	const { email, otp } = req.body;

	try {
		const user = await User.findOne({ where: { email } });
		console.log("user : ", user.id);
		// Find OTP record for the user

		if (!user) {
			return res.status(404).json({
				message: "User not registered",
			});
		}
		const otpRecord = await OTP.findOne({
			where: { userId: user.id, type: "user_registration" },
		});

		if (!otpRecord) {
			return res
				.status(400)
				.json({ message: "OTP not found or expired" });
		}

		// Check if OTP is expired (5 min validity)
		const date = new Date();
		const currentTime = date.toISOString().slice(0, 19).replace("T", " ");

		if (currentTime > otpRecord.expiresIn) {
			return res.status(400).json({ message: "OTP has expired" });
		}

		// Compare OTPs
		if (otp !== otpRecord.otp) {
			return res.status(400).json({ message: "Invalid OTP" });
		}

		// Mark email as verified in User model
		await User.update({ isVerified: true }, { where: { email } });

		// Delete OTP record after verification
		await OTP.destroy({ where: { userId: user.id } });

		res.status(200).json({ message: "OTP verified successfully" });
	} catch (err) {
		res.status(500).json({
			message: "Error verifying OTP",
			error: err.message,
		});
	}
};

export const resendOtp = async (req, res) => {
	const { email, type } = req.body;

	if (!email || !type) {
		return res.status(403).json({
			message: "All fields are required",
		});
	}

	if (type === "update_password") {
		return res.status(401).json({
			message: "Unauthorized access",
		});
	}

	try {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		await OTP.destroy({ where: { userId: user.id, type } });

		const otp = generateOTP();
		console.log(otp);

		const otpRecord = await OTP.create({
			userId: user.id,
			type,
			expiresIn: generateExpiryTime(5),
			otp,
		});

		if (!otpRecord) {
			return res.status(500).json({
				message: "Something went wrong while generating OTP",
			});
		}

		await sendConfirmationOtp(email, otp);

		res.status(201).json({
			message: "OTP generated successfully verify the user using otp",
		});
	} catch (err) {
		console.log(error);
		res.status(500).json({
			message: "Otp sending failed",
			error: err.message,
		});
	}
};

export const resetPasswordRequest = async (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({
			message: "All fields required",
		});
	}

	try {
		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({
				message: "user not found",
			});
		}

		await PasswordReset.destroy({ where: { id: user.id } });

		const confirmationToken = crypto.randomUUID();

		const passwordResetRequest = await PasswordReset.create({
			userId: user.id,
			token: confirmationToken,
			expiresIn: generateExpiryTime(),
		});

		if (!passwordResetRequest) {
			return res.status(500).json({
				message: "Error while creating password reset request",
			});
		}

		const confirmationLink = `https://${process.env.APP_VERIFICATION_URL}/auth/reset-password/${confirmationToken}?e=${email}`;

		console.log(confirmationLink);
		sendResetPasswordMail(email, user.name, confirmationLink);

		return res.status(200).json({
			message: "Reset password mail sent",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Error While Sending Reset Password Request",
			error: err.message,
		});
	}
};

export const verifyResetPassword = async (req, res) => {
	const { email, confirmationToken, password } = req.body;

	try {
		if (!(email && confirmationToken && password)) {
			return res.status(400).json({
				message: "All fields are required",
			});
		}

		const user = await User.findOne({ where: { email } });

		if (!user) {
			return res.status(404).json({
				message: "User not found",
			});
		}

		const request = await PasswordReset.findOne({
			where: { userId: user.id },
		});

		if (!request) {
			return res.status(403).json({
				message: "Invalid request",
			});
		}

		const date = new Date();
		const currentTime = date.toISOString().slice(0, 19).replace("T", " ");

		console.log("currentTime : ", currentTime);
		console.log("ExpiresIn : ", request.expiresIn);

		if (currentTime > request.expiresIn) {
			return res.status(400).json({ message: "Token has expired" });
		}

		if (request.token !== confirmationToken) {
			return res.status(403).json({
				message: "Invalid token",
			});
		}

		const updatedUser = await User.update(
			{ password },
			{ where: { id: user.id } }
		);

		if (!updatedUser) {
			return res.status(500).json({
				message: "Error during reset verification",
			});
		}

		return res.status(200).json({
			message: "Password Successfully Reset",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Error during Verify Reset Password",
			error: err.message,
		});
	}
};

export const updatePasswordRequest = async (req, res) => {
	try {
		const { oldPassword, newPassword } = req.body;
		const user = req.user;

		const isPasswordMatched = await bcrypt.compare(
			oldPassword,
			user.password
		);

		if (!isPasswordMatched) {
			return res.status(401).json({
				message: "Password doesn't matched",
			});
		}

		await OTP.destroy({ where: { userId: user.id } });

		const otp = generateOTP();
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		const otpRecord = await OTP.create({
			userId: user.id,
			type: "update_password",
			expiresIn: generateExpiryTime(5),
			requestToken: hashedPassword,
			otp,
		});

		if (!otpRecord) {
			return res.status(500).json({
				message: "Error while generating otp",
			});
		}

		await sendConfirmationOtp(user.email, otp);

		res.status(200).json({
			message: "Update password, Otp successfully sent",
		});
	} catch (err) {
		res.status(500).json({
			message: "Error update password request",
			error: err.message,
		});
	}
};

export const verifyUpdatePassword = async (req, res) => {
	const { otp } = req.body;

	try {
		if (!otp) {
			return res.status(400).json({
				message: "OTP is required",
			});
		}

		const otpRecord = await OTP.findOne({
			where: { userId: req.user.id, type: "update_password" },
		});

		if (!otpRecord) {
			return res.status(403).json({
				message: "Invalid request",
			});
		}

		const date = new Date();
		const currentTime = date.toISOString().slice(0, 19).replace("T", " ");

		console.log("currentTime : ", currentTime);
		console.log("ExpiresIn : ", otpRecord.expiresIn);

		if (currentTime > otpRecord.expiresIn) {
			return res.status(400).json({ message: "Otp has expired" });
		}

		if (otpRecord.otp !== otp) {
			return res.status(403).json({
				message: "Invalid otp",
			});
		}

		const updatedUser = await User.update(
			{ password: otpRecord.requestToken },
			{ where: { id: req.user.id } }
		);

		if (!updatedUser) {
			return res.status(500).json({
				message: "Error during reset verification",
			});
		}

		return res.status(200).json({
			message: "Password Successfully Updated",
		});
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: "Error during Verify Update Password",
			error: err.message,
		});
	}
};

// Login
export const login = async (req, res) => {
	const { email, password } = req.body;
	console.log(email, password);

	try {
		// Check if user exists
		const user = await User.findOne({
			where: { email },
			include: [{ model: Role }],
		});

		if (!user) return res.status(400).json({ message: "User not found" });

		if (user.isVerified === false) {
			return res.status(401).json({
				message: "User not verified yet",
			});
		}

		// Compare password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });

		// Get user role (single role, not an array)
		const role = user.role ? user.role.name : "User";

		// Generate JWT Token
		const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
			expiresIn: "1h",
		});

		const options = {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "Strict",
			maxAge: 60 * 60 * 1000,
		};

		res.cookie("token", token, options);
		res.header("x-auth-token", token);

		res.status(200).json({ message: "Login successful", token });
	} catch (err) {
		res.status(500).json({
			message: "Error during login",
			error: err.message,
		});
	}
};
