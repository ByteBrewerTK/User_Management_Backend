import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

const OTP = sequelize.define(
	"OTP",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: User,
				key: "id",
			},
			onDelete: "CASCADE",
		},
		otp: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM(
				"password_reset",
				"user_registration",
				"update_password"
			),
			allowNull: false,
		},
		requestToken: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		expiresIn: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

export default OTP;
