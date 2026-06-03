"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function clearAuth() {
  // Cookie is HttpOnly — cleared server-side via /auth/logout
  // Clear any legacy localStorage remnants
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const router = useRouter();

  const call = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          credentials: "include",   // A04: send HttpOnly cookie automatically
          headers: {
            "Content-Type": "application/json",
            ...options.headers,
          },
        });

        if (res.status === 401 || res.status === 403) {
          clearAuth();
          router.push("/");
          return null;
        }

        return res;
      } catch (err: any) {
        setError(err.message || "Error de red");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { call, loading, error };
}
