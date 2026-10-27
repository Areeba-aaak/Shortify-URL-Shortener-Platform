
import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// ================================
// REQUEST INTERCEPTOR
// ================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ================================
// TOKEN REFRESH VARIABLES
// ================================

let isRefreshing = false;
let refreshSubscribers = [];

// Add request to waiting list
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Give new token to waiting requests
const onRefreshed = (token) => {
  refreshSubscribers.forEach(
    (callback) => callback(token)
  );

  refreshSubscribers = [];
};

// ================================
// RESPONSE INTERCEPTOR
// ================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest =
      error.config;

    // Print useful information in browser console
    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    // Do not refresh token for authentication endpoints
    const isAuthRequest =
      originalRequest?.url?.includes(
        "/auth/login"
      ) ||
      originalRequest?.url?.includes(
        "/auth/register"
      ) ||
      originalRequest?.url?.includes(
        "/auth/refresh"
      );

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      // Another request is already refreshing
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization =
              `Bearer ${token}`;

            resolve(
              api(originalRequest)
            );
          });
        });
      }

      isRefreshing = true;

      try {
        const response =
          await axios.post(
            `${API_URL}/auth/refresh`,
            {},
            {
              withCredentials: true
            }
          );

        // Backend response:
        //
        // {
        //   success: true,
        //   data: {
        //     accessToken: "...",
        //     user: {...}
        //   }
        // }

        const newToken =
          response.data?.data?.accessToken;

        if (!newToken) {
          throw new Error(
            "Refresh token response did not contain an access token."
          );
        }

        localStorage.setItem(
          "accessToken",
          newToken
        );

        onRefreshed(newToken);

        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.error(
          "Token refresh failed:",
          refreshError.response?.data ||
          refreshError.message
        );

        localStorage.removeItem(
          "accessToken"
        );

        localStorage.removeItem(
          "user"
        );

        refreshSubscribers = [];

        return Promise.reject(
          refreshError
        );

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
