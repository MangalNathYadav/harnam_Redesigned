export const cloudinaryConfig = {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    uploadPreset: "ml_default", // You might need to create this in Cloudinary dashboard settings
};

/**
 * Uploads a base64 or file to Cloudinary via unsigned upload
 * This is preferred for client-side uploads without exposing secret
 */
export async function uploadToCloudinary(file: File | string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryConfig.uploadPreset);
    formData.append("cloud_name", cloudinaryConfig.cloudName!);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Cloudinary upload failed");
    }

    const data = await response.json();
    return data.secure_url;
}
