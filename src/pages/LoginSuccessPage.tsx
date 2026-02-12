import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { Leaf, ArrowRight } from "lucide-react";

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
    <div
      className="max-w-md mx-auto min-h-screen flex flex-col px-8 py-12 relative overflow-hidden antialiased"
      style={{ backgroundColor: "#F9F8F4", fontFamily: "'Newsreader', serif", color: "#1A1A1A" }}
    >
      {/* Dotted background overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: 0.03,
          backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          mixBlendMode: "multiply",
          zIndex: 0,
        }}
      />

      {/* Brand label */}
      <header className="relative z-10 pt-4 text-center">
        <span
          className="text-xs font-semibold uppercase"
          style={{ letterSpacing: "0.4em", color: "rgba(26,26,26,0.4)" }}
        >
          {t.brand}
        </span>
      </header>

      {/* Main center content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Eco icon */}
        <div
          className="flex items-center justify-center rounded-full mb-10"
          style={{ width: 96, height: 96, backgroundColor: "#E8F3E8" }}
        >
          <Leaf style={{ width: 48, height: 48, color: "#2DB92D" }} />
        </div>

        {/* Greeting */}
        <div className="max-w-sm text-center space-y-4">
          <h1
            className="text-4xl md:text-5xl font-medium tracking-tight"
            style={{ lineHeight: 1.15 }}
          >
            {t.greeting}
            <br />
            <span className="italic">{userName}</span> {t.suffix}
          </h1>

          <p
            className="text-lg font-light"
            style={{ color: "rgba(26,26,26,0.6)" }}
          >
            {t.subtitle}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 pb-8">
        <button
          onClick={() => navigate("/home", { replace: true })}
          className="w-full flex items-center justify-center space-x-3 text-lg font-medium tracking-wide active:scale-[0.98] transition-transform duration-200"
          style={{
            backgroundColor: "#2DB92D",
            color: "#FFFFFF",
            padding: "1.25rem 1.5rem",
            borderRadius: 9999,
            boxShadow: "0 20px 25px -5px rgba(45,185,45,0.15)",
          }}
        >
          <span>{t.button}</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Home indicator */}
        <div className="mt-8 flex justify-center">
          <div className="w-32 h-1 rounded-full" style={{ backgroundColor: "rgba(26,26,26,0.1)" }} />
        </div>
      </footer>
    </div>
  );
}
