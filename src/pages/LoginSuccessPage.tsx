import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";

const translations = {
  te: {
    brand: "Mana Angadi",
    greeting: "నమస్కారం,",
    suffix: "!",
    subtitle: "మీ గ్రామ అంగడికి మళ్లీ స్వాగతం",
    button: "మన అంగడిలోకి ప్రవేశించండి",
    fallbackName: "మిత్రమా",
  },
  en: {
    brand: "Mana Angadi",
    greeting: "Namaskaram,",
    suffix: "!",
    subtitle: "Welcome back to your village store",
    button: "Enter Mana Angadi",
    fallbackName: "Friend",
  },
};

export function LoginSuccessPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { profile, user } = useAuth();
  const t = translations[language];

  // Resolve display name: profile > email prefix > fallback
  const userName =
    profile?.display_name ||
    user?.email?.split("@")[0] ||
    t.fallbackName;

  return (
    <div
      className="min-h-screen flex flex-col px-8 py-12 relative overflow-hidden"
      style={{ backgroundColor: "#F9F8F4" }}
    >
      {/* Brand label */}
      <header className="pt-6 text-center">
        <span
          className="text-xs font-medium tracking-[0.25em] uppercase"
          style={{ color: "rgba(0,0,0,0.35)" }}
        >
          {t.brand}
        </span>
      </header>

      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center -mt-8">
        {/* Eco icon circle */}
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-8"
          style={{ backgroundColor: "#E8F3E8" }}
        >
          <img src={welcomeCyclist} alt="Mana Angadi" className="w-16 h-16 object-contain" />
        </div>

        <div className="max-w-sm text-center space-y-3">
          <h1
            className="text-3xl md:text-4xl font-serif font-normal tracking-tight leading-tight"
            style={{ color: "#1a1a1a", fontFamily: "'Newsreader', 'Georgia', serif" }}
          >
            {t.greeting}
            <br />
            <span className="italic">{userName}</span>{t.suffix}
          </h1>

          <p
            className="text-base font-light"
            style={{ color: "rgba(0,0,0,0.45)" }}
          >
            {t.subtitle}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="pb-8">
        <button
          onClick={() => navigate("/home", { replace: true })}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-full text-white font-medium text-base transition-colors"
          style={{ backgroundColor: "#2DB92D" }}
        >
          <span>{t.button}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-6 flex justify-center">
          <div
            className="w-32 h-1 rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.15)" }}
          />
        </div>
      </footer>
    </div>
  );
}
