import { useParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { ORDER_STATUS_LABELS } from '@/types';
import { ArrowLeft, CheckCircle, Clock, Package, Truck } from 'lucide-react';

const statusIcons = {
  placed: Clock,
  accepted: CheckCircle,
  ready: Package,
  delivered: Truck,
};

const statusClasses: Record<string, string> = {
  placed: 'badge-placed',
  accepted: 'badge-accepted',
  ready: 'badge-ready',
  delivered: 'badge-delivered',
};

const allStatuses = ['placed', 'accepted', 'ready', 'delivered'] as const;

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById } = useApp();

  const order = orderId ? getOrderById(orderId) : undefined;

  if (!order) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">ఆర్డర్ కనుగొనబడలేదు</p>
        </div>
      </MobileLayout>
    );
  }

  const currentStatusIndex = allStatuses.indexOf(order.status);

  return (
    <MobileLayout>
      {/* Header */}
      <header className="screen-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground">ఆర్డర్ #{order.id}</h1>
            <p className="text-muted-foreground text-sm">{order.shopName}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* Current Status */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ప్రస్తుత స్థితి</span>
            <span className={statusClasses[order.status]}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4">ఆర్డర్ ప్రయాణం</h3>
          
          <div className="space-y-4">
            {allStatuses.map((status, index) => {
              const Icon = statusIcons[status];
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;

              return (
                <div key={status} className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Status Text */}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        isCompleted ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </p>
                  </div>

                  {/* Check mark */}
                  {isCompleted && !isCurrent && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4">ఆర్డర్ వివరాలు</h3>
          
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">{item.productName}</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{item.price} × {item.quantity}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
            <span className="font-semibold text-foreground">మొత్తం</span>
            <span className="text-xl font-bold text-primary">₹{order.total}</span>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-primary/10 rounded-2xl p-4">
          <p className="text-sm text-center text-foreground">
            🔒 మీ ఆర్డర్ వివరాలు పూర్తిగా గోప్యంగా ఉంటాయి
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}
