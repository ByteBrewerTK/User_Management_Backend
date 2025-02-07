import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";
import userRoutes from "./routes/user.routes.js"; // User routes
import sequelize from "./config/db.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/users", userRoutes);

// Test Database Connection
sequelize
	.sync({ force: false })
	.then(() => console.log("Database synced successfully"))
	.catch((err) => console.error("Error syncing database:", err));

db.authenticate()
	.then(() => console.log("Database Connected!"))
	.catch((err) => console.error("Error connecting to DB:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
