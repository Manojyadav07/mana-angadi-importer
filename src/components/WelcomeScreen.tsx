export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="max-w-md mx-auto h-screen relative flex flex-col items-center justify-between py-20 px-10 overflow-hidden"
      style={{ backgroundColor: '#F9F8F4', color: '#1A1A1A' }}
    >
      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="flex flex-col items-center text-center">
        {/* Decorative concentric circles */}
        <div className="flex items-center justify-center w-72 h-72 mb-16">
          <div className="absolute w-72 h-72 border-[0.5px] rounded-full" style={{ borderColor: 'rgba(45,185,45,0.2)' }} />
          <div className="absolute w-64 h-64 border-[1px] rounded-full" style={{ borderColor: 'rgba(45,185,45,0.1)' }} />
        </div>

        {/* Brand Heading */}
        <h1
          className="text-5xl font-bold tracking-tight text-center mb-6 leading-tight"
          style={{ fontFamily: "'Noto Serif Telugu', serif", color: '#1A1A1A' }}
        >
          మన అంగడి
        </h1>

        {/* Tagline */}
        <p
          className="text-xl font-medium text-center px-2 max-w-[320px]"
          style={{ fontFamily: "'Noto Serif Telugu', serif", color: 'rgba(26,26,26,0.9)', lineHeight: 1.6 }}
        >
          పల్లెటూరి స్వచ్ఛత.. అంగడి భరోసా.. మీ ముంగిట!
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center gap-12">
        {/* Divider */}
        <div className="w-12 h-[1px]" style={{ backgroundColor: 'rgba(26,26,26,0.2)' }} />

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="w-full max-w-[320px] py-5 px-6 rounded-full text-xl font-semibold active:scale-[0.98] transition-all"
          style={{
            backgroundColor: '#2DB92D',
            color: '#FFFFFF',
            fontFamily: "'Noto Serif Telugu', serif",
            boxShadow: '0 10px 15px -3px rgba(45,185,45,0.2)',
          }}
        >
          అంగడిని అన్వేషించండి
        </button>
      </div>

      {/* Bottom mobile indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full" style={{ backgroundColor: 'rgba(26,26,26,0.1)' }} />
    </div>
  );
}
