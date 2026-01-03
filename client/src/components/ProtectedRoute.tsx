import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [key: string]: any;
}

/**
 * ProtectedRoute: Wraps admin pages and ensures user is authenticated
 * and has appropriate role (admin or staff)
 */
export default function ProtectedRoute({ component: Component, ...props }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log("[ProtectedRoute] Check:", { loading, isAuthenticated, user });

    if (loading) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      console.log("[ProtectedRoute] Not authenticated, redirecting to login...");
      window.location.href = getLoginUrl();
      return;
    }

    // Authenticated but no role - redirect to home
    console.log("[ProtectedRoute] User role check:", user?.role);
    if (!user?.role) {
      console.log("[ProtectedRoute] No role, redirecting to home...");
      navigate("/");
      return;
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-500">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Redirecting to login...</p>
      </div>
    );
  }

  if (!user?.role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500">Access Denied: Invalid Role</p>
      </div>
    );
  }

  try {
    return <Component {...props} />;
  } catch (err) {
    console.error("[ProtectedRoute] Component Render Error:", err);
    return (
      <div className="p-8 text-center text-red-500">
        <h1>Render Error</h1>
        <p>{String(err)}</p>
      </div>
    );
  }
}
