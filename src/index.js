import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import authRoutes from "./routes/auth.routes.js";
import sequelize from "./config/db.js";


const app = express();

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/users", userRoutes);

sequelize
	.sync({ alter: false })
	.then(() => console.log("Database tables synced"))
	.catch((err) => console.error("Error syncing database:", err));

db.authenticate()
	.then(() => console.log("Database Connected!"))
	.catch((err) => console.error("Error connecting to DB:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
