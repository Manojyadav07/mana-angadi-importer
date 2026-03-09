import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { MerchantBottomNav } from './MerchantBottomNav';
import { DeliveryBottomNav } from './DeliveryBottomNav';
import { AdminBottomNav } from './AdminBottomNav';

interface MobileLayoutProps {
  children: ReactNode;
  showNav?: boolean;
  navType?: 'customer' | 'merchant' | 'delivery' | 'admin';
}

export function MobileLayout({ children, showNav = true, navType = 'customer' }: MobileLayoutProps) {
  return (
    <div className="mobile-container bg-background min-h-screen">
      <main className={showNav ? 'safe-bottom' : ''}>
        {children}
      </main>
      {showNav && navType === 'customer'  && <BottomNav />}
      {showNav && navType === 'merchant'  && <MerchantBottomNav />}
      {showNav && navType === 'delivery'  && <DeliveryBottomNav />}
      {showNav && navType === 'admin'     && <AdminBottomNav />}
    </div>
  );
}