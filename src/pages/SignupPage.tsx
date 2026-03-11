// src/pages/SignupPage.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAllVillages } from "@/hooks/useVillageFees";
import { Eye, EyeOff, User, Phone, MapPin, Mail, Lock, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

const sb = supabase as any;

export function SignupPage() {
  const navigate = useNavigate();
  const { data: villages, isLoading: villagesLoading } = useAllVillages();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [villageId, setVillageId] = useState("");

  // Step 2 fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Step 1 validation ────────────────────────────────────────
  const handleStep1 = () => {
    if (!displayName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!villageId) {
      toast.error("Please select your village");
      return;
    }
    setStep(2);
  };

  // ── Final submit ─────────────────────────────────────────────
  const handleSignup = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed — no user returned");

      // 2. Upsert profile with village + phone
      //    (Supabase trigger may have already created the row)
      const { error: profileError } = await sb
        .from("profiles")
        .upsert({
          id:           authData.user.id,
          display_name: displayName.trim(),
          phone:        phone.trim(),
          village_id:   villageId,
          roles:        ["customer"],
        });

      if (profileError) throw profileError;

      toast.success("Account created! Please check your email to verify.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const selectedVillage = villages?.find((v) => v.id === villageId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-black text-sm">MA</span>
          </div>
          <span className="text-base font-black text-foreground tracking-tight">మన అంగడి</span>
        </div>

        <h1 className="text-3xl font-black text-foreground leading-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 1 ? "Tell us about yourself" : "Set up your login credentials"}
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-black text-primary-foreground">1</span>
            </div>
            <span className={`text-xs font-semibold ${step === 1 ? "text-primary" : "text-muted-foreground"}`}>
              Your Info
            </span>
          </div>
          <div className="flex-1 h-0.5 bg-border rounded-full">
            <div className={`h-full bg-primary rounded-full transition-all duration-300 ${step === 2 ? "w-full" : "w-0"}`} />
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${step === 2 ? "bg-primary" : "bg-muted"}`}>
              <span className={`text-[10px] font-black ${step === 2 ? "text-primary-foreground" : "text-muted-foreground"}`}>2</span>
            </div>
            <span className={`text-xs font-semibold ${step === 2 ? "text-primary" : "text-muted-foreground"}`}>
              Login Setup
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-5 pb-10 space-y-4">

        {/* ── STEP 1 ────────────────────────────────── */}
        {step === 1 && (
          <>
            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Raju Yadav"
                  autoComplete="name"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ""))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Village */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Your Village *</label>
              <p className="text-[11px] text-muted-foreground mb-2">
                We use this to calculate delivery fees and dispatch schedules
              </p>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <select
                  value={villageId}
                  onChange={(e) => setVillageId(e.target.value)}
                  disabled={villagesLoading}
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                >
                  <option value="">
                    {villagesLoading ? "Loading villages..." : "Select your village"}
                  </option>
                  {(villages ?? []).map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village fee info card */}
              {selectedVillage && (
                <div className="mt-2 bg-teal-50 border border-teal-200 rounded-xl px-3 py-2.5 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-teal-700">{selectedVillage.name}</p>
                    <p className="text-[11px] text-teal-600">
                      Delivery fee ₹{selectedVillage.delivery_fee} · Min order ₹{selectedVillage.minimum_order}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStep1}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-2xl text-base active:scale-95 transition-transform mt-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ── STEP 2 ────────────────────────────────── */}
        {step === 2 && (
          <>
            {/* Summary of step 1 */}
            <div className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{phone} · {selectedVillage?.name}</p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-primary flex-shrink-0"
              >
                Edit
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className="w-full bg-card border border-border rounded-xl pl-9 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength */}
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${
                        password.length >= level * 2
                          ? password.length < 4 ? "bg-red-400"
                            : password.length < 6 ? "bg-amber-400"
                            : "bg-green-400"
                          : "bg-muted"
                      }`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {password.length < 4 ? "Weak" : password.length < 6 ? "Fair" : "Strong"}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Confirm Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full bg-card border rounded-xl pl-9 pr-10 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400"
                      : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground active:scale-90 transition-transform"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[11px] text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleSignup}
              disabled={loading || !email || !password || !confirmPassword}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-2xl text-base active:scale-95 transition-transform mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full text-sm text-muted-foreground py-2 active:opacity-70 transition-opacity"
            >
              ← Back
            </button>
          </>
        )}

        {/* Sign in link */}
        <p className="text-center text-sm text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link to="/auth" className="text-primary font-bold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}