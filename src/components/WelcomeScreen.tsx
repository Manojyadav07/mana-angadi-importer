import welcomeCyclist from "@/assets/welcome-cyclist.png";

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-md mx-auto h-[100dvh] relative flex flex-col items-center justify-between py-12 sm:py-16 px-6 sm:px-10 overflow-hidden bg-mana-cream text-mana-charcoal">
      {/* Top spacer */}
      <div />

      {/* Center content */}
      <div className="flex flex-col items-center text-center">
        {/* Decorative concentric circles with logo */}
        <div
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 mb-8 sm:mb-12"
          style={{ borderColor: "rgba(45,185,45,0.25)", boxShadow: "0 8px 24px rgba(45,185,45,0.15)" }}
        >
          <img src={welcomeCyclist} alt="Mana Angadi" className="w-full h-full object-cover" />
        </div>

        {/* Brand Heading */}
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-center mb-4 leading-tight text-foreground">
          మన అంగడి
        </h1>

        {/* Tagline */}
        <p className="font-display text-base sm:text-lg font-medium text-center px-2 max-w-[280px] sm:max-w-[320px] text-foreground/90 leading-relaxed">
          పల్లెటూరి స్వచ్ఛత.. అంగడి భరోసా.. మీ ముంగిట!
        </p>
      </div>

      {/* Bottom section */}
      <div className="w-full flex flex-col items-center gap-8 sm:gap-10">
        {/* Divider */}
        <div className="w-10 h-[1px] bg-foreground/20" />

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="w-full max-w-[280px] sm:max-w-[320px] py-4 px-6 rounded-full text-base sm:text-lg font-semibold active:scale-[0.98] transition-all bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-display"
        >
          అంగడిని అన్వేషించండి
        </button>
      </div>

      {/* Bottom mobile indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 rounded-full bg-foreground/10" />
    </div>
  );
}
