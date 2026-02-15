import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

interface OtpVerifyScreenProps {
  phone: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangePhone: () => void;
  isSubmitting: boolean;
  resendCountdown: number;
}

export function OtpVerifyScreen({
  phone,
  onVerify,
  onResend,
  onChangePhone,
  isSubmitting,
  resendCountdown,
}: OtpVerifyScreenProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [agreed, setAgreed] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = () => {
    const code = digits.join("");
    if (code.length === 6) onVerify(code);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const allFilled = digits.every((d) => d !== "");

  return (
    <div className="min-h-screen flex flex-col relative bg-mana-cream text-mana-charcoal font-display">
      {/* Dotted background pattern */}
      <div className="dotted-bg" />

      {/* Sticky Top Nav */}
      <div className="sticky-nav">
        <button
          type="button"
          onClick={onChangePhone}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>

        <span className="absolute left-1/2 -translate-x-1/2 label-brand">
          MANA ANGADI
        </span>

        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto w-full flex flex-col px-6 pb-10 flex-1">
        {/* Header */}
        <div className="mt-8 mb-12 text-center">
          <h1 className="font-medium italic leading-tight text-[32px] text-foreground">
            Verify your Number
          </h1>
          <p className="mt-4 text-lg leading-relaxed mx-auto max-w-[280px] text-muted-foreground">
            We've sent a 6-digit code to your mobile number.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-10" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={digit ? "input-otp-cell-filled" : "input-otp-cell"}
            />
          ))}
        </div>

        {/* Resend + Edit */}
        <div className="space-y-6 text-center mb-12">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Clock size={18} />
            <span className="text-base font-medium">
              Resend code in{" "}
              <span className="italic">{formatTime(resendCountdown)}</span>
            </span>
          </div>

          {resendCountdown <= 0 ? (
            <button
              type="button"
              onClick={onResend}
              className="text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80 text-primary decoration-primary/30"
            >
              Resend Code
            </button>
          ) : (
            <button
              type="button"
              onClick={onChangePhone}
              className="text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80 text-primary decoration-primary/30"
            >
              Edit Phone Number
            </button>
          )}
        </div>

        {/* Consent */}
        <div className="space-y-8">
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="checkbox-primary-lg mt-0.5"
            />
            <span className="text-sm leading-relaxed text-muted-foreground">
              By proceeding, I agree to the{" "}
              <span className="underline underline-offset-2 font-medium text-foreground">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2 font-medium text-foreground">
                Privacy Policy
              </span>
              .
            </span>
          </label>

          {/* Primary Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allFilled || isSubmitting}
            className="btn-primary-pill"
          >
            {isSubmitting ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                Verify &amp; Enter
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        <div className="h-6" />
      </div>

      {/* Bottom indicator */}
      <div className="flex justify-center pb-2 mt-auto">
        <div className="home-indicator h-1.5" />
      </div>
    </div>
  );
}
