"use client";

import { useAuth } from "@/lib/providers/authProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/account/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Please log in to access this page.
            </p>
            <button
              onClick={() => router.push("/account/login")}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
