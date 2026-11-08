import { io } from "socket.io-client";
import { getToken, getApiBaseUrl } from "./api";

// Resolves the socket URL: same server as the API, without "/api" at the end
function getSocketUrl() {
  return getApiBaseUrl().replace(/\/api\/?$/, "");
}

// Singleton socket — one persistent connection for the whole app lifetime.
let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: (callback) => callback({ token: getToken() }),
    });
  }
  return socket;
}

// Call this on logout so the next login gets a fresh authenticated connection.
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
