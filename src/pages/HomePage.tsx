import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { ActionGrid } from '@/components/home/ActionGrid';
import { AvailabilityStrip } from '@/components/home/AvailabilityStrip';
import { TrustSection } from '@/components/home/TrustSection';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <div className="mt-2">
        <ActionGrid />
        <AvailabilityStrip />
        <TrustSection />
      </div>
      {/* Spacer for comfortable scroll */}
      <div className="h-6" />
    </MobileLayout>
  );
}
