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
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: "#F9F8F4", color: "#1A1A1A", fontFamily: "'Newsreader', serif" }}
    >
      {/* Dotted background pattern */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          opacity: 0.02,
          backgroundImage: "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Sticky Top Nav */}
      <div
        className="sticky top-0 w-full px-6 py-4 flex items-center justify-between z-10"
        style={{ backgroundColor: "rgba(249,248,244,0.8)", backdropFilter: "blur(8px)" }}
      >
        <button
          type="button"
          onClick={onChangePhone}
          className="w-10 h-10 flex items-center justify-center"
        >
          <ArrowLeft size={24} color="#1A1A1A" />
        </button>

        <span
          className="absolute left-1/2 -translate-x-1/2 font-bold uppercase"
          style={{ fontSize: 10, letterSpacing: "0.3em", color: "rgba(26,26,26,0.4)" }}
        >
          MANA ANGADI
        </span>

        <div className="w-10" />
      </div>

      {/* Main content */}
      <div className="max-w-lg mx-auto w-full flex flex-col px-6 pb-10 flex-1">
        {/* Header */}
        <div className="mt-8 mb-12 text-center">
          <h1
            className="font-medium italic leading-tight"
            style={{ fontSize: 32, color: "#1A1A1A" }}
          >
            Verify your Number
          </h1>
          <p
            className="mt-4 text-lg leading-relaxed mx-auto"
            style={{ color: "#757575", maxWidth: 280 }}
          >
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
              className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-medium rounded-xl bg-white transition-all outline-none"
              style={{
                border: `1px solid ${digit ? "#2DB92D" : "rgba(26,26,26,0.1)"}`,
                color: "#1A1A1A",
                WebkitTapHighlightColor: "transparent",
              }}
              onFocus={(e) => {
                e.target.style.border = "1px solid #2DB92D";
                e.target.style.boxShadow = "0 0 0 3px rgba(45,185,45,0.15)";
              }}
              onBlur={(e) => {
                e.target.style.border = `1px solid ${digit ? "#2DB92D" : "rgba(26,26,26,0.1)"}`;
                e.target.style.boxShadow = "none";
              }}
            />
          ))}
        </div>

        {/* Resend + Edit */}
        <div className="space-y-6 text-center mb-12">
          <div className="flex items-center justify-center gap-2" style={{ color: "#2DB92D" }}>
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
              className="text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              style={{ color: "#2DB92D", textDecorationColor: "rgba(45,185,45,0.3)" }}
            >
              Resend Code
            </button>
          ) : (
            <button
              type="button"
              onClick={onChangePhone}
              className="text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-80"
              style={{ color: "#2DB92D", textDecorationColor: "rgba(45,185,45,0.3)" }}
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
              className="w-5 h-5 rounded border cursor-pointer mt-0.5 accent-[#2DB92D]"
              style={{ borderColor: "rgba(26,26,26,0.2)" }}
            />
            <span className="text-sm leading-relaxed" style={{ color: "#757575" }}>
              By proceeding, I agree to the{" "}
              <span className="underline underline-offset-2 font-medium" style={{ color: "#1A1A1A" }}>
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2 font-medium" style={{ color: "#1A1A1A" }}>
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
            className="w-full flex items-center justify-center gap-3 text-lg font-medium text-white rounded-full transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#2DB92D",
              padding: "20px 0",
              boxShadow: "0 20px 25px -5px rgba(45,185,45,0.2)",
            }}
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
        <div className="w-32 h-1.5 rounded-full" style={{ backgroundColor: "rgba(26,26,26,0.1)" }} />
      </div>
    </div>
  );
}
