import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, MapPin, Phone, LogOut, Languages, Power, AlertCircle, HelpCircle, MessageCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// Support contact configuration
const SUPPORT_CONFIG = {
  phone: '+919876543210',
  whatsapp: '+919876543210',
};

export function DeliveryProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUserAvailability } = useApp();
  const { t, language, setLanguage } = useLanguage();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAvailabilityChange = (checked: boolean) => {
    updateUserAvailability(checked);
  };

  return (
    <MobileLayout>
      <header className="screen-header">
        <h1 className="text-xl font-bold text-foreground">{t.navProfile}</h1>
      </header>

      <div className="px-4 py-4 space-y-4">
        {/* User Info Card */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">
                {user?.name || t.deliveryPartner}
              </h2>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <Phone className="w-3 h-3" />
                <span>+91 {user?.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-sm">
                <MapPin className="w-3 h-3" />
                <span>{user?.village || 'Metlachittapur'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user?.isAvailable ? 'bg-green-500/10' : 'bg-muted'
              }`}>
                <Power className={`w-5 h-5 ${
                  user?.isAvailable ? 'text-green-600' : 'text-muted-foreground'
                }`} />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  {user?.isAvailable ? t.available : t.notAvailable}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.isAvailable 
                    ? language === 'te' ? 'మీకు డెలివరీలు కనిపిస్తాయి' : 'You will see deliveries'
                    : language === 'te' ? 'డెలివరీలు కనిపించవు' : 'No deliveries will show'
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={user?.isAvailable || false}
              onCheckedChange={handleAvailabilityChange}
            />
          </div>
        </div>

        {/* Language Toggle */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <Languages className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t.language}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setLanguage('te')}
              className={`py-3 rounded-xl font-medium transition-all ${
                language === 'te'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              తెలుగు
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`py-3 rounded-xl font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Help & Support */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            {language === 'te' ? 'సహాయం' : 'Help & Support'}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => window.location.href = `tel:${SUPPORT_CONFIG.phone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium active:scale-[0.98] transition-transform"
            >
              <Phone className="w-4 h-4" />
              {language === 'te' ? 'కాల్' : 'Call'}
            </button>
            <button
              onClick={() => {
                const msg = encodeURIComponent(language === 'te' ? 'నాకు సహాయం కావాలి' : 'I need help');
                window.open(`https://wa.me/${SUPPORT_CONFIG.whatsapp.replace('+', '')}?text=${msg}`, '_blank');
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-500/10 text-green-700 font-medium active:scale-[0.98] transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              {language === 'te' ? 'వాట్సాప్' : 'WhatsApp'}
            </button>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-foreground">{t.emergencyContact}</p>
              <p className="text-sm text-muted-foreground">
                {user?.emergencyContactName || (language === 'te' ? 'జోడించలేదు' : 'Not added')}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-destructive/10 text-destructive py-4 rounded-2xl font-medium flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          <LogOut className="w-5 h-5" />
          {t.logout}
        </button>

        {/* Privacy Note */}
        <div className="bg-primary/10 rounded-2xl p-4">
          <p className="text-sm text-center text-foreground">
            🔒 {t.privacyNote}
          </p>
        </div>
      </div>
    </MobileLayout>
  );
}