
import api from "./api";

const analyticsService = {
  async getSummary(urlId) {
    const response = await api.get(
      `/analytics/${urlId}`
    );

    return response.data;
  },

  async getClicks(urlId, page = 1, limit = 50) {
    const response = await api.get(
      `/analytics/${urlId}/clicks?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  async getDashboardAnalytics() {
    const response = await api.get(
      "/analytics/dashboard"
    );

    return response.data;
  }
};

export default analyticsService;
