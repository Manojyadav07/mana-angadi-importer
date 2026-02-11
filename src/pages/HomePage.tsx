import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { PromotionStrip } from '@/components/home/PromotionStrip';
import { VillageShops } from '@/components/home/VillageShops';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <HeroSection />
      <CategoryGrid />
      <PromotionStrip />
      <VillageShops />
    </MobileLayout>
  );
}
