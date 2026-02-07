import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { Store, ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const WELCOME_SHOWN_KEY = "mana-angadi-welcome-shown";

type AuthStep = "send" | "verify";

function isEmail(value: string) {
  return value.includes("@");
}

function isValidE164(value: string) {
  return /^\+\d{10,15}$/.test(value);
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithOtp, verifyOtp, user, role, isLoading: authLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [step, setStep] = useState<AuthStep>("send");
  const [credential, setCredential] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resend timer
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) setShowWelcome(true);
  }, []);

  const labels = useMemo(() => ({
    sendCode: language === "en" ? "Send Code" : "కోడ్ పంపండి",
    verify: language === "en" ? "Verify" : "నిర్ధారించు",
    resendIn: language === "en" ? "Resend in" : "మళ్ళీ పంపండి",
    resend: language === "en" ? "Resend Code" : "కోడ్ మళ్ళీ పంపండి",
    placeholder: language === "en" ? "Email or Phone number" : "ఇమెయిల్ లేదా ఫోన్ నంబర్",
    enterOtp: language === "en" ? "Enter the 6-digit code" : "6-అంకెల కోడ్ నమోదు చేయండి",
    sentTo: language === "en" ? "Code sent to" : "కోడ్ పంపబడింది",
    changeCredential: language === "en" ? "Change" : "మార్చు",
  }), [language]);


  const handleWelcomeDismiss = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, "true");
    setShowWelcome(false);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const trimmed = credential.trim();

    if (!trimmed) {
      setError(language === "en" ? "Please enter email or phone number" : "దయచేసి ఇమెయిల్ లేదా ఫోన్ నంబర్ నమోదు చేయండి");
      return;
    }

    if (!isEmail(trimmed) && !isValidE164(trimmed)) {
      setError(
        language === "en"
          ? "Enter a valid email or phone number (e.g. +91xxxxxxxxxx)"
          : "సరైన ఇమెయిల్ లేదా ఫోన్ నంబర్ నమోదు చేయండి (ఉదా. +91xxxxxxxxxx)"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: otpError } = await signInWithOtp(trimmed);
      if (otpError) {
        const msg = otpError.message.toLowerCase();
        if (msg.includes("rate") || msg.includes("limit")) {
          toast.error(language === "en" ? "Too many attempts. Please wait and try again." : "చాలా ప్రయత్నాలు. దయచేసి కొంచెం ఆగి మళ్ళీ ప్రయత్నించండి.");
        } else {
          toast.error(otpError.message);
        }
        return;
      }
      setStep("verify");
      setResendCountdown(45);
      toast.success(language === "en" ? "Code sent!" : "కోడ్ పంపబడింది!");
    } catch {
      toast.error(language === "en" ? "Something went wrong" : "ఏదో తప్పు జరిగింది");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (otpCode.length !== 6) {
      setError(language === "en" ? "Enter the 6-digit code" : "6-అంకెల కోడ్ నమోదు చేయండి");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: verifyError } = await verifyOtp(credential.trim(), otpCode);
      if (verifyError) {
        const msg = verifyError.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("invalid")) {
          toast.error(language === "en" ? "Invalid or expired code. Try again." : "చెల్లని లేదా గడువు ముగిసిన కోడ్. మళ్ళీ ప్రయత్నించండి.");
        } else if (msg.includes("rate") || msg.includes("limit")) {
          toast.error(language === "en" ? "Too many attempts. Please wait." : "చాలా ప్రయత్నాలు. దయచేసి ఆగండి.");
        } else {
          toast.error(verifyError.message);
        }
        return;
      }

      toast.success(language === "en" ? "Logged in!" : "లాగిన్ అయ్యారు!");
      // Auth state change listener will handle hydration; navigate after
      const { route } = await postAuthRedirect();
      navigate(route, { replace: true });
    } catch {
      toast.error(language === "en" ? "Something went wrong" : "ఏదో తప్పు జరిగింది");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0) return;
    setOtpCode("");
    handleSendCode();
  };

  const handleChangeCredential = () => {
    setStep("send");
    setOtpCode("");
    setError(null);
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


  const inputIsEmail = isEmail(credential);

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Language Toggle */}
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
          {step === "send"
            ? (language === "en" ? "Sign in or create an account" : "లాగిన్ అవ్వండి లేదా ఖాతా సృష్టించండి")
            : labels.enterOtp}
        </p>
      </div>

      {/* Step A: Send Code */}
      {step === "send" && (
        <form onSubmit={handleSendCode} className="px-6 pb-6 space-y-4 animate-slide-up">
          <div className="space-y-1">
            <div className="relative">
              {inputIsEmail ? (
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              ) : (
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              )}
              <input
                type="text"
                value={credential}
                onChange={(e) => { setCredential(e.target.value); setError(null); }}
                placeholder={labels.placeholder}
                className="input-village pl-12"
                autoComplete="email tel"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-destructive px-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {labels.sendCode}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step B: Verify OTP */}
      {step === "verify" && (
        <form onSubmit={handleVerify} className="px-6 pb-6 space-y-5 animate-slide-up">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">
              {labels.sentTo}{" "}
              <span className="font-medium text-foreground">{credential.trim()}</span>
            </p>
            <button
              type="button"
              onClick={handleChangeCredential}
              className="text-xs text-primary hover:underline"
            >
              {labels.changeCredential}
            </button>
          </div>

          <div className="flex justify-center">
            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          {error && <p className="text-xs text-destructive text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || otpCode.length !== 6}
            className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {labels.verify}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div className="text-center">
            {resendCountdown > 0 ? (
              <p className="text-sm text-muted-foreground">
                {labels.resendIn} {resendCountdown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-sm text-primary hover:underline"
              >
                {labels.resend}
              </button>
            )}
          </div>
        </form>
      )}

      <div className="px-6 pb-6 text-center">
        <span className="trust-badge">{t.villageBadge}</span>
      </div>
    </div>
  );
}
