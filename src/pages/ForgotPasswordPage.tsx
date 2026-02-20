import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) {
        toast.error(error.message);
        return;
      }
      setSent(true);
      toast.success("Reset link sent!");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-shell flex flex-col px-8 py-12 font-sans">
      <Link to="/login" className="flex items-center gap-2 text-sm text-primary mb-8">
        <ArrowLeft size={18} /> Back to Login
      </Link>

      <h1 className="text-3xl font-display font-light italic text-foreground mb-2">
        Forgot Password
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Enter your email and we'll send you a reset link.
      </p>

      {sent ? (
        <div className="text-center space-y-4 mt-8">
          <Mail className="w-12 h-12 mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to <strong>{email}</strong>. Check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 ml-1 label-micro">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-auth"
              autoComplete="email"
              required
            />
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary-block">
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>
      )}

      <div className="mt-auto pt-10 flex justify-center">
        <div className="home-indicator" />
      </div>
    </div>
  );
}
