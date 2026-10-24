"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, LoginResult } from "@/types/auth";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface LoginOptions {
  email?: string;
  username?: string;
  password: string;
  remember?: boolean;
  rememberMe?: boolean;
  device_name?: string;
  twoFactorCode?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (optionsOrEmail: LoginOptions | string, password?: string, rememberMe?: boolean, twoFactorCode?: string) => Promise<LoginResult>;
  verifyTwoFactor: (code: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (...permissions: string[]) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load active session from browser storage on boot
  useEffect(() => {
    const savedToken = localStorage.getItem("oms_token") || sessionStorage.getItem("oms_token");
    const savedUser = localStorage.getItem("oms_user") || sessionStorage.getItem("oms_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("oms_user");
        sessionStorage.removeItem("oms_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    optionsOrEmail: LoginOptions | string,
    rawPassword?: string,
    rawRemember = false,
    rawTwoFactorCode?: string
  ): Promise<LoginResult> => {
    let email = "";
    let username = "";
    let password = "";
    let remember = false;
    let twoFactorCode: string | undefined = undefined;
    let deviceName = "Web Management Console";

    if (typeof optionsOrEmail === "object") {
      email = optionsOrEmail.email || "";
      username = optionsOrEmail.username || optionsOrEmail.email || "";
      password = optionsOrEmail.password;
      remember = optionsOrEmail.remember ?? optionsOrEmail.rememberMe ?? false;
      twoFactorCode = optionsOrEmail.twoFactorCode;
      deviceName = optionsOrEmail.device_name || "Web Management Console";
    } else {
      email = optionsOrEmail;
      username = optionsOrEmail;
      password = rawPassword || "";
      remember = rawRemember;
      twoFactorCode = rawTwoFactorCode;
    }

    const deviceUuid = (typeof window !== "undefined" && localStorage.getItem("oms_device_uuid")) || "web-terminal-001";
    
    const payload = {
      email: email || username,
      username: username || email,
      password,
      device_uuid: deviceUuid,
      device_name: deviceName,
      two_factor_code: twoFactorCode,
    };

    const data = await apiClient.post<LoginResult>(API_ENDPOINTS.AUTH.LOGIN, payload);

    if (data.token && data.user) {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("oms_token", data.token);
      storage.setItem("oms_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  const verifyTwoFactor = async (code: string): Promise<LoginResult> => {
    const deviceUuid = (typeof window !== "undefined" && localStorage.getItem("oms_device_uuid")) || "web-terminal-001";
    const data = await apiClient.post<LoginResult>(API_ENDPOINTS.AUTH.TWO_FACTOR_VERIFY, {
      code,
      device_uuid: deviceUuid,
    });

    if (data.token && data.user) {
      localStorage.setItem("oms_token", data.token);
      localStorage.setItem("oms_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  };

  const logout = async () => {
    try {
      if (token) {
        await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (err) {
      console.warn("Logout backend call failed, clearing local session", err);
    } finally {
      localStorage.removeItem("oms_token");
      sessionStorage.removeItem("oms_token");
      localStorage.removeItem("oms_user");
      sessionStorage.removeItem("oms_user");
      setToken(null);
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const data = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
      setUser(data);
      const storage = localStorage.getItem("oms_token") ? localStorage : sessionStorage;
      storage.setItem("oms_user", JSON.stringify(data));
    } catch (err) {
      console.warn("Failed to refresh user profile", err);
    }
  };

  const hasPermission = (...permissions: string[]): boolean => {
    if (!user) return false;
    if (user.roles?.includes("owner") || user.roles?.includes("admin")) return true;
    if (!user.permissions || !Array.isArray(user.permissions)) return false;
    return permissions.some((p) => user.permissions.includes(p));
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    if (!user.roles || !Array.isArray(user.roles)) return false;
    return roles.some((r) => user.roles.includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        loading: isLoading,
        isAuthenticated: !!token && !!user,
        login,
        verifyTwoFactor,
        logout,
        refreshUser,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
