import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import manaAngadiLogo from "@/assets/mana-angadi-logo.png";
import { toast } from "sonner";
import { LanguageToggle } from "@/components/LanguageToggle";

type LoginTab = "email" | "phone";

const labels = {
  te: {
    heading: "స్వాగతం",
    subtitle: "మన అంగడిలోకి ప్రవేశించండి",
    emailTab: "ఈమెయిల్",
    phoneTab: "ఫోన్",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "you@example.com",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
    phoneLabel: "ఫోన్ నంబర్",
    phonePlaceholder: "10 అంకెల నంబర్ నమోదు చేయండి",
    forgot: "పాస్‌వర్డ్ మర్చిపోయారా?",
    signIn: "ప్రవేశించండి",
    sendOtp: "OTP పంపండి",
    noAccount: "ఖాతా లేదా?",
    signUp: "నమోదు చేయండి",
    emailError: "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.",
    phoneError: "దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి.",
    loggedIn: "లాగిన్ అయ్యారు!",
    somethingWrong: "ఏదో తప్పు జరిగింది",
    otpComingSoon: "OTP లాగిన్ త్వరలో అందుబాటులోకి వస్తుంది",
    otpComingSoonDesc: "మేము SMS సేవాదాతను సెటప్ చేస్తున్నాము. అప్పటి వరకు ఈమెయిల్ తో లాగిన్ చేయండి.",
    useEmailInstead: "ఈమెయిల్‌తో లాగిన్ చేయండి",
  },
  en: {
    heading: "Welcome",
    subtitle: "SIGN IN TO MANA ANGADI",
    emailTab: "Email",
    phoneTab: "Phone",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    phoneLabel: "Phone Number",
    phonePlaceholder: "Enter 10-digit number",
    forgot: "Forgot password?",
    signIn: "Sign In",
    sendOtp: "Send OTP",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    emailError: "Please enter your email and password.",
    phoneError: "Please enter a valid 10-digit phone number.",
    loggedIn: "Logged in!",
    somethingWrong: "Something went wrong",
    otpComingSoon: "OTP Login Coming Soon",
    otpComingSoonDesc: "We're setting up our SMS provider. Until then, please use email to sign in.",
    useEmailInstead: "Sign in with Email instead",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, refresh, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const t = labels[language];

  const [activeTab, setActiveTab] = useState<LoginTab>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const proceedAfterLogin = () => {
    const redirect = sessionStorage.getItem("post-login-redirect");
    if (redirect) {
      sessionStorage.removeItem("post-login-redirect");
      navigate(redirect, { replace: true });
    } else {
      navigate("/login/success", { replace: true });
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError(t.emailError);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        toast.error(signInError.message);
        setError(signInError.message);
        return;
      }
      toast.success(t.loggedIn);
      await refresh();
      await new Promise((r) => setTimeout(r, 0));
      proceedAfterLogin();
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="screen-shell flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="screen-shell flex flex-col px-8 py-12 relative font-sans">
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 w-40">
        <LanguageToggle />
      </div>

      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <div
          className="rounded-full mb-6 w-32 h-32 overflow-hidden border-2"
          style={{
            borderColor: "rgba(45,185,45,0.25)",
            boxShadow: "0 8px 24px rgba(45,185,45,0.15)",
          }}
        >
          <img
            src={manaAngadiLogo}
            alt="Mana Angadi"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          {t.heading}
        </h1>
        <p className="mt-2 text-subtitle">{t.subtitle}</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center bg-muted rounded-2xl p-1 mb-6">
        <button
          onClick={() => { setActiveTab("email"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "email"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Mail className="w-4 h-4" />
          {t.emailTab}
        </button>
        <button
          onClick={() => { setActiveTab("phone"); setError(null); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === "phone"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          <Phone className="w-4 h-4" />
          {t.phoneTab}
        </button>
      </div>

      {/* ── EMAIL TAB ── */}
      {activeTab === "email" && (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 ml-1 label-micro">{t.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder={t.emailPlaceholder}
              className="input-auth"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block mb-2 ml-1 label-micro">{t.passwordLabel}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              placeholder={t.passwordPlaceholder}
              className="input-auth"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs mt-1 px-1 text-destructive">{error}</p>
          )}

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              {t.forgot}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-block"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              <>
                {t.signIn}
                <ArrowRight size={20} className="ml-2 inline" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ── PHONE TAB — COMING SOON ── */}
      {activeTab === "phone" && (
        <div className="flex flex-col items-center text-center space-y-5 py-4">
          {/* Animated phone icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <style>{`
              @keyframes phonePulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
              }
            `}</style>
            <Phone
              className="w-9 h-9 text-primary"
              style={{ animation: "phonePulse 2s ease-in-out infinite" }}
            />
          </div>

          {/* Coming Soon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              {language === "en" ? "Coming Soon" : "త్వరలో వస్తుంది"}
            </span>
          </div>

          <div className="bg-card rounded-2xl border border-border p-5 w-full">
            <p className="font-semibold text-foreground mb-2">
              {t.otpComingSoon}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.otpComingSoonDesc}
            </p>
          </div>

          {/* Phone input — disabled, shows what it will look like */}
          <div className="w-full opacity-50 pointer-events-none">
            <label className="block mb-2 ml-1 label-micro">{t.phoneLabel}</label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-muted rounded-xl border border-border">
                <span className="text-sm font-medium text-foreground">🇮🇳 +91</span>
              </div>
              <input
                type="tel"
                placeholder={t.phonePlaceholder}
                className="input-auth flex-1"
                disabled
              />
            </div>
          </div>

          <button
            disabled
            className="btn-primary-block opacity-40 cursor-not-allowed"
          >
            {t.sendOtp}
            <ArrowRight size={20} className="ml-2 inline" />
          </button>

          {/* Switch back to email */}
          <button
            onClick={() => setActiveTab("email")}
            className="text-sm text-primary font-medium hover:underline"
          >
            ← {t.useEmailInstead}
          </button>
        </div>
      )}

      {/* Sign up link */}
      <p className="text-center text-sm text-muted-foreground mt-8">
        {t.noAccount}{" "}
        <Link
          to="/signup"
          className="text-primary font-medium hover:underline"
        >
          {t.signUp}
        </Link>
      </p>

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}