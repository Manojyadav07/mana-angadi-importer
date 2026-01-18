import { useState } from 'react';
import { Order, OrderStatus, getShopTypeIcon } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { OrderStatusStepper } from './OrderStatusStepper';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from '@/components/ui/sheet';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from '@/components/ui/drawer';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  MapPin,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MerchantOrderDetailSheetProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string, reason_te: string, reason_en: string) => void;
  onMarkReady: (orderId: string) => void;
}

const rejectionReasons = [
  { te: 'వస్తువులు అందుబాటులో లేవు', en: 'Items not available', icon: Package },
  { te: 'దుకాణం మూసి ఉంది', en: 'Shop closed', icon: AlertCircle },
  { te: 'ఇప్పుడు నెరవేర్చలేము', en: 'Cannot fulfill now', icon: Clock },
];

export function MerchantOrderDetailSheet({
  order,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onMarkReady,
}: MerchantOrderDetailSheetProps) {
  const { t, language } = useLanguage();
  const [showRejectDrawer, setShowRejectDrawer] = useState(false);

  if (!order) return null;

  const shopName = language === 'en' ? order.shopName_en : order.shopName_te;

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return language === 'en' ? 'Just now' : 'ఇప్పుడే';
    if (minutes < 60) return `${minutes} ${language === 'en' ? 'min ago' : 'ని. క్రితం'}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${language === 'en' ? 'hr ago' : 'గం. క్రితం'}`;
    return date.toLocaleDateString();
  };

  const handleReject = (reason: typeof rejectionReasons[0]) => {
    onReject(order.id, reason.te, reason.en);
    setShowRejectDrawer(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'accepted': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      case 'ready': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'delivered': return 'bg-primary/10 text-primary border-primary/20';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return t.statusPlaced;
      case 'accepted': return t.statusAccepted;
      case 'ready': return t.statusReady;
      case 'delivered': return t.statusDelivered;
      case 'rejected': return t.statusRejected;
      default: return status;
    }
  };

  return (
    <>
      {/* Main Order Detail Sheet */}
      <Sheet open={isOpen && !showRejectDrawer} onOpenChange={onClose}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">{getShopTypeIcon(order.shopType)}</span>
                </div>
                <div>
                  <SheetTitle className="text-xl font-bold">
                    #{order.id}
                  </SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground mt-0.5">
                    {shopName}
                  </SheetDescription>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>
          </SheetHeader>
          
          <div className="py-5 space-y-5">
            {/* Order Time */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(order.createdAt)}</span>
            </div>

            {/* Status Stepper */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <OrderStatusStepper status={order.status} />
            </div>
            
            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t.items}
              </h4>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {order.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-between p-4 ${
                      idx !== order.items.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                        {item.quantity}×
                      </div>
                      <span className="font-medium text-foreground">
                        {language === 'en' ? item.productName_en : item.productName_te}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                
                {/* Total */}
                <div className="flex items-center justify-between p-4 bg-muted/50">
                  <span className="font-semibold text-foreground">{t.total}</span>
                  <span className="text-lg font-bold text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Rejection Reason (if rejected) */}
            {order.status === 'rejected' && order.rejectionReason_en && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">
                      {language === 'en' ? 'Rejection Reason' : 'తిరస్కరణ కారణం'}
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">
                      {language === 'en' ? order.rejectionReason_en : order.rejectionReason_te}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            {order.status === 'placed' && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectDrawer(true)}
                  className="flex-1 h-14 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  {t.rejectOrder}
                </Button>
                <Button
                  onClick={() => onAccept(order.id)}
                  className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {t.acceptOrder}
                </Button>
              </div>
            )}
            
            {order.status === 'accepted' && (
              <Button
                onClick={() => onMarkReady(order.id)}
                className="w-full h-14 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Package className="w-5 h-5 mr-2" />
                {t.markReady}
              </Button>
            )}

            {(order.status === 'ready' || order.status === 'delivered') && (
              <div className="text-center text-muted-foreground text-sm py-2">
                {order.status === 'ready' 
                  ? (language === 'en' ? 'Waiting for delivery pickup' : 'డెలివరీ కోసం వేచి ఉంది')
                  : (language === 'en' ? 'Order completed' : 'ఆర్డర్ పూర్తయింది')
                }
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Rejection Reason Drawer */}
      <Drawer open={showRejectDrawer} onOpenChange={setShowRejectDrawer}>
        <DrawerContent>
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-xl">{t.selectRejectionReason}</DrawerTitle>
            <DrawerDescription>
              {language === 'en' 
                ? 'Please select a reason for rejecting this order' 
                : 'దయచేసి ఈ ఆర్డర్‌ను తిరస్కరించడానికి కారణం ఎంచుకోండి'}
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4 space-y-3">
            {rejectionReasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleReject(reason)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-destructive/50 hover:bg-destructive/5 transition-all active:scale-[0.98]"
                >
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-destructive" />
                  </div>
                  <span className="font-medium text-foreground flex-1 text-left">
                    {language === 'en' ? reason.en : reason.te}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              );
            })}
          </div>

          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="w-full h-12 rounded-xl">
                {t.cancel}
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
