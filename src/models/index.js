import sequelize from "../config/db.js";
import User from "./user.model.js";
import Role from "./role.model.js";
import Permission from "./permission.model.js";
import UserRole from "./userRole.model.js";
import AuditLog from "./auditLog.model.js";
import Session from "./session.model.js";

// Define Relationships
User.belongsToMany(Role, { through: UserRole, foreignKey: "userId" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "roleId" });

User.hasMany(AuditLog, { foreignKey: "userId" });
AuditLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Session, { foreignKey: "userId" });
Session.belongsTo(User, { foreignKey: "userId" });

const syncDatabase = async () => {
	try {
		await sequelize.sync({ alter: true });
		console.log("Database synchronized");
	} catch (error) {
		console.error("Database sync failed:", error);
	}
};

export {
	sequelize,
	syncDatabase,
	User,
	Role,
	Permission,
	UserRole,
	AuditLog,
	Session,
};
