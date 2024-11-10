export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); // Cloudinary preset

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/dah9roj2d/image/upload`, // Cloud name
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message ||
          `Upload failed with status ${response.status}`
      );
    }

    const data = await response.json();

    if (!data.secure_url) {
      throw new Error("Cloudinary response is missing secure_url");
    }

    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error instanceof Error
      ? error
      : new Error("Unknown error occurred during upload");
  }
}
