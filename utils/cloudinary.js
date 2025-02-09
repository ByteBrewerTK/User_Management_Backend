import { v2 as cloudinary } from "cloudinary";
import path from "path";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload to Cloudinary, only allowing images
const uploadCloudinary = (fileStream, mimetype) => {
	return new Promise((resolve, reject) => {
		// Check if file mimetype is image
		if (!mimetype.startsWith("image/")) {
			return reject(new Error("Only image files are allowed"));
		}

		const uploadStream = cloudinary.uploader.upload_stream(
			{ resource_type: "auto" },
			(error, result) => {
				if (error) {
					console.error("Cloudinary upload error:", error);
					reject(new Error("Failed to upload to Cloudinary"));
				} else if (!result || !result.url) {
					console.error("Missing Cloudinary result URL");
					reject(new Error("Cloudinary URL is missing"));
				} else {
					console.log("Upload successful:", result);
					resolve(result);
				}
			}
		);

		fileStream.pipe(uploadStream);

		fileStream.on("end", () => console.log("File stream ended"));
		fileStream.on("close", () => console.log("File stream closed"));
		fileStream.on("error", (err) =>
			console.error("File stream error:", err)
		);
	});
};

// Function to delete a file from Cloudinary by URL
const deleteCloudinary = async (fileUrl) => {
	try {
		// Extract public ID from file URL
		const publicId = path.basename(fileUrl, path.extname(fileUrl));
		console.log("Deleting file:", publicId);

		await cloudinary.uploader.destroy(publicId);
		console.log("File deleted successfully");
	} catch (error) {
		console.error("File deletion failed:", error);
	}
};

export { uploadCloudinary, deleteCloudinary };
