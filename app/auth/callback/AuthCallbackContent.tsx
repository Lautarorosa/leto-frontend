"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export default function AuthCallbackContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const ran          = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const tempCode = searchParams.get("code");
    const errorMsg = searchParams.get("error");

    if (errorMsg) {
      router.replace(`/?error=${encodeURIComponent(errorMsg)}`);
      return;
    }

    if (!tempCode) {
      router.replace("/?error=missing_code");
      return;
    }

    // Exchange one-time code for HttpOnly cookie (set by backend, no token in JS)
    fetch(`${API_BASE}/api/v1/auth/token?code=${encodeURIComponent(tempCode)}`, {
      credentials: "include",   // A04: cookie is set server-side
    })
      .then((res) => {
        if (!res.ok) throw new Error("auth_failed");
        return res.json();
      })
      .then((data) => {
        // Token is now in HttpOnly cookie — JS never touches it
        if (data.is_onboarded) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      })
      .catch(() => {
        router.replace("/?error=auth_failed");
      });
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-sm">Autenticando...</p>
    </div>
  );
}
