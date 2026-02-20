import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Loader2 } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";
import { toast } from "sonner";
import { LanguageToggle } from "@/components/LanguageToggle";

const t = {
  te: {
    heading: "ఖాతా సృష్టించండి",
    subtitle: "మన అంగడిలో చేరండి",
    nameLabel: "పేరు",
    namePlaceholder: "మీ పేరు",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "you@example.com",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "కనీసం 6 అక్షరాలు",
    phoneLabel: "ఫోన్ (ఐచ్ఛికం)",
    phonePlaceholder: "+91XXXXXXXXXX",
    signUp: "నమోదు చేయండి",
    hasAccount: "ఇప్పటికే ఖాతా ఉందా?",
    signIn: "ప్రవేశించండి",
    errorEmpty: "దయచేసి ఈమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.",
    errorShort: "పాస్‌వర్డ్ కనీసం 6 అక్షరాలు ఉండాలి.",
    success: "మీ ఈమెయిల్‌ను నిర్ధారించడానికి తనిఖీ చేయండి!",
    somethingWrong: "ఏదో తప్పు జరిగింది",
  },
  en: {
    heading: "Create Account",
    subtitle: "JOIN MANA ANGADI",
    nameLabel: "Display Name",
    namePlaceholder: "Your name",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "Min 6 characters",
    phoneLabel: "Phone (optional)",
    phonePlaceholder: "+91XXXXXXXXXX",
    signUp: "Sign Up",
    hasAccount: "Already have an account?",
    signIn: "Sign In",
    errorEmpty: "Please enter your email and password.",
    errorShort: "Password must be at least 6 characters.",
    success: "Check your email to confirm your account!",
    somethingWrong: "Something went wrong",
  },
};

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, updateProfile } = useAuth();
  const { language } = useLanguage();
  const labels = t[language];

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError(labels.errorEmpty);
      return;
    }
    if (password.length < 6) {
      setError(labels.errorShort);
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: signUpError } = await signUp(email.trim(), password, displayName.trim() || undefined);
      if (signUpError) {
        toast.error(signUpError.message);
        setError(signUpError.message);
        return;
      }
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        await updateProfile({ phone: trimmedPhone }).catch(() => {});
      }
      toast.success(labels.success);
      navigate("/login", { replace: true });
    } catch {
      toast.error(labels.somethingWrong);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-shell flex flex-col px-8 py-12 relative font-sans">
      {/* Language Toggle */}
      <div className="absolute top-8 right-8 w-40">
        <LanguageToggle />
      </div>

      <div className="flex flex-col items-center pt-12 pb-6">
        <img
          src={welcomeCyclist}
          alt="Mana Angadi"
          className="rounded-full mb-6 object-contain w-20 h-20"
        />
        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          {labels.heading}
        </h1>
        <p className="mt-2 text-subtitle">{labels.subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        <div>
          <label className="block mb-2 ml-1 label-micro">{labels.nameLabel}</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={labels.namePlaceholder}
            className="input-auth"
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">{labels.emailLabel}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder={labels.emailPlaceholder}
            className="input-auth"
            autoComplete="email"
            required
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
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">{labels.phoneLabel}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={labels.phonePlaceholder}
            className="input-auth"
          />
        </div>

        {error && <p className="text-xs mt-1 px-1 text-destructive">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary-block">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <>
              {labels.signUp}
              <ArrowRight size={20} className="ml-2 inline" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        {labels.hasAccount}{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          {labels.signIn}
        </Link>
      </p>

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}
