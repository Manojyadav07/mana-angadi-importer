import { Phone, MessageCircle, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HelpSupportButtonProps {
  orderId: string;
  variant?: 'icon' | 'button';
  className?: string;
}

// Support contact configuration
const SUPPORT_CONFIG = {
  phone: '+919876543210',
  whatsapp: '+919876543210',
};

export function HelpSupportButton({ orderId, variant = 'icon', className = '' }: HelpSupportButtonProps) {
  const { language } = useLanguage();

  const texts = {
    help: language === 'en' ? 'Help' : 'సహాయం',
    call: language === 'en' ? 'Call Support' : 'కాల్ చేయండి',
    whatsapp: language === 'en' ? 'WhatsApp Support' : 'వాట్సాప్',
  };

  // WhatsApp message template (privacy-safe: no item names)
  const whatsappMessage = language === 'en'
    ? `I need help with my order. Order ID: ${orderId}`
    : `నా ఆర్డర్ గురించి సహాయం కావాలి. ఆర్డర్ ID: ${orderId}`;

  const handleCall = () => {
    window.location.href = `tel:${SUPPORT_CONFIG.phone}`;
  };

  const handleWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${SUPPORT_CONFIG.whatsapp.replace('+', '')}?text=${encodedMessage}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <button
            className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform ${className}`}
            aria-label={texts.help}
          >
            <HelpCircle className="w-5 h-5 text-foreground" />
          </button>
        ) : (
          <button
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm active:scale-[0.98] transition-transform ${className}`}
          >
            <HelpCircle className="w-4 h-4" />
            {texts.help}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCall} className="cursor-pointer py-3">
          <Phone className="w-4 h-4 mr-2 text-primary" />
          <span className="font-medium">{texts.call}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer py-3">
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          <span className="font-medium">{texts.whatsapp}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
