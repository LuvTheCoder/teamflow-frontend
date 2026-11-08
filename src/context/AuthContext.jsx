import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, saveToken, removeToken } from "../api/api";
import { disconnectSocket } from "../api/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app opens, check if a saved token is still valid
  useEffect(() => {
    async function loadUser() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        const data = await api("/auth/me");
        setUser(data.data.user);
      } catch (error) {
        removeToken();
      }

      setLoading(false);
    }

    loadUser();
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", "POST", { email, password });
    saveToken(data.data.token);
    setUser(data.data.user);
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", "POST", { name, email, password });
    saveToken(data.data.token);
    setUser(data.data.user);
  }

  function logout() {
    removeToken();
    disconnectSocket(); // Drop the socket so the next login gets a fresh authed connection
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Any component can call useAuth() to get the user and the functions
export function useAuth() {
  return useContext(AuthContext);
}