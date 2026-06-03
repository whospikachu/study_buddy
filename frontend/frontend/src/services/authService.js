import api from "./api";

export const authService = {
  // 1. Send registration data to database
  register: async (username, email, password) => {
    const response = await api.post("api/register/", {
      username,
      email,
      password,
    });
    return response.data;
  },

  // 2. Send login credentials and save the token on success
  login: async (username, password) => {
    const response = await api.post("api/login/", { username, password });
    if (response.data.access) {
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("refresh_token", response.data.refresh);
    }
    return response.data;
  },

  // 3. Clear tokens out of storage on logout
  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
