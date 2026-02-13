export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div
      className="max-w-md mx-auto h-[100dvh] relative flex flex-col items-center justify-between py-12 sm:py-16 px-6 sm:px-10 overflow-hidden"
      style={{ backgroundColor: '#F9F8F4', color: '#1A1A1A' }}
    >
      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="flex flex-col items-center text-center">
        {/* Decorative concentric circles */}
        <div className="relative flex items-center justify-center w-48 h-48 sm:w-60 sm:h-60 mb-8 sm:mb-12">
          <div className="absolute w-48 h-48 sm:w-60 sm:h-60 border-[0.5px] rounded-full" style={{ borderColor: 'rgba(45,185,45,0.2)' }} />
          <div className="absolute w-40 h-40 sm:w-52 sm:h-52 border-[1px] rounded-full" style={{ borderColor: 'rgba(45,185,45,0.1)' }} />
        </div>

        {/* Brand Heading */}
        <h1
          className="text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4 leading-tight"
          style={{ fontFamily: "'Noto Serif Telugu', serif", color: '#1A1A1A' }}
        >
          మన అంగడి
        </h1>

        {/* Tagline */}
        <p
          className="text-base sm:text-lg font-medium text-center px-2 max-w-[280px] sm:max-w-[320px]"
          style={{ fontFamily: "'Noto Serif Telugu', serif", color: 'rgba(26,26,26,0.9)', lineHeight: 1.6 }}
        >
          పల్లెటూరి స్వచ్ఛత.. అంగడి భరోసా.. మీ ముంగిట!
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center gap-8 sm:gap-10">
        {/* Divider */}
        <div className="w-10 h-[1px]" style={{ backgroundColor: 'rgba(26,26,26,0.2)' }} />

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="w-full max-w-[280px] sm:max-w-[320px] py-4 px-6 rounded-full text-base sm:text-lg font-semibold active:scale-[0.98] transition-all"
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
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full" style={{ backgroundColor: 'rgba(26,26,26,0.1)' }} />
    </div>
  );
}
