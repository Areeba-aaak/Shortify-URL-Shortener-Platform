
import api from "./api";

const authService = {
  async register(data) {
    const response = await api.post("/auth/register", data);

    const result = response.data;

    // Registration currently returns:
    // {
    //   success: true,
    //   message: "...",
    //   data: {
    //     user: {...}
    //   }
    // }

    if (result.data?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );
    }

    // If backend later returns an access token,
    // this will also save it.
    if (result.data?.accessToken) {
      localStorage.setItem(
        "accessToken",
        result.data.accessToken
      );
    }

    return result;
  },

  async login(data) {
    const response = await api.post("/auth/login", data);

    const result = response.data;

    if (result.data?.accessToken) {
      localStorage.setItem(
        "accessToken",
        result.data.accessToken
      );
    }

    if (result.data?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );
    }

    return result;
  },

  async logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    }
  },

  async refresh() {
    const response = await api.post("/auth/refresh");

    const result = response.data;

    if (result.data?.accessToken) {
      localStorage.setItem(
        "accessToken",
        result.data.accessToken
      );
    }

    if (result.data?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );
    }

    return result;
  },

  async getMe() {
    const response = await api.get("/auth/me");

    const result = response.data;

    if (result.data?.user) {
      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );
    }

    return result;
  }
};

export default authService;
