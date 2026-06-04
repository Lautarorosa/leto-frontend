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
    async function callApi<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          credentials: "include",
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

        if (!res.ok) {
          setError(`Error ${res.status}`);
          return null;
        }

        return await res.json() as T;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Error de red");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router]
  ) as <T = unknown>(endpoint: string, options?: RequestInit) => Promise<T | null>;

  return { call, loading, error };
}
