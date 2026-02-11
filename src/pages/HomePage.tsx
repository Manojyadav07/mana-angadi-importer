import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { PromotionStrip } from '@/components/home/PromotionStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { VillageShops } from '@/components/home/VillageShops';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <PromotionStrip />
      <CategoryGrid />
      <VillageShops />
    </MobileLayout>
  );
}
