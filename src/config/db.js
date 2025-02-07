import { Sequelize } from "sequelize";
import "./dotenv.js"; 

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		dialect: "mysql",
		logging: false,
	}
);

try {
	await sequelize.authenticate();
	console.log("Connected to MySQL");
} catch (error) {
	console.error("Unable to connect to MySQL:", error);
}

export default sequelize;
