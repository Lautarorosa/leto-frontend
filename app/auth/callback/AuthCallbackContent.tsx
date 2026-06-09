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

    // Exchange one-time code via our own Next.js API route (same domain).
    // This proxy re-issues the HttpOnly cookie on the Vercel domain so that
    // Next.js middleware can read it. The JWT never touches client-side JS.
    fetch(`/api/auth/exchange?code=${encodeURIComponent(tempCode)}`)
      .then((res) => {
        if (!res.ok) throw new Error("auth_failed");
        return res.json();
      })
      .then((data) => {
        // Use full-page navigation so the HttpOnly cookie set by the exchange
        // response is guaranteed to be sent on the very next server request.
        // router.replace() is client-side and can race with cookie processing.
        window.location.href = data.is_onboarded ? "/dashboard" : "/onboarding";
      })
      .catch(() => {
        window.location.href = "/?error=auth_failed";
      });
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500 text-sm">Autenticando...</p>
    </div>
  );
}
