import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { ActionRows } from '@/components/home/ActionRows';
import { VillageShops } from '@/components/home/VillageShops';
import { SectionDivider } from '@/components/home/SectionDivider';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <ActionRows />
      <SectionDivider />
      <VillageShops />
      <div className="h-4" />
    </MobileLayout>
  );
}
