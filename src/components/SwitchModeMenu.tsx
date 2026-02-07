import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserMode, getRouteForMode, type UserMode } from "@/context/UserModeContext";
import { useLanguage } from "@/context/LanguageContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRightLeft, Home, Store, Truck, Shield, Check } from "lucide-react";
import { toast } from "sonner";

export function SwitchModeMenu() {
  const navigate = useNavigate();
  const { role, onboardingStatus } = useAuth();
  const { userMode, setUserMode } = useUserMode();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);

  const isAdmin = role === "admin";

  const modes: { mode: UserMode; icon: React.ReactNode; label: string; labelTe: string; requiresApproval?: boolean }[] = [
    { mode: "customer", icon: <Home className="w-5 h-5" />, label: "Customer", labelTe: "కస్టమర్" },
    {
      mode: "merchant",
      icon: <Store className="w-5 h-5" />,
      label: "Merchant",
      labelTe: "మర్చంట్",
      requiresApproval: true,
    },
    {
      mode: "delivery",
      icon: <Truck className="w-5 h-5" />,
      label: "Delivery",
      labelTe: "డెలివరీ",
      requiresApproval: true,
    },
  ];

  // Admin option only visible to admin-role users
  if (isAdmin) {
    modes.push({
      mode: "admin",
      icon: <Shield className="w-5 h-5" />,
      label: "Admin Dashboard",
      labelTe: "అడ్మిన్ డాష్‌బోర్డ్",
    });
  }

  const handleSwitch = (mode: UserMode) => {
    // For merchant/delivery modes, check if approved (admin bypasses)
    if (!isAdmin && mode === "merchant") {
      if (role !== "merchant" || onboardingStatus !== "approved") {
        toast.error(
          language === "en"
            ? "You need an approved merchant account to switch to this mode"
            : "ఈ మోడ్‌కి మారడానికి ఆమోదించబడిన మర్చంట్ ఖాతా అవసరం"
        );
        return;
      }
    }
    if (!isAdmin && mode === "delivery") {
      if (role !== "delivery" || onboardingStatus !== "approved") {
        toast.error(
          language === "en"
            ? "You need an approved delivery account to switch to this mode"
            : "ఈ మోడ్‌కి మారడానికి ఆమోదించబడిన డెలివరీ ఖాతా అవసరం"
        );
        return;
      }
    }

    setUserMode(mode);
    setOpen(false);
    navigate(getRouteForMode(mode), { replace: true });
    toast.success(
      language === "en"
        ? `Switched to ${mode} mode`
        : `${mode} మోడ్‌కి మారింది`
    );
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Switch mode"
        >
          <ArrowRightLeft className="w-4 h-4 text-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl pb-8">
        <SheetHeader>
          <SheetTitle className="text-left">
            {language === "en" ? "Switch Mode" : "మోడ్ మార్చు"}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {modes.map((item) => {
            const isActive = userMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => handleSwitch(item.mode)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all active:scale-[0.98] ${
                  isActive
                    ? "bg-primary/10 border-2 border-primary"
                    : "bg-card border border-border hover:bg-muted"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {item.icon}
                </div>
                <span className={`font-medium flex-1 text-left ${isActive ? "text-primary" : "text-foreground"}`}>
                  {language === "en" ? item.label : item.labelTe}
                </span>
                {isActive && <Check className="w-5 h-5 text-primary" />}
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
