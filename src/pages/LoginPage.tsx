import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Loader2 } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";
import { toast } from "sonner";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
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
      toast.success("Logged in!");
      navigate("/home", { replace: true });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="screen-shell flex flex-col px-8 py-12 relative font-sans">
      {/* Header */}
      <div className="flex flex-col items-center pt-16 pb-8">
        <img
          src={welcomeCyclist}
          alt="Mana Angadi"
          className="rounded-full mb-6 object-contain w-20 h-20"
        />
        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          Welcome Back
        </h1>
        <p className="mt-2 text-subtitle">SIGN IN TO MANA ANGADI</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-4">
        <div>
          <label className="block mb-2 ml-1 label-micro">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="you@example.com"
            className="input-auth"
            autoComplete="email"
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="Enter password"
            className="input-auth"
            autoComplete="current-password"
          />
        </div>

        {error && <p className="text-xs mt-1 px-1 text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-primary-block">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <>
              Sign In
              <ArrowRight size={20} className="ml-2 inline" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Sign Up
        </Link>
      </p>

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}
