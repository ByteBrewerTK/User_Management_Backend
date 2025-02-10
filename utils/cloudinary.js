import { v2 as cloudinary } from "cloudinary";
import { existsSync, unlinkSync } from "fs";
import path from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function to delete local file
const deleteLocalFile = async (filePath) => {
	try {
		console.log("Attempting to delete file at path:", filePath);

		// Check if file exists before attempting deletion
		if (!existsSync(filePath)) {
			console.log("File does not exist at path:", filePath);
			return;
		}

		await unlinkSync(filePath);
		console.log("Successfully deleted file at path:", filePath);
	} catch (error) {
		console.error("Error deleting local file:", {
			path: filePath,
			error: error.message,
			stack: error.stack,
		});
	}
};

const uploadCloudinary = async (filePath, filename) => {
	try {
		const result = await cloudinary.uploader.upload(filePath, {
			public_id: filename,
			resource_type: "auto",
		});

		// Clean up local file after successful upload
		await deleteLocalFile(filePath);

		return result;
	} catch (error) {
		// Clean up local file even if upload fails
		await deleteLocalFile(filePath);
		throw new Error("Error uploading to Cloudinary: " + error.message);
	}
};

const deleteCloudinary = async (fileUrl) => {
	try {
		const publicId = path.basename(fileUrl, path.extname(fileUrl));
		console.log("Deleting file:", publicId);
		const result = await cloudinary.uploader.destroy(publicId);
		console.log("File deleted successfully");
		return result;
	} catch (error) {
		console.error("File deletion failed:", error);
		throw error;
	}
};

export { uploadCloudinary, deleteCloudinary };
