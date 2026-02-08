import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const USER_MODE_KEY = "mana-angadi-user-mode";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Try to exchange code if present in URL
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
        }

        // Verify we have a session
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          setError(sessionError.message);
          return;
        }

        if (!data.session) {
          // No session yet — wait for onAuthStateChange to pick it up
          // (magic link hash fragments are handled automatically by Supabase)
          const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              subscription.unsubscribe();
              localStorage.setItem(USER_MODE_KEY, localStorage.getItem(USER_MODE_KEY) || "customer");
              navigate("/home", { replace: true });
            }
          });

          // Timeout fallback
          setTimeout(() => {
            subscription.unsubscribe();
            setError("Login timed out. Please try again.");
          }, 10000);
          return;
        }

        // Session exists — default to customer mode and go home
        if (!localStorage.getItem(USER_MODE_KEY)) {
          localStorage.setItem(USER_MODE_KEY, "customer");
        }
        navigate("/home", { replace: true });
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6 gap-4">
        <p className="text-destructive text-sm text-center">{error}</p>
        <button
          onClick={() => navigate("/login", { replace: true })}
          className="btn-accent px-6"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
