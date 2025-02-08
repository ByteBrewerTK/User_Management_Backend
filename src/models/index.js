import sequelize from "../config/db.js";
import User from "./user.model.js";
import Role from "./role.model.js";
import Permission from "./permission.model.js";
import UserRole from "./userRole.model.js";
import AuditLog from "./auditLog.model.js";
import Session from "./session.model.js";

// Define Relationships
User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.hasMany(User, { foreignKey: "roleId", as: "users" });

User.hasMany(AuditLog, { foreignKey: "userId" });
AuditLog.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Session, { foreignKey: "userId" });
Session.belongsTo(User, { foreignKey: "userId" });


export {
	sequelize,
	User,
	Role,
	Permission,
	UserRole,
	AuditLog,
	Session,
};
