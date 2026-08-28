// src/services/cloudinary.js
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "hridesh99!");

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/draowpiml/image/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (data.secure_url) {
      return { success: true, url: data.secure_url };
    }
    throw new Error("Upload failed");
  } catch (error) {
    return { success: false, error: error.message };
  }
};