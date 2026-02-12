import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ArrowRight, Loader2, Mail, Phone, Leaf } from "lucide-react";
import { toast } from "sonner";
import { postAuthRedirect } from "@/context/auth/postAuthRedirect";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { OtpVerifyScreen } from "@/components/auth/OtpVerifyScreen";

const WELCOME_SHOWN_KEY = "mana-angadi-welcome-shown";

type AuthStep = "send" | "verify";

function isEmail(value: string) {
  return value.includes("@");
}

function isValidE164(value: string) {
  return /^\+\d{10,15}$/.test(value);
}

const loginTranslations = {
  te: {
    greeting: "నమస్కారం",
    subtitle: "మానా అంగడికి స్వాగతం",
    nameLabel: "వినియోగదారు పేరు నమోదు చేయండి",
    namePlaceholder: "మీ పేరు",
    credentialLabel: "ఫోన్ నంబర్ లేదా ఈమెయిల్ చిరునామా",
    credentialPlaceholder: "ఫోన్ లేదా ఈమెయిల్ నమోదు చేయండి",
    terms: "నేను",
    termsOfService: "సేవా నిబంధనలు",
    and: "మరియు",
    privacyPolicy: "గోప్యతా విధానానికి",
    termsEnd: "అంగీకరిస్తున్నాను",
    sendCode: "కోడ్ పంపండి",
    verify: "నిర్ధారించు",
    resendIn: "మళ్ళీ పంపండి",
    resend: "కోడ్ మళ్ళీ పంపండి",
    enterOtp: "6-అంకెల కోడ్ నమోదు చేయండి",
    emailLinkSent: "మీ ఇమెయిల్‌కు సురక్షిత లాగిన్ లింక్ పంపబడింది. కొనసాగించడానికి దాన్ని తెరవండి.",
    sentTo: "కోడ్ పంపబడింది",
    change: "మార్చు",
    enterValid: "దయచేసి సరైన ఇమెయిల్ లేదా ఫోన్ నంబర్ నమోదు చేయండి",
    enterValidFormat: "సరైన ఇమెయిల్ లేదా ఫోన్ నంబర్ నమోదు చేయండి (ఉదా. +91xxxxxxxxxx)",
    tooMany: "చాలా ప్రయత్నాలు. దయచేసి కొంచెం ఆగి మళ్ళీ ప్రయత్నించండి.",
    codeSent: "కోడ్ పంపబడింది!",
    somethingWrong: "ఏదో తప్పు జరిగింది",
    invalidCode: "చెల్లని లేదా గడువు ముగిసిన కోడ్. మళ్ళీ ప్రయత్నించండి.",
    tooManyVerify: "చాలా ప్రయత్నాలు. దయచేసి ఆగండి.",
    loggedIn: "లాగిన్ అయ్యారు!",
    enter6Digit: "6-అంకెల కోడ్ నమోదు చేయండి",
  },
  en: {
    greeting: "Namaskaram",
    subtitle: "WELCOME TO MANA ANGADI",
    nameLabel: "Enter User Name",
    namePlaceholder: "Your name",
    credentialLabel: "Phone Number or Email Address",
    credentialPlaceholder: "Enter phone or email",
    terms: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    termsEnd: "",
    sendCode: "Send Code",
    verify: "Verify",
    resendIn: "Resend in",
    resend: "Resend Code",
    enterOtp: "Enter the 6-digit code",
    emailLinkSent: "We sent you a secure login link to your email. Open it to continue.",
    sentTo: "Code sent to",
    change: "Change",
    enterValid: "Please enter email or phone number",
    enterValidFormat: "Enter a valid email or phone number (e.g. +91xxxxxxxxxx)",
    tooMany: "Too many attempts. Please wait and try again.",
    codeSent: "Code sent!",
    somethingWrong: "Something went wrong",
    invalidCode: "Invalid or expired code. Try again.",
    tooManyVerify: "Too many attempts. Please wait.",
    loggedIn: "Logged in!",
    enter6Digit: "Enter the 6-digit code",
  },
};

export function LoginPage() {
  const navigate = useNavigate();
  const { signInWithOtp, verifyOtp, user, role, isLoading: authLoading } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [step, setStep] = useState<AuthStep>("send");
  const [userName, setUserName] = useState("");
  const [credential, setCredential] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const t = loginTranslations[language];
  const isTeluguActive = language === "te";

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    const trimmed = credential.trim();

    if (!trimmed) {
      setError(t.enterValid);
      return;
    }

    if (!isEmail(trimmed) && !isValidE164(trimmed)) {
      setError(t.enterValidFormat);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: otpError } = await signInWithOtp(trimmed);
      if (otpError) {
        const msg = otpError.message.toLowerCase();
        if (msg.includes("rate") || msg.includes("limit")) {
          toast.error(t.tooMany);
        } else {
          toast.error(otpError.message);
        }
        return;
      }
      setStep("verify");
      setResendCountdown(45);
      toast.success(t.codeSent);
    } catch {
      toast.error(t.somethingWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (otpCode.length !== 6) {
      setError(t.enter6Digit);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: verifyError } = await verifyOtp(credential.trim(), otpCode);
      if (verifyError) {
        const msg = verifyError.message.toLowerCase();
        if (msg.includes("expired") || msg.includes("invalid")) {
          toast.error(t.invalidCode);
        } else if (msg.includes("rate") || msg.includes("limit")) {
          toast.error(t.tooManyVerify);
        } else {
          toast.error(verifyError.message);
        }
        return;
      }

      toast.success(t.loggedIn);
      navigate("/login/success", { replace: true, state: { userName: userName.trim() || undefined } });
    } catch {
      toast.error(t.somethingWrong);
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
      <div className="max-w-md mx-auto min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F9F8F4" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#2DB92D" }} />
      </div>
    );
  }

  const inputIsEmail = isEmail(credential);

  // Phone OTP verify - render as full screen takeover
  if (step === "verify" && !inputIsEmail) {
    return (
      <OtpVerifyScreen
        phone={credential.trim()}
        onVerify={(code) => {
          setOtpCode(code);
          const doVerify = async () => {
            setIsSubmitting(true);
            try {
              const { error: verifyError } = await verifyOtp(credential.trim(), code);
              if (verifyError) {
                const msg = verifyError.message.toLowerCase();
                if (msg.includes("expired") || msg.includes("invalid")) {
                  toast.error(t.invalidCode);
                } else if (msg.includes("rate") || msg.includes("limit")) {
                  toast.error(t.tooManyVerify);
                } else {
                  toast.error(verifyError.message);
                }
                return;
              }
              toast.success(t.loggedIn);
              navigate("/login/success", { replace: true, state: { userName: userName.trim() || undefined } });
            } catch {
              toast.error(t.somethingWrong);
            } finally {
              setIsSubmitting(false);
            }
          };
          doVerify();
        }}
        onResend={handleResend}
        onChangePhone={handleChangeCredential}
        isSubmitting={isSubmitting}
        resendCountdown={resendCountdown}
      />
    );
  }

  return (
    <div
      className="max-w-md mx-auto min-h-screen flex flex-col px-8 py-12 relative antialiased"
      style={{ backgroundColor: "#F9F8F4", fontFamily: "'Be Vietnam Pro', sans-serif" }}
    >
      {/* Language Toggle */}
      <div className="absolute top-8 right-8" style={{ width: 160 }}>
        <div
          className="relative flex items-center p-1 rounded-full"
          style={{ backgroundColor: "#F2F0E9", border: "1px solid rgba(26,26,26,0.05)" }}
        >
          {/* Sliding indicator */}
          <div
            className="absolute rounded-full transition-all duration-300 ease-in-out"
            style={{
              height: "calc(100% - 8px)",
              width: "calc(50% - 4px)",
              top: 4,
              backgroundColor: "#2DB92D",
              left: isTeluguActive ? "calc(50% + 2px)" : 4,
            }}
          />
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className="flex-1 px-4 py-1.5 text-center relative z-10 font-medium transition-colors duration-300"
            style={{
              fontSize: 13,
              fontFamily: "'Fraunces', serif",
              color: !isTeluguActive ? "#FFFFFF" : "rgba(26,26,26,0.6)",
            }}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("te")}
            className="flex-1 px-4 py-1.5 text-center relative z-10 font-medium transition-colors duration-300"
            style={{
              fontSize: 13,
              fontFamily: "'Fraunces', serif",
              color: isTeluguActive ? "#FFFFFF" : "rgba(26,26,26,0.6)",
            }}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center pt-16 pb-8">
        {/* Logo */}
        <div
          className="flex items-center justify-center rounded-full mb-6"
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#2DB92D",
            boxShadow: "0 10px 25px -5px rgba(45,185,45,0.1)",
          }}
        >
          <Leaf className="text-white" style={{ width: 36, height: 36 }} />
        </div>

        {/* Greeting */}
        <h1
          className="font-light italic tracking-tight"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "2.25rem",
            color: "#1A1A1A",
          }}
        >
          {t.greeting}
        </h1>

        {/* Subtitle */}
        <p
          className="mt-2 text-sm font-medium text-center"
          style={{
            letterSpacing: isTeluguActive ? "0.025em" : "0.15em",
            textTransform: isTeluguActive ? "none" : "uppercase",
            color: "rgba(26,26,26,0.6)",
          }}
        >
          {t.subtitle}
        </p>
      </div>

      {/* Form Section — Send step */}
      {step === "send" && (
        <form onSubmit={handleSendCode} className="space-y-6 mt-4">
          {/* Name field */}
          <div>
            <label
              className="block mb-2 ml-1 font-bold"
              style={{
                fontSize: 10,
                letterSpacing: isTeluguActive ? "0.025em" : "0.15em",
                textTransform: isTeluguActive ? "none" : "uppercase",
                color: "rgba(26,26,26,0.4)",
              }}
            >
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="w-full bg-transparent rounded-xl px-4 py-4 outline-none transition-all"
              style={{
                border: "1px solid rgba(26,26,26,0.1)",
                color: "#1A1A1A",
                fontSize: 16,
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #2DB92D";
                e.target.style.boxShadow = "0 0 0 1px #2DB92D";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(26,26,26,0.1)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Phone/Email field */}
          <div>
            <label
              className="block mb-2 ml-1 font-bold"
              style={{
                fontSize: 10,
                letterSpacing: isTeluguActive ? "0.025em" : "0.15em",
                textTransform: isTeluguActive ? "none" : "uppercase",
                color: "rgba(26,26,26,0.4)",
              }}
            >
              {t.credentialLabel}
            </label>
            <input
              type="text"
              value={credential}
              onChange={(e) => { setCredential(e.target.value); setError(null); }}
              placeholder={t.credentialPlaceholder}
              className="w-full bg-transparent rounded-xl px-4 py-4 outline-none transition-all"
              style={{
                border: "1px solid rgba(26,26,26,0.1)",
                color: "#1A1A1A",
                fontSize: 16,
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #2DB92D";
                e.target.style.boxShadow = "0 0 0 1px #2DB92D";
              }}
              onBlur={(e) => {
                e.target.style.border = "1px solid rgba(26,26,26,0.1)";
                e.target.style.boxShadow = "none";
              }}
              autoComplete="email tel"
            />
            {error && <p className="text-xs mt-1 px-1" style={{ color: "hsl(0,55%,52%)" }}>{error}</p>}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 px-1">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border cursor-pointer accent-[#2DB92D]"
              style={{ borderColor: "rgba(26,26,26,0.2)" }}
            />
            <p className="text-xs leading-tight" style={{ color: "rgba(26,26,26,0.6)" }}>
              {isTeluguActive ? (
                <>
                  {t.terms}{" "}
                  <span className="underline underline-offset-2 cursor-pointer">{t.termsOfService}</span>{" "}
                  {t.and}{" "}
                  <span className="underline underline-offset-2 cursor-pointer">{t.privacyPolicy}</span>{" "}
                  {t.termsEnd}
                </>
              ) : (
                <>
                  {t.terms}{" "}
                  <span className="underline underline-offset-2 cursor-pointer">{t.termsOfService}</span>{" "}
                  {t.and}{" "}
                  <span className="underline underline-offset-2 cursor-pointer">{t.privacyPolicy}</span>
                </>
              )}
            </p>
          </div>

          {/* Send Code button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full font-semibold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#2DB92D",
              color: "#FFFFFF",
              boxShadow: "0 20px 25px -5px rgba(45,185,45,0.2)",
            }}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              t.sendCode
            )}
          </button>
        </form>
      )}

      {/* Step B: Email magic link sent */}
      {step === "verify" && inputIsEmail && (
        <div className="space-y-5 text-center mt-4">
          <Mail className="w-12 h-12 mx-auto" style={{ color: "#2DB92D" }} />
          <p className="text-sm" style={{ color: "rgba(26,26,26,0.6)" }}>
            {t.emailLinkSent}
          </p>
          <p className="text-xs" style={{ color: "rgba(26,26,26,0.6)" }}>
            {credential.trim()}
          </p>
          <button
            type="button"
            onClick={handleChangeCredential}
            className="text-xs hover:underline"
            style={{ color: "#2DB92D" }}
          >
            {t.change}
          </button>
        </div>
      )}




      {/* Footer — Bottom home indicator */}
      <div className="mt-auto pt-10 flex justify-center">
        <div className="w-32 h-1 rounded-full" style={{ backgroundColor: "rgba(26,26,26,0.1)" }} />
      </div>
    </div>
  );
}
