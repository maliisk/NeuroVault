"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Token içindeki base64 veriyi okumak için yardımcı fonksiyon
const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    return null;
  }
};

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("nv_token");
    if (savedToken) {
      const decoded = parseJwt(savedToken);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setToken(savedToken);
        setUser({
          id: decoded.id,
          firstName: decoded.firstName,
          lastName: decoded.lastName,
          email: decoded.sub, // JWT sub alanı e-postayı tutar
        });
      } else {
        logout(); // Token süresi dolmuşsa temizle
      }
    }
  }, []);

  const login = (newToken: string) => {
    const decoded = parseJwt(newToken);
    if (decoded) {
      const userData = {
        id: decoded.id,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
        email: decoded.sub,
      };
      setUser(userData);
      setToken(newToken);
      localStorage.setItem("nv_token", newToken);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("nv_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  return context;
};
