import { useLanguage } from '@/context/LanguageContext';
import { OrderStatus } from '@/types';
import { Clock, CheckCircle, Package, Truck, XCircle } from 'lucide-react';

interface OrderStatusStepperProps {
  status: OrderStatus;
}

const steps = [
  { key: 'placed', icon: Clock },
  { key: 'accepted', icon: CheckCircle },
  { key: 'ready', icon: Package },
  { key: 'delivered', icon: Truck },
] as const;

export function OrderStatusStepper({ status }: OrderStatusStepperProps) {
  const { t } = useLanguage();

  const getStatusLabel = (key: string) => {
    switch (key) {
      case 'placed': return t.statusPlaced;
      case 'accepted': return t.statusAccepted;
      case 'ready': return t.statusReady;
      case 'delivered': return t.statusDelivered;
      default: return key;
    }
  };

  if (status === 'rejected') {
    return (
      <div className="flex items-center justify-center gap-3 py-4 bg-destructive/10 rounded-xl">
        <XCircle className="w-8 h-8 text-destructive" />
        <span className="font-semibold text-destructive">{t.statusRejected}</span>
      </div>
    );
  }

  const currentIndex = steps.findIndex(s => s.key === status);

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs mt-1.5 font-medium ${
                isCompleted ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {getStatusLabel(step.key)}
              </span>
            </div>
            
            {!isLast && (
              <div
                className={`w-8 h-0.5 mx-1 -mt-5 ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
