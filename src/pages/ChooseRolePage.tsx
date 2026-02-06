import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShoppingBag, Briefcase, Truck, Shield, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";

export function ChooseRolePage() {
  const { setInitialRole, refresh } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const labels = {
    title: language === "en" ? "Choose Your Role" : "మీ పాత్రను ఎంచుకోండి",
    subtitle: language === "en" ? "How would you like to use the app?" : "మీరు యాప్‌ను ఎలా ఉపయోగించాలనుకుంటున్నారు?",
    customer: language === "en" ? "Customer" : "కస్టమర్",
    merchant: language === "en" ? "Merchant" : "వ్యాపారి",
    delivery: language === "en" ? "Delivery" : "డెలివరీ",
    admin: language === "en" ? "Admin" : "అడ్మిన్",
    continueBtn: language === "en" ? "Continue" : "కొనసాగించు",
    customerDesc: language === "en" ? "Order from local shops" : "స్థానిక దుకాణాల నుండి ఆర్డర్ చేయండి",
    merchantDesc: language === "en" ? "Sell your products" : "మీ ఉత్పత్తులను అమ్మండి",
    deliveryDesc: language === "en" ? "Deliver orders" : "ఆర్డర్లను డెలివరీ చేయండి",
    adminDesc: language === "en" ? "Manage the platform" : "ప్లాట్‌ఫారమ్‌ను నిర్వహించండి",
  };

  const roles: { role: UserRole; label: string; desc: string; icon: typeof ShoppingBag }[] = [
    { role: "customer", label: labels.customer, desc: labels.customerDesc, icon: ShoppingBag },
    { role: "merchant", label: labels.merchant, desc: labels.merchantDesc, icon: Briefcase },
    { role: "delivery", label: labels.delivery, desc: labels.deliveryDesc, icon: Truck },
    { role: "admin", label: labels.admin, desc: labels.adminDesc, icon: Shield },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      const { error } = await setInitialRole(selectedRole);
      if (error) {
        toast.error(error.message);
        return;
      }
      await refresh();
      const { route } = await postAuthRedirect();
      navigate(route, { replace: true });
    } catch (err: any) {
      toast.error(language === "en" ? "Something went wrong" : "ఏదో తప్పు జరిగింది");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <h1 className="text-2xl font-bold text-foreground text-center">{labels.title}</h1>
      <p className="text-muted-foreground text-center mt-2 text-sm">{labels.subtitle}</p>

      <div className="w-full max-w-sm mt-8 space-y-3">
        {roles.map(({ role, label, desc, icon: Icon }) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              selectedRole === role
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                selectedRole === role ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <Icon className={`w-6 h-6 ${selectedRole === role ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div>
              <p className={`font-medium ${selectedRole === role ? "text-primary" : "text-foreground"}`}>{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-sm mt-6">
        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedRole || isSubmitting}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {labels.continueBtn}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
