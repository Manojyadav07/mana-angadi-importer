import { useEffect } from 'react';

interface WelcomeScreenProps {
  onContinue?: () => void;
}

export function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  useEffect(() => {
    if (!onContinue) return;
    const timer = setTimeout(onContinue, 2500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      className="max-w-md mx-auto h-screen relative flex flex-col items-center justify-center px-10 overflow-hidden"
      style={{ backgroundColor: '#F9F8F4' }}
    >
      {/* Concentric decorative circles */}
      <div className="absolute" style={{ width: 288, height: 288, border: '0.5px solid rgba(45,185,45,0.2)', borderRadius: '9999px' }} />
      <div className="absolute" style={{ width: 256, height: 256, border: '1px solid rgba(45,185,45,0.1)', borderRadius: '9999px' }} />

      {/* Central SVG Illustration - Rural Cart */}
      <svg
        width="224"
        height="224"
        viewBox="0 0 224 224"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 mb-2"
        style={{ color: '#2DB92D' }}
      >
        {/* Ground curve */}
        <path d="M30 180 Q112 195 194 180" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinecap="round" />

        {/* Left wheel */}
        <circle cx="70" cy="168" r="28" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="70" cy="168" r="3" fill="currentColor" />
        {/* Left wheel spokes */}
        <line x1="70" y1="140" x2="70" y2="196" stroke="currentColor" strokeWidth="0.5" />
        <line x1="42" y1="168" x2="98" y2="168" stroke="currentColor" strokeWidth="0.5" />
        <line x1="50" y1="148" x2="90" y2="188" stroke="currentColor" strokeWidth="0.5" />
        <line x1="90" y1="148" x2="50" y2="188" stroke="currentColor" strokeWidth="0.5" />

        {/* Right wheel */}
        <circle cx="154" cy="168" r="28" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="154" cy="168" r="3" fill="currentColor" />
        {/* Right wheel spokes */}
        <line x1="154" y1="140" x2="154" y2="196" stroke="currentColor" strokeWidth="0.5" />
        <line x1="126" y1="168" x2="182" y2="168" stroke="currentColor" strokeWidth="0.5" />
        <line x1="134" y1="148" x2="174" y2="188" stroke="currentColor" strokeWidth="0.5" />
        <line x1="174" y1="148" x2="134" y2="188" stroke="currentColor" strokeWidth="0.5" />

        {/* Cart axle */}
        <line x1="70" y1="168" x2="154" y2="168" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

        {/* Cart body / platform */}
        <path d="M50 140 L50 105 L174 105 L174 140" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="50" y1="140" x2="174" y2="140" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

        {/* Grain sack */}
        <path d="M75 105 L75 70 Q82 58 100 58 Q118 58 125 70 L125 105" stroke="currentColor" strokeWidth="1.8" fill="white" strokeLinecap="round" strokeLinejoin="round" />
        {/* Sack detail lines */}
        <line x1="85" y1="68" x2="85" y2="105" stroke="currentColor" strokeWidth="0.5" />
        <line x1="95" y1="62" x2="95" y2="105" stroke="currentColor" strokeWidth="0.5" />
        <line x1="105" y1="62" x2="105" y2="105" stroke="currentColor" strokeWidth="0.5" />
        <line x1="115" y1="68" x2="115" y2="105" stroke="currentColor" strokeWidth="0.5" />
        {/* Sack horizontal detail */}
        <line x1="78" y1="80" x2="122" y2="80" stroke="currentColor" strokeWidth="0.5" />
        <line x1="76" y1="92" x2="124" y2="92" stroke="currentColor" strokeWidth="0.5" />
        {/* Sack tie */}
        <path d="M88 58 Q100 50 112 58" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />

        {/* Harvest basket */}
        <path d="M135 105 L130 78 Q140 72 160 72 Q170 75 170 78 L165 105" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Basket weave lines */}
        <line x1="138" y1="85" x2="163" y2="85" stroke="currentColor" strokeWidth="0.5" />
        <line x1="136" y1="95" x2="166" y2="95" stroke="currentColor" strokeWidth="0.5" />
        <line x1="142" y1="78" x2="140" y2="105" stroke="currentColor" strokeWidth="0.5" />
        <line x1="150" y1="75" x2="150" y2="105" stroke="currentColor" strokeWidth="0.5" />
        <line x1="158" y1="76" x2="160" y2="105" stroke="currentColor" strokeWidth="0.5" />

        {/* Top harvest / produce details */}
        {/* Leaf shapes above sack */}
        <path d="M95 50 Q100 38 105 50" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M88 52 Q85 42 80 50" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        <path d="M112 52 Q115 42 120 50" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        {/* Small produce circles above basket */}
        <circle cx="145" cy="68" r="4" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="155" cy="66" r="3.5" stroke="currentColor" strokeWidth="1" fill="none" />
        <circle cx="150" cy="62" r="3" stroke="currentColor" strokeWidth="1" fill="none" />
        {/* Small stem */}
        <line x1="150" y1="58" x2="150" y2="52" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
        <path d="M148 53 Q150 48 152 53" stroke="currentColor" strokeWidth="0.5" fill="currentColor" opacity="0.5" />
      </svg>

      {/* Telugu Brand Name */}
      <h1
        className="text-5xl font-bold tracking-tight text-center mb-6 leading-tight"
        style={{ fontFamily: "'Noto Serif Telugu', serif", color: '#1A1A1A' }}
      >
        మన అంగడి
      </h1>

      {/* Telugu Tagline */}
      <p
        className="text-xl font-medium text-center px-2"
        style={{
          fontFamily: "'Noto Serif Telugu', serif",
          color: 'rgba(26, 26, 26, 0.9)',
          lineHeight: 1.6,
          maxWidth: 320,
        }}
      >
        పల్లెటూరి స్వచ్ఛత.. అంగడి భరోసా.. మీ ముంగిట!
      </p>

      {/* Bottom divider + spacing */}
      <div className="absolute flex flex-col items-center" style={{ bottom: 80 }}>
        <div style={{ width: 48, height: 1, backgroundColor: 'rgba(26,26,26,0.2)' }} />
      </div>

      {/* Bottom mobile indicator bar */}
      <div
        className="absolute left-1/2 -translate-x-1/2 rounded-full"
        style={{ bottom: 8, width: 128, height: 4, backgroundColor: 'rgba(26,26,26,0.1)' }}
      />
    </div>
  );
}
