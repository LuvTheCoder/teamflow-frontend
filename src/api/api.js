import axios from "axios";

export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

// One axios instance with the base URL already set
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Runs before every request: adds the token if we have one
instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage: api("/teams")  or  api("/teams", "POST", { name: "Dev Team" })
export async function api(path, method = "GET", body) {
  try {
    const response = await instance({ url: path, method, data: body });
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message || "Cannot reach the server. Is the backend running?";
    throw new Error(message);
  }
}