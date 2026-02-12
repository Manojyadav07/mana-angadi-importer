import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowLeft, ArrowRight, Signal, Wifi, BatteryFull, Clock } from "lucide-react";
import culturalTextile from "@/assets/cultural-textile.jpg";
import culturalPaddy from "@/assets/cultural-paddy.jpg";
import culturalPottery from "@/assets/cultural-pottery.jpg";

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
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d?$/.test(value)) return;
      const next = [...digits];
      next[index] = value;
      setDigits(next);
      if (value && index < 3) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const code = digits.join("");
  const isComplete = code.length === 4;

  const handleSubmit = () => {
    if (isComplete) onVerify(code);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F9F8F4" }}>
      {/* Device Frame */}
      <div
        className="relative flex flex-col overflow-hidden mx-auto w-full"
        style={{
          maxWidth: 400,
          minHeight: 812,
          backgroundColor: "#F9F8F4",
          borderRadius: "3rem",
          border: "8px solid rgba(26,26,26,0.05)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Dotted background pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.03,
            backgroundImage:
              "radial-gradient(circle, #1A1A1A 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-8" style={{ height: 48 }}>
          <span
            className="font-semibold"
            style={{ fontSize: 14, color: "#1A1A1A" }}
          >
            9:41
          </span>
          <div className="flex items-center gap-1.5">
            <Signal size={16} style={{ color: "#1A1A1A" }} />
            <Wifi size={16} style={{ color: "#1A1A1A" }} />
            <BatteryFull size={16} style={{ color: "#1A1A1A" }} />
          </div>
        </div>

        {/* Back Button */}
        <div className="p-6">
          <button
            type="button"
            onClick={onChangePhone}
            className="flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              width: 48,
              height: 48,
              borderRadius: "9999px",
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(26,26,26,0.05)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <ArrowLeft size={20} style={{ color: "#1A1A1A" }} />
          </button>
        </div>

        {/* Header Content */}
        <div className="flex flex-col items-center px-6">
          {/* Brand Pill */}
          <div
            className="mb-6 font-bold uppercase"
            style={{
              fontSize: 10,
              letterSpacing: "0.2em",
              padding: "6px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(45,185,45,0.2)",
              backgroundColor: "rgba(45,185,45,0.05)",
              color: "#2DB92D",
            }}
          >
            MANA ANGADI
          </div>

          {/* Title */}
          <h1
            className="font-medium italic leading-tight text-center"
            style={{
              fontFamily: "'Newsreader', serif",
              fontSize: 32,
              color: "#1A1A1A",
            }}
          >
            Verify your Number
          </h1>

          {/* Subtitle */}
          <p
            className="mt-4 text-center leading-relaxed"
            style={{
              fontSize: 18,
              color: "#757575",
              maxWidth: 240,
            }}
          >
            We've sent a 4-digit code to your mobile.
          </p>
        </div>

        {/* OTP Inputs */}
        <div className="flex justify-between gap-3 px-12 mt-10">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="text-center font-medium transition-colors"
              style={{
                width: 64,
                height: 80,
                fontSize: 28,
                borderRadius: "0.75rem",
                border: d
                  ? "2px solid #2DB92D"
                  : "2px solid rgba(26,26,26,0.05)",
                backgroundColor: "#FFFFFF",
                color: "#1A1A1A",
                outline: "none",
                WebkitTapHighlightColor: "transparent",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#2DB92D";
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.style.borderColor = "rgba(26,26,26,0.05)";
                }
              }}
            />
          ))}
        </div>

        {/* Countdown + Resend */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2" style={{ color: "#757575" }}>
            <Clock size={18} />
            <span>
              Resend code in{" "}
              <span
                className="italic font-medium"
                style={{ color: "#2DB92D" }}
              >
                {formatTime(resendCountdown)}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={onChangePhone}
            className="font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
            style={{
              color: "#2DB92D",
              textDecorationColor: "rgba(45,185,45,0.3)",
            }}
          >
            Edit Phone Number
          </button>
        </div>

        {/* Cultural Image Strip */}
        <div className="flex justify-center gap-3 mt-10" style={{ opacity: 0.6 }}>
          <img
            src={culturalTextile}
            alt="Rural textile"
            className="object-cover rotate-3"
            style={{
              width: 80,
              height: 80,
              borderRadius: "1rem",
              border: "2px solid white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          />
          <img
            src={culturalPaddy}
            alt="Paddy fields"
            className="object-cover -rotate-6"
            style={{
              width: 80,
              height: 80,
              borderRadius: "1rem",
              border: "2px solid white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          />
          <img
            src={culturalPottery}
            alt="Village pottery"
            className="object-cover rotate-6"
            style={{
              width: 80,
              height: 80,
              borderRadius: "1rem",
              border: "2px solid white",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          />
        </div>

        {/* Verify Button */}
        <div className="px-6 mt-auto mb-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete || isSubmitting}
            className="w-full flex items-center justify-center gap-3 font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#2DB92D",
              color: "#FFFFFF",
              padding: "20px 0",
              borderRadius: "9999px",
              fontSize: 18,
              boxShadow: "0 20px 25px -5px rgba(45,185,45,0.15)",
            }}
          >
            {isSubmitting ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                Verify &amp; Enter
                <ArrowRight size={20} style={{ color: "#FFFFFF" }} />
              </>
            )}
          </button>
        </div>

        {/* Home Indicator */}
        <div className="flex justify-center mb-2">
          <div
            className="rounded-full"
            style={{
              width: 128,
              height: 6,
              backgroundColor: "rgba(26,26,26,0.1)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
