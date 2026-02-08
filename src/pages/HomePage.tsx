import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { AvailabilitySection } from '@/components/home/AvailabilitySection';
import { ActionRows } from '@/components/home/ActionRows';
import { GamppaSection } from '@/components/home/GamppaSection';
import { VillageShops } from '@/components/home/VillageShops';
import { SectionDivider } from '@/components/home/SectionDivider';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <AvailabilitySection />
      <SectionDivider />
      <ActionRows />
      <SectionDivider />
      <GamppaSection />
      <SectionDivider />
      <VillageShops />
      <div className="h-4" />
    </MobileLayout>
  );
}
