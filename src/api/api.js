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

// Automatically resolve API URL: if accessed from a phone/LAN IP, replace "localhost" with that IP
export function getApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
  if (typeof window !== "undefined" && window.location.hostname && window.location.hostname !== "localhost") {
    return envUrl.replace("localhost", window.location.hostname);
  }
  return envUrl;
}

// One axios instance with the base URL dynamically set per request
const instance = axios.create();

// Runs before every request: sets baseURL and adds the token if we have one
instance.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
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
