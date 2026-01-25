import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import {
  Store,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Briefcase,
  Truck,
  Shield,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import type { UserRole } from "@/types";
import { toast } from "sonner";
import { z } from "zod";
import { getRouteForRole } from "@/context/auth/authHelpers";

const WELCOME_SHOWN_KEY = "mana-angadi-welcome-shown";

type AuthTab = "signIn" | "signUp";
type SignupState = "form" | "success";

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(100);
const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100);

function isAccountExistsError(message: string) {
  const m = message.toLowerCase();
  return (
    m.includes("already registered") ||
    m.includes("already exists") ||
    m.includes("user already") ||
    m.includes("duplicate")
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUpWithRole, refresh, resetPassword, user, role, profile, isLoading: authLoading, authError, retryHydration } =
    useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [tab, setTab] = useState<AuthTab>("signIn");
  const isSignUp = tab === "signUp";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});
  const [signupState, setSignupState] = useState<SignupState>("form");

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) setShowWelcome(true);
  }, []);

  const labels = useMemo(() => {
    return {
      adminLabel: language === "en" ? "Admin" : "అడ్మిన్",
      signUpLabel: language === "en" ? "Create Account" : "ఖాతా సృష్టించండి",
      signInLabel: language === "en" ? "Sign In" : "లాగిన్",
      emailLabel: language === "en" ? "Email" : "ఇమెయిల్",
      passwordLabel: language === "en" ? "Password" : "పాస్‌వర్డ్",
      nameLabel: language === "en" ? "Your Name" : "మీ పేరు",
      forgotPassword: language === "en" ? "Forgot password?" : "పాస్‌వర్డ్ మర్చిపోయారా?",
      accountExists: language === "en" ? "Account already exists. Please Sign In." : "ఖాతా ఇప్పటికే ఉంది. దయచేసి లాగిన్ అవ్వండి.",
      backToLogin: language === "en" ? "Back to Login" : "లాగిన్‌కి తిరిగి వెళ్ళండి",
      signupSuccess: language === "en" ? "Account Created!" : "ఖాతా సృష్టించబడింది!",
      continueBtn: language === "en" ? "Continue" : "కొనసాగించు",
      successMessage: language === "en" ? "Your account has been created successfully." : "మీ ఖాతా విజయవంతంగా సృష్టించబడింది.",
    };
  }, [language]);

  // If already logged in AND we know the role, route deterministically.
  useEffect(() => {
    if (!authLoading && user && role) {
      navigate(getRouteForRole(role, profile?.merchant_status));
    }
  }, [authLoading, user, role, profile?.merchant_status, navigate]);

  const handleWelcomeDismiss = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setShowWelcome(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.email = e.errors[0]?.message;
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.password = e.errors[0]?.message;
    }

    if (isSignUp) {
      try {
        nameSchema.parse(displayName);
      } catch (e) {
        if (e instanceof z.ZodError) newErrors.name = e.errors[0]?.message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error(language === "en" ? "Enter your email first" : "ముందు ఇమెయిల్ నమోదు చేయండి");
      return;
    }

    const { error } = await resetPassword(email.trim());
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(language === "en" ? "Password reset email sent" : "పాస్‌వర్డ్ రీసెట్ ఇమెయిల్ పంపబడింది");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        // Use atomic signup that creates profile + role together
        const { error } = await signUpWithRole(
          email.trim(), 
          password, 
          displayName.trim(), 
          selectedRole
        );
        
        if (error) {
          if (isAccountExistsError(error.message)) {
            toast.error(labels.accountExists);
            setTab("signIn");
            return;
          }
          toast.error(error.message);
          return;
        }

        // Refresh to ensure context is synced
        const refreshed = await refresh();
        if (refreshed.error) {
          toast.error(language === "en" ? "Account created but failed to load. Tap retry." : "ఖాతా సృష్టించబడింది కానీ లోడ్ కాలేదు. రీట్రై చేయండి.");
          return;
        }

        // Show success state instead of immediate navigation
        setSignupState("success");
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          const msg = error.message.toLowerCase();
          if (msg.includes("email") && msg.includes("confirm")) {
            toast.error(language === "en" ? "Please confirm your email, then sign in." : "ముందుగా ఇమెయిల్ నిర్ధారించండి, తర్వాత లాగిన్ అవ్వండి.");
          } else {
            toast.error(language === "en" ? "Invalid email or password" : "తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్");
          }
          return;
        }

        const refreshed = await refresh();
        if (refreshed.error) {
          toast.error(language === "en" ? "Signed in, but app failed to load. Tap retry." : "లాగిన్ అయ్యారు, కానీ లోడ్ కాలేదు. రీట్రై చేయండి.");
          return;
        }

        toast.success(language === "en" ? "Logged in!" : "లాగిన్ అయ్యారు!");
        const merchantStatus = refreshed.profile?.merchant_status;
        navigate(getRouteForRole(refreshed.role, merchantStatus));
      }
    } catch (err: any) {
      console.error("Auth submit failed:", err);
      toast.error(language === "en" ? "Something went wrong" : "ఏదో తప్పు జరిగింది");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onContinue={handleWelcomeDismiss} />;
  }

  if (authLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user && !role) {
    // Authenticated but role not loaded yet (or missing). Provide deterministic retry.
    return (
      <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "Finishing login…" : "లాగిన్ పూర్తవుతోంది…"}
        </p>
        {authError && (
          <p className="text-sm text-destructive">{authError}</p>
        )}
        <button type="button" onClick={retryHydration} className="btn-accent w-full">
          {language === "en" ? "Retry" : "మళ్లీ ప్రయత్నించండి"}
        </button>
      </div>
    );
  }

  // Signup success state
  if (signupState === "success") {
    const handleContinue = () => {
      const merchantStatus = profile?.merchant_status;
      navigate(getRouteForRole(role, merchantStatus));
    };

    const handleBackToLogin = () => {
      setSignupState("form");
      setTab("signIn");
      setEmail("");
      setPassword("");
      setDisplayName("");
    };

    return (
      <div className="mobile-container min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-scale-in">
          <Store className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold text-foreground text-center animate-fade-in">
          {labels.signupSuccess}
        </h1>
        <p className="text-muted-foreground text-center mt-2 text-sm animate-fade-in">
          {labels.successMessage}
        </p>

        <div className="w-full max-w-sm mt-8 space-y-3">
          <button
            type="button"
            onClick={handleContinue}
            className="btn-accent w-full flex items-center justify-center gap-2"
          >
            {labels.continueBtn}
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <button
            type="button"
            onClick={handleBackToLogin}
            className="btn-secondary w-full"
          >
            {labels.backToLogin}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Language Toggle - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          <button
            type="button"
            onClick={() => setLanguage("te")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              language === "te"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            తెలుగు
          </button>
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              language === "en"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 animate-scale-in">
          <Store className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center animate-fade-in">{t.welcome}</h1>
        <p className="text-muted-foreground text-center mt-1 text-sm animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {tab === "signIn" ? labels.signInLabel : labels.signUpLabel}
        </p>

        {/* Tabs */}
        <div className="mt-6 w-full max-w-sm bg-muted rounded-2xl p-1 flex">
          <button
            type="button"
            onClick={() => {
              setTab("signIn");
              setErrors({});
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === "signIn" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {labels.signInLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("signUp");
              setErrors({});
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === "signUp" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"
            }`}
          >
            {labels.signUpLabel}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 animate-slide-up">
        {/* Role Selection (signup only) */}
        {isSignUp && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t.loginAs || "I am a"}</p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("customer")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedRole === "customer"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedRole === "customer" ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <ShoppingBag
                    className={`w-5 h-5 ${selectedRole === "customer" ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <span className={`text-xs font-medium ${selectedRole === "customer" ? "text-primary" : "text-muted-foreground"}`}>
                  {t.customer || "Customer"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("merchant")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedRole === "merchant"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    selectedRole === "merchant" ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Briefcase
                    className={`w-5 h-5 ${selectedRole === "merchant" ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <span className={`text-xs font-medium ${selectedRole === "merchant" ? "text-primary" : "text-muted-foreground"}`}>
                  {t.merchant}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("delivery")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                  selectedRole === "delivery"
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedRole === "delivery" ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Truck className={`w-4 h-4 ${selectedRole === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-xs font-medium ${selectedRole === "delivery" ? "text-primary" : "text-muted-foreground"}`}>
                  {t.delivery}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                  selectedRole === "admin" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedRole === "admin" ? "bg-primary/20" : "bg-muted"
                  }`}
                >
                  <Shield className={`w-4 h-4 ${selectedRole === "admin" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <span className={`text-xs font-medium ${selectedRole === "admin" ? "text-primary" : "text-muted-foreground"}`}>
                  {labels.adminLabel}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Name (signup only) */}
        {isSignUp && (
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={labels.nameLabel}
                className="input-village pl-12"
                autoComplete="name"
              />
            </div>
            {errors.name && <p className="text-xs text-destructive px-1">{errors.name}</p>}
          </div>
        )}

        {/* Email */}
        <div className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={labels.emailLabel}
              className="input-village pl-12"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive px-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={labels.passwordLabel}
              className="input-village pl-12 pr-12"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive px-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
            {tab === "signIn" ? labels.signInLabel : labels.signUpLabel}
            <ArrowRight className="w-5 h-5" />
          </>}
        </button>

        {/* Forgot password (sign-in only) */}
        {tab === "signIn" && (
          <div className="text-center">
            <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:underline">
              {labels.forgotPassword}
            </button>
          </div>
        )}

        {/* Back to Login (signup only) */}
        {tab === "signUp" && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setTab("signIn");
                setErrors({});
              }}
              className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              ← {labels.backToLogin}
            </button>
          </div>
        )}
      </form>

      <div className="px-6 pb-6 text-center">
        <span className="trust-badge">{t.villageBadge}</span>
      </div>
    </div>
  );
}

