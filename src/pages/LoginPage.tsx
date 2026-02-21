import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Loader2 } from "lucide-react";
import manaAngadiLogo from "@/assets/mana-angadi-logo.png";
import { toast } from "sonner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NamePromptDialog } from "@/components/NamePromptDialog";

const t = {
  te: {
    heading: "స్వాగతం",
    subtitle: "మన అంగడిలోకి ప్రవేశించండి",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "you@example.com",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "పాస్‌వర్డ్ నమోదు చేయండి",
    forgot: "పాస్‌వర్డ్ మర్చిపోయారా?",
    signIn: "ప్రవేశించండి",
    noAccount: "ఖాతా లేదా?",
    signUp: "నమోదు చేయండి",
    error: "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.",
    loggedIn: "లాగిన్ అయ్యారు!",
    somethingWrong: "ఏదో తప్పు జరిగింది",
  },
  en: {
    heading: "Welcome",
    subtitle: "SIGN IN TO MANA ANGADI",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter password",
    forgot: "Forgot password?",
    signIn: "Sign In",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",
    error: "Please enter your email and password.",
    loggedIn: "Logged in!",
    somethingWrong: "Something went wrong",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, refresh, isLoading: authLoading } = useAuth();
  const { language } = useLanguage();
  const labels = t[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNamePrompt, setShowNamePrompt] = useState(false);

  const proceedAfterLogin = () => {
    const redirect = sessionStorage.getItem('post-login-redirect');
    if (redirect) {
      sessionStorage.removeItem('post-login-redirect');
      navigate(redirect, { replace: true });
    } else {
      navigate("/login/success", { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(labels.error);
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
      toast.success(labels.loggedIn);

      // Wait for auth hydration to complete so guards see the session
      const { profile: freshProfile } = await refresh();
      // Small delay to let AuthContext settle after refresh
      await new Promise(r => setTimeout(r, 100));
      if (!freshProfile?.display_name?.trim()) {
        setShowNamePrompt(true);
      } else {
        proceedAfterLogin();
      }
    } catch {
      toast.error(labels.somethingWrong);
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
          style={{ borderColor: "rgba(45,185,45,0.25)", boxShadow: "0 8px 24px rgba(45,185,45,0.15)" }}
        >
          <img src={manaAngadiLogo} alt="Mana Angadi" className="w-full h-full object-cover" />
        </div>
        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          {labels.heading}
        </h1>
        <p className="mt-2 text-subtitle">{labels.subtitle}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block mb-2 ml-1 label-micro">{labels.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder={labels.emailPlaceholder}
            className="input-auth"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">{labels.passwordLabel}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder={labels.passwordPlaceholder}
            className="input-auth"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-xs mt-1 px-1 text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            {labels.forgot}
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary-block">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <>
              {labels.signIn}
              <ArrowRight size={20} className="ml-2 inline" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        {labels.noAccount}{" "}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          {labels.signUp}
        </Link>
      </p>

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>

      <NamePromptDialog
        open={showNamePrompt}
        onComplete={() => {
          setShowNamePrompt(false);
          proceedAfterLogin();
        }}
      />
    </div>
  );
}
