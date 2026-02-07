import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { createOnboardingApplication } from "@/hooks/useOnboardingApplication";
import { Briefcase, Truck, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ApplyPage() {
  const { user, role } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isMerchant = role === "merchant";
  const isDelivery = role === "delivery";

  const labels = {
    title: isMerchant
      ? language === "en" ? "Apply as Merchant" : "వ్యాపారిగా దరఖాస్తు చేయండి"
      : language === "en" ? "Apply as Delivery Partner" : "డెలివరీ పార్ట్‌నర్‌గా దరఖాస్తు చేయండి",
    description: isMerchant
      ? language === "en"
        ? "Submit your application to start selling on the platform. An admin will review and approve your request."
        : "ప్లాట్‌ఫారమ్‌లో అమ్మకం ప్రారంభించడానికి మీ దరఖాస్తును సమర్పించండి. అడ్మిన్ సమీక్షించి ఆమోదిస్తారు."
      : language === "en"
        ? "Submit your application to become a delivery partner. An admin will review and approve your request."
        : "డెలివరీ పార్ట్‌నర్ కావడానికి మీ దరఖాస్తును సమర్పించండి. అడ్మిన్ సమీక్షించి ఆమోదిస్తారు.",
    submit: language === "en" ? "Submit Application" : "దరఖాస్తు సమర్పించండి",
  };

  const handleSubmit = async () => {
    if (!user || !role) return;
    setIsSubmitting(true);
    try {
      const { error } = await createOnboardingApplication(user.id, role);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(language === "en" ? "Application submitted!" : "దరఖాస్తు సమర్పించబడింది!");
      navigate(isMerchant ? "/merchant/pending" : "/delivery/pending", { replace: true });
    } catch (err: any) {
      toast.error(language === "en" ? "Something went wrong" : "ఏదో తప్పు జరిగింది");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        {isMerchant ? (
          <Briefcase className="w-12 h-12 text-primary" />
        ) : (
          <Truck className="w-12 h-12 text-primary" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-foreground text-center mb-2">{labels.title}</h1>
      <p className="text-muted-foreground text-center text-sm max-w-xs mb-8">{labels.description}</p>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full max-w-sm gap-2"
        size="lg"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Send className="w-5 h-5" />
            {labels.submit}
          </>
        )}
      </Button>
    </div>
  );
}
