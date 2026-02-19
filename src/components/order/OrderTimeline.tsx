import { Order, OrderStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { Check, Clock, Package, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface OrderTimelineProps {
  order: Order;
  compact?: boolean;
}

interface TimelineStep {
  status: OrderStatus;
  label_te: string;
  label_en: string;
  icon: React.ElementType;
  timestamp?: Date;
}

export function OrderTimeline({ order, compact = false }: OrderTimelineProps) {
  const { language } = useLanguage();

  const getTimestamp = (status: OrderStatus): Date | undefined => {
    switch (status) {
      case 'placed': return order.createdAt;
      case 'accepted': return order.acceptedAt;
      case 'ready': return order.readyAt;
      case 'assigned': return order.assignedAt;
      case 'pickedUp': return order.pickedUpAt;
      case 'onTheWay': return order.onTheWayAt;
      case 'delivered': return order.deliveredAt;
      default: return undefined;
    }
  };

  const allSteps: TimelineStep[] = [
    { status: 'placed', label_te: 'నమోదయ్యింది', label_en: 'Placed', icon: Clock },
    { status: 'accepted', label_te: 'అంగీకరించారు', label_en: 'Accepted', icon: Check },
    { status: 'ready', label_te: 'సిద్ధం', label_en: 'Ready', icon: Package },
    { status: 'assigned', label_te: 'అప్పగించారు', label_en: 'Assigned', icon: Truck },
    { status: 'pickedUp', label_te: 'పికప్ అయింది', label_en: 'Picked Up', icon: MapPin },
    { status: 'onTheWay', label_te: 'వస్తున్నాను', label_en: 'On the Way', icon: Truck },
    { status: 'delivered', label_te: 'డెలివరీ అయింది', label_en: 'Delivered', icon: CheckCircle2 },
  ];

  // Determine which steps to show based on order status
  const statusOrder: OrderStatus[] = ['placed', 'accepted', 'ready', 'assigned', 'pickedUp', 'onTheWay', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);
  
  // Filter steps based on order phase
  const isDeliveryPhase = ['assigned', 'pickedUp', 'onTheWay', 'delivered'].includes(order.status);
  const steps = isDeliveryPhase 
    ? allSteps.filter(s => ['ready', 'assigned', 'pickedUp', 'onTheWay', 'delivered'].includes(s.status))
    : allSteps.filter(s => ['placed', 'accepted', 'ready', 'delivered'].includes(s.status));

  const formatTimestamp = (date: Date | undefined): string => {
    if (!date) return '';
    try {
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  return (
    <div className={`space-y-${compact ? '2' : '3'}`}>
      {steps.map((step, index) => {
        const stepIndex = statusOrder.indexOf(step.status);
        const isCompleted = stepIndex <= currentIndex;
        const isCurrent = step.status === order.status;
        const timestamp = getTimestamp(step.status);
        const Icon = step.icon;
        const label = language === 'en' ? step.label_en : step.label_te;

        return (
          <div key={step.status} className="flex items-start gap-3">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-3 ring-primary/30 scale-110' : ''}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-6 mt-1 ${
                    isCompleted && index < steps.length - 1 ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0 pb-2">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`font-medium text-sm ${
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  } ${isCurrent ? 'font-semibold' : ''}`}
                >
                  {label}
                </p>
                {timestamp && isCompleted && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimestamp(timestamp)}
                  </span>
                )}
              </div>
              {isCurrent && !compact && (
                <p className="text-xs text-primary mt-0.5">
                  {language === 'en' ? 'Current status' : 'ప్రస్తుత స్థితి'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
