import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";
import Role from "./role.model.js";

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		dob: {
			type: DataTypes.DATEONLY,
			allowNull: true,
		},
		password: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		roleId: {
			type: DataTypes.UUID,
			foreignKey: true,
		},
		avatar: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		isVerified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
	},
	{
		hooks: {
			beforeCreate: async (user) => {
				if (user.password) {
					user.password = await bcrypt.hash(user.password, 10);
				}
			},
		},
	}
);

User.belongsTo(Role, { foreignKey: "roleId" });

export default User;
