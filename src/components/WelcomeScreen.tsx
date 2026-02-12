import { useEffect } from 'react';

interface WelcomeScreenProps {
  onContinue?: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  // Auto-dismiss after 2.5 seconds
  useEffect(() => {
    if (!onContinue) return;
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      className="max-w-md mx-auto h-screen flex flex-col items-center justify-center px-8 relative overflow-hidden"
      style={{ backgroundColor: '#F9F8F4' }}
    >
      {/* Logo */}
      <div className="mb-6">
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ color: '#2DB92D' }}
        >
          <path
            d="M16 76V28L48 52L80 28V76"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M48 38C48 38 42 48 48 58C54 48 48 38 48 38Z"
            fill="currentColor"
          />
          <path
            d="M40 42C40 42 34 50 40 58C46 50 40 42 40 42Z"
            fill="currentColor"
            opacity="0.7"
          />
          <path
            d="M56 42C56 42 50 50 56 58C62 50 56 42 56 42Z"
            fill="currentColor"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* Brand Name */}
      <h1
        className="text-5xl font-bold tracking-tight text-center mb-4"
        style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1A1A1A' }}
      >
        Mana Angadi
      </h1>

      {/* Tagline */}
      <p
        className="text-lg italic tracking-wide text-center"
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          color: 'rgba(26, 26, 26, 0.6)',
        }}
      >
        Rooted in heritage, delivered with care.
      </p>

      {/* Progress Line Indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: '96px',
          width: '48px',
          height: '2px',
          backgroundColor: 'rgba(26, 26, 26, 0.05)',
        }}
      >
        <div
          className="rounded-full h-full"
          style={{
            width: '50%',
            backgroundColor: 'rgba(45, 185, 45, 0.4)',
          }}
        />
      </div>

      {/* Bottom Home Indicator Bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{
          bottom: '8px',
          width: '128px',
          height: '4px',
          backgroundColor: 'rgba(26, 26, 26, 0.1)',
        }}
      />
    </div>
  );
}
