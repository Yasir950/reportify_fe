// services/masoolService.ts

const API_BASE_URL = "https://jamea-backend.onrender.com/api/v1/jamea";

export const masoolService = {
  /**
   * Uploads Masool Excel/CSV data to the server
   * @param file The File object from the input field
   * @param module The module name (defaults to 'AMS')
   */
  uploadMasoolData: async (file: File, module: string = "AMS") => {
    // 1. Prepare FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("file", file);

    // 2. Execute the request
    const response = await fetch(`${API_BASE_URL}/masool/upload?module=${module}`, {
      method: "POST",
      // Note: Do NOT set Content-Type header manually when using FormData.
      // The browser will automatically set it with the correct boundary.
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload file to the server");
    }

    return data;
  },
};