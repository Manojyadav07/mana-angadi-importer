import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Loader2 } from "lucide-react";
import welcomeCyclist from "@/assets/welcome-cyclist.png";
import { toast } from "sonner";

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp, updateProfile } = useAuth();

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
      setError("Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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
      // Store phone in profile if provided (after signup creates the session)
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        await updateProfile({ phone: trimmedPhone }).catch(() => {});
      }
      toast.success("Check your email to confirm your account!");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-shell flex flex-col px-8 py-12 relative font-sans">
      <div className="flex flex-col items-center pt-12 pb-6">
        <img
          src={welcomeCyclist}
          alt="Mana Angadi"
          className="rounded-full mb-6 object-contain w-20 h-20"
        />
        <h1 className="font-light italic tracking-tight text-4xl text-foreground font-display">
          Create Account
        </h1>
        <p className="mt-2 text-subtitle">JOIN MANA ANGADI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        <div>
          <label className="block mb-2 ml-1 label-micro">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="input-auth"
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            placeholder="you@example.com"
            className="input-auth"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            placeholder="Min 6 characters"
            className="input-auth"
            autoComplete="new-password"
            required
          />
        </div>

        <div>
          <label className="block mb-2 ml-1 label-micro">Phone (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            className="input-auth"
          />
        </div>

        {error && <p className="text-xs mt-1 px-1 text-destructive">{error}</p>}

        <button type="submit" disabled={isSubmitting} className="btn-primary-block">
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
          ) : (
            <>
              Sign Up
              <ArrowRight size={20} className="ml-2 inline" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{" "}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign In
        </Link>
      </p>

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}
