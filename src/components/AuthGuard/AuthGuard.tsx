"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { dashboardPathForRole, getStoredRole } from "@/lib/userService";
import { isDemoMode } from "@/lib/geolocation";
import type { AppRole } from "@/types";

interface AuthGuardProps {
  role: AppRole;
  children: ReactNode;
}

export default function AuthGuard({ role, children }: AuthGuardProps) {
  const { user, role: userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (isDemoMode()) {
      const demoRole = getStoredRole() ?? "student";
      if (demoRole !== role) {
        router.replace(dashboardPathForRole(demoRole));
      }
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (userRole && userRole !== role) {
      router.replace(dashboardPathForRole(userRole));
    }
  }, [loading, user, userRole, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-600">Verifying your session…</p>
        </div>
      </div>
    );
  }

  const demoActive = isDemoMode();
  if (demoActive) {
    const demoRole = getStoredRole() ?? "student";
    if (demoRole !== role) return null;
    return <>{children}</>;
  }

  if (!user) return null;
  if (userRole && userRole !== role) return null;

  return <>{children}</>;
}
