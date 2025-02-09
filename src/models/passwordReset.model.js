import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
const PasswordReset = sequelize.define(
	"PasswordReset",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			foreignKey: true,
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
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

export default PasswordReset;
