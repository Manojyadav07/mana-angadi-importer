import { useLanguage } from '@/context/LanguageContext';
import { OrderStatus } from '@/types';
import { Package, UserCheck, Truck, MapPin, CheckCircle } from 'lucide-react';

interface DeliveryStatusStepperProps {
  status: OrderStatus;
  compact?: boolean;
}

const deliverySteps = [
  { status: 'ready', icon: Package },
  { status: 'assigned', icon: UserCheck },
  { status: 'pickedUp', icon: Truck },
  { status: 'onTheWay', icon: MapPin },
  { status: 'delivered', icon: CheckCircle },
];

export function DeliveryStatusStepper({ status, compact = false }: DeliveryStatusStepperProps) {
  const { t } = useLanguage();

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'ready': return t.statusReady;
      case 'assigned': return t.statusAssigned;
      case 'pickedUp': return t.statusPickedUp;
      case 'onTheWay': return t.statusOnTheWay;
      case 'delivered': return t.statusDelivered;
      default: return s;
    }
  };

  const currentIndex = deliverySteps.findIndex(step => step.status === status);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {deliverySteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.status} className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  isCompleted ? 'bg-primary' : 'bg-muted'
                } ${isCurrent ? 'ring-2 ring-primary/20' : ''}`}
              />
              {index < deliverySteps.length - 1 && (
                <div className={`w-4 h-0.5 ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {deliverySteps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs mt-1 text-center max-w-[60px] ${
                isCompleted ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}>
                {getStatusLabel(step.status)}
              </span>
            </div>
            
            {index < deliverySteps.length - 1 && (
              <div className={`w-8 h-0.5 mx-1 -mt-4 ${
                index < currentIndex ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}