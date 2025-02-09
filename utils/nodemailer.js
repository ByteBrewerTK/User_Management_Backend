import nodemailer from "nodemailer";
import otpTemplate from "../template/otpTemplate.js";
import resetPasswordTemplate from "../template/resetPasswordTemplate.js";
export const transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS,
	},
});

const sendMail = (email, template, subject) => {
	const mailOptions = {
		from: `Aegix ${process.env.MAIL_FROM}`,
		to: email,
		subject: subject,
		priority: "high",
		headers: {
			"X-Priority": "1",
			"X-MSMail-Priority": "High",
			"X-Mailer": "Nodemailer",
			"Message-ID": `<${Date.now()}@${process.env.DOMAIN_NAME}>`,
		},
		html: template,
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error);
			return;
		}
		console.log("Confirmation email sent:", info.response);
	});
};
export const sendConfirmationOtp = async (email, otpCode) => {
	// const template = otpTemplate(otpCode);
	// sendMail(email, template, "One-Time Password Inside");
};

export const sendResetPasswordMail = (email, fullName, confirmationLink) => {
	const template = resetPasswordTemplate(
		fullName.split(" ")[0],
		confirmationLink
	);

	sendMail(email, template, "Confirm your registration");
};
export const sendWelcomeEmailAdmin = (name, email, password) => {
	const template = sendWelcomeEmailAdmin(name.split(" ")[0], email, password);

	sendMail(email, template, "Confirm your registration");
};
