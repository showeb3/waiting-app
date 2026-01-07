import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
    const [, navigate] = useLocation();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            // Parse query params manually since wouter doesn't provide them easily in this version
            const searchParams = new URLSearchParams(window.location.search);
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            if (!code || !state) {
                setError("Invalid login response: Missing code or state");
                return;
            }

            try {
                console.log("[AuthCallback] Starting authentication with code:", code?.substring(0, 10) + "...");

                // Construct the callback URL using environment variable
                // Use relative path for same-origin request
                const callbackUrl = `/api/oauth/callback?code=${code}&state=${state}`;
                console.log("[AuthCallback] Calling:", callbackUrl);

                // Pass the request to the backend directly
                const response = await fetch(callbackUrl, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });

                console.log("[AuthCallback] Response status:", response.status);

                if (response.ok) {
                    const data = await response.json();
                    console.log("[AuthCallback] Success:", data);

                    // Store token if present
                    if (data.token) {
                        localStorage.setItem("session_token", data.token);
                        console.log("[AuthCallback] Token stored in localStorage");
                    }

                    // Navigate to admin dashboard
                    navigate("/admin/demo");
                    toast.success("Login successful");
                } else {
                    const text = await response.text();
                    console.error("[AuthCallback] Login failed response:", text);
                    setError(`Login verification failed: ${response.status}`);
                }
            } catch (err) {
                console.error("[AuthCallback] Network error:", err);
                setError("Network error during login verification.");
            }
        };

        handleCallback();
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <h1 className="text-red-600 font-bold text-xl mb-4">Login Failed</h1>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <a href="/" className="text-blue-600 hover:underline">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying Login...</h2>
            <p className="text-gray-500 mt-2">Please wait while we connect to the server.</p>
        </div>
    );
}
