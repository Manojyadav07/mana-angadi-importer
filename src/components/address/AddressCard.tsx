import { CustomerAddress } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { MapPin, Check, Edit2 } from 'lucide-react';

interface AddressCardProps {
  address: CustomerAddress;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

export function AddressCard({
  address,
  isSelected = false,
  onSelect,
  onEdit,
  compact = false,
}: AddressCardProps) {
  const { language } = useLanguage();

  const label = language === 'en' ? address.label_en : address.label_te;
  const landmark = language === 'en' ? address.landmark_en : address.landmark_te;
  const house = language === 'en' ? address.houseDetails_en : address.houseDetails_te;
  const village = language === 'en' ? address.village_en : address.village_te;

  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-border bg-card hover:border-primary/50'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{label}</p>
          <p className="text-sm text-muted-foreground truncate">{landmark}</p>
        </div>
        {isSelected && <Check className="w-5 h-5 text-primary flex-shrink-0" />}
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all ${
        onSelect ? 'cursor-pointer' : ''
      } ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-foreground">{label}</span>
            {address.isDefault && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {language === 'en' ? 'Default' : 'డిఫాల్ట్'}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{landmark}</p>
          {house && <p className="text-sm text-muted-foreground">{house}</p>}
          <p className="text-sm text-muted-foreground">{village}</p>
          {address.receiverName && (
            <p className="text-sm text-muted-foreground mt-1">
              {address.receiverName} {address.phone && `• ${address.phone}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <Edit2 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {isSelected && <Check className="w-5 h-5 text-primary" />}
        </div>
      </div>
    </div>
  );
}
