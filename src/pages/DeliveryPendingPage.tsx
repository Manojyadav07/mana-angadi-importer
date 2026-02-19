import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useOnboardingApplication } from "@/hooks/useOnboardingApplication";
import { Clock, LogOut, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DeliveryPendingPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const { data: application, refetch } = useOnboardingApplication(user?.id);

  const isRejected = application?.status === "rejected";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.data?.status === "approved") {
      navigate("/delivery/orders", { replace: true });
    }
  };

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          {isRejected ? (
            <Truck className="w-12 h-12 text-destructive" />
          ) : (
            <Clock className="w-12 h-12 text-primary animate-pulse" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-2">
          {isRejected
            ? language === "en" ? "Application Rejected" : "దరఖాస్తు తిరస్కరించబడింది"
            : language === "en" ? "Awaiting Approval" : "ఆమోదం కోసం వేచి ఉంది"}
        </h1>

        <p className="text-muted-foreground text-center text-sm max-w-xs mb-8">
          {isRejected
            ? language === "en"
              ? "Your delivery partner application was not approved. Please contact support."
              : "మీ డెలివరీ పార్ట్‌నర్ దరఖాస్తు ఆమోదించబడలేదు. సపోర్ట్‌ను సంప్రదించండి."
            : language === "en"
              ? "Your delivery partner application is being reviewed. We'll notify you once approved."
              : "మీ డెలివరీ పార్ట్‌నర్ దరఖాస్తు సమీక్షించబడుతోంది. ఆమోదించిన తర్వాత తెలియజేస్తాము."}
        </p>

        <Card className="w-full max-w-sm mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isRejected ? "bg-destructive" : "bg-yellow-500 animate-pulse"}`} />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {language === "en" ? "Application Status" : "దరఖాస్తు స్థితి"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRejected
                    ? language === "en" ? "Rejected" : "తిరస్కరించబడింది"
                    : language === "en" ? "Pending Review" : "సమీక్ష పెండింగ్‌లో ఉంది"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full max-w-sm space-y-3">
          {!isRejected && (
            <Button variant="outline" className="w-full gap-2" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4" />
              {language === "en" ? "Check Status" : "స్థితిని తనిఖీ చేయండి"}
            </Button>
          )}
          <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            {language === "en" ? "Sign Out" : "సైన్ అవుట్"}
          </Button>
        </div>
      </div>
    </div>
  );
}
