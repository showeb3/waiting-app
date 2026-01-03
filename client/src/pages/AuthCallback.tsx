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
                // Pass the request to the backend via the proxy
                // The backend will set the HttpOnly cookie in the response
                const response = await fetch(`/api/oauth/callback?code=${code}&state=${state}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json" // Prefer JSON if backend supports it, but standard is redirect
                    }
                });

                // The backend returns a redirect to / (302). 
                // Fetch API follows redirects automatically.
                // If successful, we should land on a page (HTML) or get a success JSON.
                // We just check if the final URL or status indicates success.

                if (response.ok) {
                    // We assume cookie is set. Redirect to admin.
                    navigate("/admin/demo");
                    toast.success("Login successful");
                } else {
                    const text = await response.text();
                    console.error("Login failed response:", text);
                    setError("Login verification failed on server.");
                }
            } catch (err) {
                console.error("Login network error:", err);
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
