import welcomeLogo from '@/assets/welcome-logo.png';

export function WelcomeScreen() {
  return (
    <div className="max-w-md mx-auto h-screen relative flex flex-col items-center justify-center px-10 overflow-hidden bg-[#F9F8F4]">
      {/* Center Illustration Block */}
      <div className="flex flex-col items-center text-center w-full mb-16">
        {/* Concentric decorative rings */}
        <div className="absolute w-72 h-72 border-[0.5px] border-[#2DB92D]/20 rounded-full" />
        <div className="absolute w-64 h-64 border-[1px] border-[#2DB92D]/10 rounded-full" />

        {/* Central Logo Image */}
        <img
          src={welcomeLogo}
          alt="మన అంగడి"
          className="relative z-10 w-56 h-56 object-contain"
        />
      </div>

      {/* Telugu Brand Name */}
      <h1
        className="text-5xl font-bold tracking-tight text-center mb-6 leading-tight"
        style={{ fontFamily: "'Noto Serif Telugu', serif", color: '#1A1A1A' }}
      >
        మన అంగడి
      </h1>

      {/* Telugu Tagline */}
      <p
        className="text-xl font-medium text-center px-2 max-w-[320px] leading-[1.6]"
        style={{ fontFamily: "'Noto Serif Telugu', serif", color: 'rgba(26, 26, 26, 0.9)' }}
      >
        పల్లెటూరి స్వచ్ఛత.. అంగడి భరోసా.. మీ ముంగిట!
      </p>

      {/* Bottom divider section */}
      <div className="absolute bottom-20 w-full flex flex-col items-center px-6">
        <div className="w-12 h-[1px] bg-[#1A1A1A]/20 mb-6" />
      </div>

      {/* Bottom mobile indicator bar */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#1A1A1A]/10 rounded-full" />
    </div>
  );
}
