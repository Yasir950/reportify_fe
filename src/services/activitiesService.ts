// services/masoolService.ts

const API_BASE_URL = "https://jamea-backend.onrender.com/api/v1/jamea";

const moduleName =
  typeof window !== "undefined"
    ? localStorage.getItem("module") || "AMS"
    : "AMS";

export const activitiesService = {
  /**
   * Save activities (POST)
   * @param month number
   * @param year number
   * @param activities string[]
   */
  async saveActivities(month: number, year: number, activities: string[]) {
    const body = {
      module: moduleName,
      month,
      year,
      activities,
    };

    const res = await fetch(`${API_BASE_URL}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return res.json();
  },

  /**
   * Fetch activities (GET)
   * @param month number
   * @param year number
   */
  async getActivities(month: number, year: number) {
    const res = await fetch(
      `${API_BASE_URL}/activities?module=${moduleName}&month=${month}&year=${year}`
    );

    return res.json();
  },
};