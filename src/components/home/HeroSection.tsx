import { useNavigate } from 'react-router-dom';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="px-5 pt-6 pb-2 flex flex-col items-center gap-4">
      <button
        onClick={() => navigate('/home')}
        className="w-full max-w-[280px] py-4 rounded-2xl bg-primary text-primary-foreground text-[16px] font-medium tracking-wide active:scale-[0.98] transition-transform duration-200 touch-manipulation"
      >
        Explore Angadi
      </button>
      <p className="text-[13px] text-muted-foreground tracking-wide">
        Food • Grocery • Pharmacy • More
      </p>
    </section>
  );
}
