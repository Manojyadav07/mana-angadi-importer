import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { ActionRows } from '@/components/home/ActionRows';
import { VillageShops } from '@/components/home/VillageShops';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <ActionRows />
      <VillageShops />
    </MobileLayout>
  );
}
