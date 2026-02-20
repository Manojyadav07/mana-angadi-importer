import { useLanguage } from "@/context/LanguageContext";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const isTeluguActive = language === "te";

  return (
    <div className="lang-toggle">
      <div
        className="lang-toggle-slider"
        style={{ left: isTeluguActive ? 4 : "calc(50% + 2px)" }}
      />
      <button
        type="button"
        onClick={() => setLanguage("te")}
        className={`lang-toggle-btn ${isTeluguActive ? "text-primary-foreground" : "text-foreground/60"}`}
      >
        తెలుగు
      </button>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`lang-toggle-btn ${!isTeluguActive ? "text-primary-foreground" : "text-foreground/60"}`}
      >
        English
      </button>
    </div>
  );
}
