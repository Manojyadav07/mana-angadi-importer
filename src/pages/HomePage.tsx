import { MobileLayout } from '@/components/layout/MobileLayout';
import { TopBar } from '@/components/home/TopBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AvailabilityStrip } from '@/components/home/AvailabilityStrip';

export function HomePage() {
  return (
    <MobileLayout>
      <TopBar />
      <div className="mt-2">
        <CategoryGrid />
        <AvailabilityStrip />
      </div>
      <div className="h-6" />
    </MobileLayout>
  );
}
