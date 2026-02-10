import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { ActionRows } from '@/components/home/ActionRows';
import { CommunityUpdates } from '@/components/home/CommunityUpdates';
import { MerchantPromotion } from '@/components/home/MerchantPromotion';
import { VillageShops } from '@/components/home/VillageShops';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <ActionRows />
      <CommunityUpdates />
      <MerchantPromotion />
      <VillageShops />
    </MobileLayout>
  );
}
