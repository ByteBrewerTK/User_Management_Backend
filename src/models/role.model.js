// models/Role.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Role = sequelize.define(
	"Role",
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		tableName: "Roles",
	}
);

export default Role;
