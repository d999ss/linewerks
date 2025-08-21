import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await exchangeCodeForSessionToken();
        navigate("/dashboard");
      } catch (error) {
        console.error("Auth callback error:", error);
        navigate("/");
      }
    };

    handleCallback();
  }, [exchangeCodeForSessionToken, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin mb-4">
          <Loader2 className="w-12 h-12 text-orange-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          Completing your login...
        </h2>
        <p className="text-slate-300">
          You'll be redirected to your dashboard momentarily.
        </p>
      </div>
    </div>
  );
}
