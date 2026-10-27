
import api from "./api";

const urlService = {
  // Create a new short URL
  async createUrl(data) {
    const response = await api.post("/urls", data);
    return response.data;
  },

  // Get all URLs of logged-in user
  async getUrls(page = 1, limit = 10) {
    const response = await api.get(
      `/urls?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  // Get single URL by database ID
  async getUrl(id) {
    const response = await api.get(`/urls/${id}`);
    return response.data;
  },

  // Update URL
  async updateUrl(id, data) {
    const response = await api.put(`/urls/${id}`, data);
    return response.data;
  },

  // Delete URL
  async deleteUrl(id) {
    const response = await api.delete(`/urls/${id}`);
    return response.data;
  },

  // Unlock password-protected short URL
  async unlockUrl(shortCode, password) {
    const response = await api.post(
      `/unlock/${shortCode}`,
      {
        password,
      }
    );

    return response.data;
  },

  // Build public short URL
  getShortUrl(shortCode) {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL ||
      "http://localhost:5000";

    return `${backendUrl}/${shortCode}`;
  },

  // Generate QR code
  // IMPORTANT:
  // Backend expects the DATABASE URL ID, not the short code.
  async getQrCode(id) {
    const response = await api.get(
      `/urls/${id}/qr`
    );

    return response.data;
  },
};

export default urlService;
