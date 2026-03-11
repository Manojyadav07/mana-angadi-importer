// src/pages/SignupPage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAllVillages } from "@/hooks/useVillageFees";
import { toast } from "sonner";
import {
  User, Phone, MapPin, Mail, Lock,
  Eye, EyeOff, ChevronRight, Loader2,
} from "lucide-react";

const sb = supabase as any;

function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8)              score++;
  if (/[A-Z]/.test(p))           score++;
  if (/[0-9]/.test(p))           score++;
  if (/[^A-Za-z0-9]/.test(p))   score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "bg-red-500", "bg-amber-400", "bg-blue-400", "bg-green-500"];

export function SignupPage() {
  const navigate = useNavigate();
  const { data: villages, isLoading: villagesLoading } = useAllVillages();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1
  const [displayName, setDisplayName] = useState("");
  const [phone,       setPhone]       = useState("");
  const [villageId,   setVillageId]   = useState("");

  // Step 2
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);

  const [loading, setLoading] = useState(false);

  const strength      = passwordStrength(password);
  const selectedVillage = (villages ?? []).find((v: any) => v.id === villageId);

  // ── Step 1 validation ────────────────────────────────────────
  const handleStep1 = () => {
    if (!displayName.trim()) {
      toast.error("Please enter your full name"); return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit phone number"); return;
    }
    if (!villageId) {
      toast.error("Please select your village"); return;
    }
    setStep(2);
  };

  // ── Final submit ─────────────────────────────────────────────
  const handleSignup = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email"); return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match"); return;
    }

    setLoading(true);
    try {
      // 1. Create auth user — trigger auto-creates profile row
      const { data: authData, error: authError } = await sb.auth.signUp({
        email:    email.trim().toLowerCase(),
        password,
        options: {
          data: { display_name: displayName.trim() },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed — no user returned");

      // 2. Upsert profile to add village + phone
      //    trigger already inserted the row, so this is always an update
      const { error: profileError } = await sb
        .from("profiles")
        .upsert(
          {
            id:           authData.user.id,
            display_name: displayName.trim(),
            phone:        phone.trim(),
            village_id:   villageId,
            roles:        ["customer"],
          },
          { onConflict: "id" }
        );

      if (profileError) {
        // Non-fatal — trigger already created the row
        // log but don't block the user
        console.warn("Profile upsert warning:", profileError.message);
      }

      toast.success("Account created! Please check your email to verify.");
      navigate("/auth");
    } catch (err: any) {
      toast.error(err.message ?? "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Header ── */}
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
          <div className="flex-1 h-0.5 bg-border rounded-full overflow-hidden">
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

      {/* ── Form ── */}
      <div className="flex-1 px-5 pb-10 space-y-4">

        {/* ══ STEP 1 ══ */}
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
                  className="input-village pl-9"
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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  inputMode="numeric"
                  className="input-village pl-9"
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
                  className="input-village pl-9 appearance-none"
                >
                  <option value="">
                    {villagesLoading ? "Loading villages..." : "Select your village"}
                  </option>
                  {(villages ?? []).map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} {v.towns?.name ? `· ${v.towns.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Village fee info card */}
              {selectedVillage && (
                <div className="mt-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-foreground">{selectedVillage.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Delivery fee: ₹{selectedVillage.delivery_fee} · Min order: ₹{selectedVillage.minimum_order}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Tier {selectedVillage.tier}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleStep1}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-xl text-sm active:scale-95 transition-transform mt-2"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-bold">
                Sign in
              </button>
            </p>
          </>
        )}

        {/* ══ STEP 2 ══ */}
        {step === 2 && (
          <>
            {/* Summary of step 1 */}
            <div className="bg-muted/50 rounded-xl px-3 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-foreground">{displayName}</p>
                <p className="text-[11px] text-muted-foreground">
                  {phone} · {selectedVillage?.name ?? ""}
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-primary font-bold"
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
                  placeholder="yourname@gmail.com"
                  autoComplete="email"
                  inputMode="email"
                  className="input-village pl-9"
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
                  placeholder="Min 6 characters"
                  autoComplete="new-password"
                  className="input-village pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex-1 flex gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength ? STRENGTH_COLORS[strength] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    {STRENGTH_LABELS[strength]}
                  </span>
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
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={`input-village pl-9 pr-10 ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-400 focus:ring-red-300"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-black py-3.5 rounded-xl text-sm active:scale-95 transition-transform disabled:opacity-60 mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                : "Create Account"
              }
            </button>

            <p className="text-center text-xs text-muted-foreground pt-2">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-bold">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}