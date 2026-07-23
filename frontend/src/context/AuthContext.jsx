import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [mustReset, setMustReset] = useState(localStorage.getItem("must_reset") === "true");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [role]);

  useEffect(() => {
    if (email) {
      localStorage.setItem("email", email);
    } else {
      localStorage.removeItem("email");
    }
  }, [email]);

  useEffect(() => {
    localStorage.setItem("must_reset", mustReset ? "true" : "false");
  }, [mustReset]);

  const login = async (inputEmail, password) => {
    const data = await apiRequest("/auth/login", "POST", { email: inputEmail, password });
    
    let userRole = data.role;
    if (!userRole && data.access_token) {
      try {
        const payload = JSON.parse(atob(data.access_token.split(".")[1]));
        userRole = payload.role;
      } catch (e) {
        console.error("Failed to parse JWT payload", e);
      }
    }

    setToken(data.access_token);
    setRole(userRole);
    setEmail(inputEmail);
    
    const needsReset = Boolean(data.must_reset);
    setMustReset(needsReset);

    return { role: userRole, email: inputEmail, mustReset: needsReset };
  };

  const register = async (inputEmail, password) => {
    return await apiRequest("/auth/register", "POST", { email: inputEmail, password });
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setEmail(null);
    setMustReset(false);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("must_reset");
    localStorage.removeItem("theme");
  };

  const updateCredentials = async (newEmail, newPassword) => {
    const data = await apiRequest(
      "/auth/reset-credentials",
      "PUT",
      { new_email: newEmail, new_password: newPassword },
      true
    );

    setToken(data.access_token);
    setEmail(data.email);
    setMustReset(false);

    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        email,
        mustReset,
        isAuthenticated: Boolean(token),
        login,
        register,
        logout,
        updateCredentials,
        setMustReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
