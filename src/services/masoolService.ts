// services/masoolService.ts

const API_BASE_URL = "https://jamea-backend.onrender.com/api/v1/jamea";
const module = typeof window !== 'undefined' ? localStorage.getItem("module") || "AMS" : "AMS";

export const masoolService = {
  /**
   * Uploads Masool Excel/CSV data to the server
   * @param file The File object from the input field
   * @param module The module name (defaults to 'AMS')
   */
  uploadMasoolData: async (file: File) => {
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
   uploadMasoolReportData: async (file: File) => {
    // 1. Prepare FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("file", file);

    // 2. Execute the request
    const response = await fetch(`${API_BASE_URL}/masool-report/upload?module=${module}`, {
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
  // service.ts
  fetchMasoolReport: async (month?: string, level?: string, status?: string) => {
    // Build query string dynamically
    const params = new URLSearchParams();
    params.append("module", module);
    if (month) params.append("month", month);
    if (level) params.append("level", level);
    if (status) params.append("status", status);

    const response = await fetch(
      `https://jamea-backend.onrender.com/api/v1/jamea/masool-report?${params.toString()}`
    );

    if (!response.ok) throw new Error("Failed to fetch report");
    const result = await response.json();
    return result.data;
  },
  fetchPreviousHistory: async (masoolId: number) => {
    try {
      const response = await fetch(
        `https://jamea-backend.onrender.com/api/v1/jamea/masool-report/previous?masool_id=${masoolId}`
      );
      const result = await response.json();
      // Adjust this based on your API's actual envelope (e.g., result.data or result)
      return result.success ? result.data : result; 
    } catch (error) {
      console.error("Error fetching history:", error);
      return [];
    }
  }
};