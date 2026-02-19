import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";

const translations = {
  te: {
    brand: "MANA ANGADI",
    greeting: "నమస్కారం,",
    suffix: "గారు!",
    subtitle: "మీ గ్రామ అంగడికి మళ్లీ స్వాగతం",
    button: "అంగడి అన్వేషించండి",
  },
  en: {
    brand: "MANA ANGADI",
    greeting: "Namaskaram,",
    suffix: "Gaaru!",
    subtitle: "Welcome back to your village store",
    button: "Explore Angadi",
  },
};

export function LoginSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const t = translations[language];

  const userName = (location.state as any)?.userName
    || localStorage.getItem("mana-angadi-user-name")
    || "User";

  return (
    <div className="screen-shell flex flex-col px-8 py-12 relative overflow-hidden font-display">
      {/* Dotted background overlay */}
      <div className="dotted-bg" />

      {/* Brand label */}
      <header className="relative z-10 pt-4 text-center">
        <span className="label-brand">{t.brand}</span>
      </header>

      {/* Main center content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        <img
          src={welcomeCyclist}
          alt="Mana Angadi"
          className="rounded-full mb-10 object-contain w-24 h-24"
        />

        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-medium tracking-tight leading-tight text-foreground">
            {t.greeting}
            <br />
            <span className="italic">{userName}</span> {t.suffix}
          </h1>

          <p className="text-lg font-light text-foreground/60">
            {t.subtitle}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8">
        <button
          onClick={() => navigate("/home", { replace: true })}
          className="btn-primary-pill"
        >
          <span>{t.button}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="mt-8 flex justify-center">
          <div className="home-indicator" />
        </div>
      </footer>
    </div>
  );
}
