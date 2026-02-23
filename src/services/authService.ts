// services/authService.ts

const API_BASE_URL = "https://jamea-backend.onrender.com/api/v1/jamea";

export const authService = {
  /**
   * Logs in a user and returns the data/token
   * @param credentials {email, password}
   */
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Throwing the error message from the backend
      throw new Error(data.message || "An error occurred during login");
    }

    return data;
  },
};

// Simple TS Interface for the credentials
export type LoginCredentials = {
  email: string;
  password?: string;
};