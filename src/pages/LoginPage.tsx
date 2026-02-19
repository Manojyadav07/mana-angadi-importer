import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";
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
        if (msg.includes("rate") || msg.includes("limit") || msg.includes("wait")) {
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
      const enteredName = userName.trim();
      if (enteredName) localStorage.setItem("mana-angadi-user-name", enteredName);
      navigate("/login/success", { replace: true, state: { userName: enteredName || undefined } });
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
    return <WelcomeScreen onStart={() => setShowWelcome(false)} />;
  }

  if (authLoading) {
    return (
      <div className="screen-shell flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
              const enteredName = userName.trim();
              if (enteredName) localStorage.setItem("mana-angadi-user-name", enteredName);
              navigate("/login/success", { replace: true, state: { userName: enteredName || undefined } });
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
    <div className="screen-shell flex flex-col px-8 py-12 relative font-sans">
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 w-40">
        <div className="lang-toggle">
          <div
            className="lang-toggle-slider"
            style={{ left: isTeluguActive ? "calc(50% + 2px)" : 4 }}
          />
          <button
            type="button"
            onClick={() => setLanguage("en")}
            className={`lang-toggle-btn ${!isTeluguActive ? "text-primary-foreground" : "text-foreground/60"}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage("te")}
            className={`lang-toggle-btn ${isTeluguActive ? "text-primary-foreground" : "text-foreground/60"}`}
          >
            తెలుగు
          </button>
        </div>
      </div>

      {/* Header Section */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <img
          src={welcomeCyclist}
          alt="Mana Angadi"
          className="rounded-full mb-6 object-contain w-20 h-20"
        />

        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          {t.greeting}
        </h1>

        <p className={`mt-2 ${isTeluguActive ? "text-subtitle-te" : "text-subtitle"}`}>
          {t.subtitle}
        </p>
      </div>

      {/* Form Section — Send step */}
      {step === "send" && (
        <form onSubmit={handleSendCode} className="space-y-6 mt-4">
          {/* Name field */}
          <div>
            <label className={`block mb-2 ml-1 ${isTeluguActive ? "label-micro-te" : "label-micro"}`}>
              {t.nameLabel}
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t.namePlaceholder}
              className="input-auth"
            />
          </div>

          {/* Phone/Email field */}
          <div>
            <label className={`block mb-2 ml-1 ${isTeluguActive ? "label-micro-te" : "label-micro"}`}>
              {t.credentialLabel}
            </label>
            <input
              type="text"
              value={credential}
              onChange={(e) => { setCredential(e.target.value); setError(null); }}
              placeholder={t.credentialPlaceholder}
              className="input-auth"
              autoComplete="email tel"
            />
            {error && <p className="text-xs mt-1 px-1 text-destructive">{error}</p>}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-start gap-3 px-1">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="checkbox-primary mt-0.5"
            />
            <p className="text-xs leading-tight text-foreground/60">
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
            className="btn-primary-block"
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
          <Mail className="w-12 h-12 mx-auto text-primary" />
          <p className="text-sm text-foreground/60">
            {t.emailLinkSent}
          </p>
          <p className="text-xs text-foreground/60">
            {credential.trim()}
          </p>
          <button
            type="button"
            onClick={handleChangeCredential}
            className="text-xs hover:underline text-primary"
          >
            {t.change}
          </button>
        </div>
      )}

      {/* Footer — Bottom home indicator */}
      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}
