import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Clock, CheckCircle2, XCircle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const sb = supabase as any;

export function DeliveryPendingPage() {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const { data: application } = useQuery({
    queryKey: ["delivery-application", user?.id],
    enabled: !!user,
    staleTime: 30_000,
    queryFn: async () => {
      const { data } = await sb
        .from("onboarding_applications")
        .select("status, created_at, data")
        .eq("user_id", user!.id)
        .eq("type", "delivery")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      return data;
    },
  });

  const status = application?.status ?? "pending";

  const handleLogout = async () => {
    await sb.auth.signOut();
    navigate("/login");
  };

  return (
    <MobileLayout navType="delivery">
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-6">

        {status === "rejected" ? (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Application Rejected</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Unfortunately your delivery partner application was not approved at this time.
                Please contact support for more information.
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-10 h-10 text-amber-500" strokeWidth={1.5} />
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-30" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">Under Review</h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Your delivery partner application is being reviewed by our admin team.
                This usually takes a few hours.
              </p>
            </div>
          </>
        )}

        {/* What happens next */}
        <div className="w-full bg-muted/50 rounded-2xl p-4 text-left space-y-2">
          <p className="text-xs font-bold text-foreground">What happens next?</p>
          {[
            { icon: "📋", text: "Admin reviews your documents and details" },
            { icon: "📱", text: "You'll be notified once approved" },
            { icon: "🛵", text: "Start accepting delivery assignments" },
            { icon: "💰", text: "Weekly payouts to your UPI" },
          ].map(({ icon, text }, i) => (
            <div key={i} className="flex items-center gap-2">
              <span>{icon}</span>
              <p className="text-xs text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </MobileLayout>
  );
}