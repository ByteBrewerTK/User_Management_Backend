// models/User.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Role from "./role.model.js";

const User = sequelize.define("User", {
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
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	roleId: {
		type: DataTypes.UUID,
		foreignKey : true,
	},
});

User.belongsTo(Role, { foreignKey: "roleId" });

export default User;
