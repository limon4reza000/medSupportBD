"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { UserRole } from "@/types/domain";
import { IAuthUser } from "@/lib/auth/rbac";

export interface IPharmacyProfile {
  id: string;
  tradeName: string;
  drugLicenseNo: string;
  taxId?: string;
  ownerName: string;
  phone: string;
  address: string;
  thana: string;
  district: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  isLocationVerified: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface IAuthContext {
  user: IAuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pharmacy: IPharmacyProfile | null;
  sendOtp: (
    target: string,
    type?: "phone" | "email"
  ) => Promise<{ success: boolean; demoCode?: string; error?: string; cooldownSeconds?: number; isLocked?: boolean }>;
  loginWithOtp: (
    identifier: string,
    otp: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; user?: IAuthUser; remainingAttempts?: number; isLocked?: boolean }>;
  loginWithPassword: (
    identifier: string,
    password: string,
    role?: UserRole
  ) => Promise<{ success: boolean; error?: string; user?: IAuthUser }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IAuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pharmacy, setPharmacy] = useState<IPharmacyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session from /api/auth/me on mount
  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/me", {
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          setToken(data.user.token || null);
          if (data.pharmacy) {
            setPharmacy(data.pharmacy);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to retrieve existing session:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const sendOtp = async (target: string, type: "phone" | "email" = "phone") => {
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", target, type }),
      });
      const data = await res.json();
      return {
        success: data.success,
        demoCode: data.demoCode,
        error: data.error,
        cooldownSeconds: data.cooldownSeconds,
        isLocked: data.isLocked,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to send verification code." };
    }
  };

  const loginWithOtp = async (identifier: string, otp: string, role?: UserRole) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        if (data.user.pharmacyId) {
          refreshUser();
        }
        return { success: true, user: data.user };
      }
      return {
        success: false,
        error: data.error || "Verification failed.",
        remainingAttempts: data.remainingAttempts,
        isLocked: data.isLocked,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Authentication error." };
    }
  };

  const loginWithPassword = async (identifier: string, password: string, role?: UserRole) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(data.token);
        refreshUser();
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || "Login failed." };
    } catch (err: any) {
      return { success: false, error: err.message || "Authentication error." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setToken(null);
      setPharmacy(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        pharmacy,
        sendOtp,
        loginWithOtp,
        loginWithPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
