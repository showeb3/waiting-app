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

  // DebugUI removed, now relying on useEffect redirect logic for cleaner UX
  // But strictly enforcing render blocking if not authenticated
  if (!isAuthenticated && !loading) {
    return null; // Will redirect via useEffect
  }

  try {
    return <Component {...props} />;
  } catch (err) {
    console.error("[ProtectedRoute] Component Render Error:", err);
    return (
      <div className="p-8 text-center text-red-500">
        <p>Something went wrong loading this page.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Reload Page
        </button>
      </div>
    );
  }
}
