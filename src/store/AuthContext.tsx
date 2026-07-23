import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { Role } from "../types";
import apiClient from "../lib/apiClient";

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
  firstLogin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isFirstLogin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateRoleSimulation: (role: Role) => void;
  updateProfile: (name: string) => Promise<void>;
  apiFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  dismissWelcome: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    // Check for token in localStorage and URL (for embedding)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    const storedToken = urlToken || localStorage.getItem("grc_token");

    if (storedToken) {
      // Very basic simulation of JWT decode and token verification with our backend
      apiClient.get("/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          const data = res.data;
          setToken(storedToken);
          setUser(data.user);
          // Check if this is first login
          const hasSeenWelcome = localStorage.getItem('grc_welcome_seen');
          if (!hasSeenWelcome && data.user.firstLogin !== false) {
            setIsFirstLogin(true);
          }
          if (urlToken) {
            localStorage.setItem("grc_token", storedToken);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );
          }
        })
        .catch((e) => {
          console.error(e);
          localStorage.removeItem("grc_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("grc_token", newToken);
    setToken(newToken);
    setUser(newUser);
    // Check if this is first login
    const hasSeenWelcome = localStorage.getItem('grc_welcome_seen');
    if (!hasSeenWelcome && newUser.firstLogin !== false) {
      setIsFirstLogin(true);
    }
  };

  const dismissWelcome = () => {
    localStorage.setItem('grc_welcome_seen', 'true');
    setIsFirstLogin(false);
  };

  const logout = () => {
    localStorage.removeItem("grc_token");
    setToken(null);
    setUser(null);
  };

  const updateRoleSimulation = (role: Role) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  const updateProfile = async (name: string) => {
    if (!token) return;
    const res = await apiClient.put("/auth/profile", { name }, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (res.status === 200) {
      const data = res.data;
      localStorage.setItem("grc_token", data.token);
      setToken(data.token);
      setUser(data.user);
    } else {
      throw new Error("Failed to update profile");
    }
  };

  const apiFetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    let currentToken = token;

    // Fallback to localStorage if the state token isn't immediately available but exists
    if (!currentToken) {
      currentToken = localStorage.getItem("grc_token");
    }

    const headers = new Headers(init?.headers);
    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }

    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      // Automatically handle token expiration by logging out
      logout();
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        isFirstLogin,
        login,
        logout,
        updateRoleSimulation,
        updateProfile,
        apiFetch,
        dismissWelcome,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
