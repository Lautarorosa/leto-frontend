"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi, clearAuth } from "./useApi";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isOnboarded, setIsOnboarded]         = useState(false);
  const { call } = useApi();
  const router   = useRouter();

  // Verify auth by hitting /me — cookie is sent automatically via credentials: include
  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setIsAuthenticated(true);
        setIsOnboarded(data.is_onboarded ?? true);
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    // Call backend to clear the HttpOnly cookie
    await fetch(`${API_BASE}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    clearAuth();
    setIsAuthenticated(false);
    router.push("/");
  }, [router]);

  return { isAuthenticated, isOnboarded, logout, checkAuth };
}
