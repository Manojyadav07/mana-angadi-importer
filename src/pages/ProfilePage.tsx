import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserMode } from '@/context/UserModeContext';
import {
  User, ShoppingBag, Store, Truck, Globe, LogOut, ChevronRight, Loader2,
  MessageCircle, HelpCircle, Info, FileText, Shield, RefreshCcw, X,
} from 'lucide-react';

// ── Modal Component ──
function InfoModal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end justify-center p-0">
      <div className="bg-background w-full max-w-md rounded-t-2xl shadow-xl max-h-[85vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-foreground/5">
          <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        {/* Modal Content */}
        <div className="overflow-y-auto px-5 py-4 flex-1 space-y-4 text-sm text-foreground/80 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { resetMode } = useUserMode();
  const en = language === 'en';

  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleLogout = async () => {
    resetMode();
    await signOut();
    navigate('/login', { replace: true });
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const displayName = profile?.display_name || (en ? 'User' : 'వినియోగదారు');
  const identifier = user?.email || ((profile as any)?.phone ? `+91 ${(profile as any).phone}` : '');

  const sections = [
    {
      title: en ? 'Account' : 'ఖాతా',
      items: [
        {
          icon: User,
          label: en ? 'My Profile' : 'నా ప్రొఫైల్',
          subtitle: en ? 'View and edit your details' : 'మీ వివరాలు చూడండి',
          onClick: () => navigate('/profile/edit'),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: ShoppingBag,
          label: t.myOrders,
          subtitle: en ? 'Track your orders' : 'మీ ఆర్డర్లు చూడండి',
          onClick: () => navigate('/orders'),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
      ],
    },
    {
      title: en ? 'Opportunities' : 'అవకాశాలు',
      items: [
        {
          icon: Store,
          label: en ? 'Apply as Merchant' : 'వ్యాపారిగా దరఖాస్తు చేయండి',
          subtitle: en ? 'Sell your products on Mana Angadi' : 'మీ ఉత్పత్తులను అమ్మండి',
          onClick: () => navigate('/merchant/apply'),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
        {
          icon: Truck,
          label: en ? 'Apply as Delivery Partner' : 'డెలివరీ పార్ట్‌నర్‌గా దరఖాస్తు చేయండి',
          subtitle: en ? 'Earn by delivering in your village' : 'మీ గ్రామంలో డెలివరీ చేసి సంపాదించండి',
          onClick: () => navigate('/apply'),
          color: 'text-primary',
          bg: 'bg-primary/10',
        },
      ],
    },
    {
      title: en ? 'Help & Support' : 'సహాయం & మద్దతు',
      items: [
        {
          icon: MessageCircle,
          label: en ? 'Live Support' : 'లైవ్ సపోర్ట్',
          subtitle: en ? 'Chat with us on WhatsApp' : 'వాట్సాప్‌లో మాతో మాట్లాడండి',
          onClick: () => window.open('https://wa.me/917550201424?text=Hi, I need help with Mana Angadi', '_blank'),
          color: 'text-green-600',
          bg: 'bg-green-500/10',
        },
        {
          icon: HelpCircle,
          label: en ? 'Help & Support' : 'సహాయం',
          subtitle: en ? 'FAQs and how-to guides' : 'తరచుగా అడిగే ప్రశ్నలు',
          onClick: () => setActiveModal('help'),
          color: 'text-blue-600',
          bg: 'bg-blue-500/10',
        },
        {
          icon: Info,
          label: en ? 'About Us' : 'మా గురించి',
          subtitle: en ? 'Our story and mission' : 'మా కథ మరియు లక్ష్యం',
          onClick: () => setActiveModal('about'),
          color: 'text-purple-600',
          bg: 'bg-purple-500/10',
        },
        {
          icon: FileText,
          label: en ? 'Terms & Conditions' : 'నిబంధనలు & షరతులు',
          subtitle: en ? 'Usage terms of this platform' : 'ప్లాట్‌ఫారమ్ ఉపయోగ నిబంధనలు',
          onClick: () => setActiveModal('terms'),
          color: 'text-amber-600',
          bg: 'bg-amber-500/10',
        },
        {
          icon: Shield,
          label: en ? 'Privacy Policy' : 'గోప్యతా విధానం',
          subtitle: en ? 'How we protect your data' : 'మీ డేటాను మేము ఎలా రక్షిస్తాము',
          onClick: () => setActiveModal('privacy'),
          color: 'text-teal-600',
          bg: 'bg-teal-500/10',
        },
        {
          icon: RefreshCcw,
          label: en ? 'Refund Policy' : 'రీఫండ్ విధానం',
          subtitle: en ? 'Cancellation and refund rules' : 'రద్దు మరియు రీఫండ్ నిబంధనలు',
          onClick: () => setActiveModal('refund'),
          color: 'text-red-600',
          bg: 'bg-red-500/10',
        },
      ],
    },
  ];

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-5 pt-8 pb-2">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          {en ? 'Profile' : 'ప్రొఫైల్'}
        </h1>
      </header>

      {/* User identity card */}
      <div className="mx-5 mt-3 mb-4 p-4 bg-card rounded-2xl shadow-sm flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{displayName}</p>
          {identifier && (
            <p className="text-sm text-muted-foreground truncate">{identifier}</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-32 space-y-5">

        {/* Menu sections */}
        {sections.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
              {section.title}
            </p>
            <div className="bg-card rounded-2xl shadow-sm divide-y divide-foreground/5 overflow-hidden">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-muted/60 transition-colors text-left"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${item.bg}`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Language preference */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
            {en ? 'Preferences' : 'ప్రాధాన్యతలు'}
          </p>
          <div className="bg-card rounded-2xl shadow-sm px-4 py-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">{t.language}</p>
              </div>
              <div className="flex items-center bg-muted rounded-full p-1">
                <button
                  onClick={() => setLanguage('te')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    language === 'te'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  తెలుగు
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    language === 'en'
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* App version */}
        <p className="text-center text-xs text-muted-foreground">
          Mana Angadi v1.0.0 · {en ? 'Made with ❤️ for rural India' : 'గ్రామ భారత్ కోసం ❤️తో తయారు చేయబడింది'}
        </p>

        {/* Logout */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 px-1">
            {en ? 'Session' : 'సెషన్'}
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl shadow-sm border border-destructive/20 active:bg-destructive/5 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <p className="text-sm font-medium text-destructive">{t.logout}</p>
          </button>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Help & Support */}
      {activeModal === 'help' && (
        <InfoModal title={en ? 'Help & Support' : 'సహాయం & మద్దతు'} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">
                {en ? '📦 How to place an order?' : '📦 ఆర్డర్ ఎలా చేయాలి?'}
              </p>
              <p>{en
                ? 'Browse shops → Add items to basket → Go to Checkout → Enter address → Place Order.'
                : 'దుకాణాలు చూడండి → బుట్టకు జోడించండి → చెక్‌అవుట్ → చిరునామా నమోదు చేయండి → ఆర్డర్ చేయండి.'
              }</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">
                {en ? '🚚 When will I get my delivery?' : '🚚 డెలివరీ ఎప్పుడు వస్తుంది?'}
              </p>
              <p>{en
                ? 'We have two delivery slots daily — Morning (11 AM) and Evening (5 PM). Orders placed before 10:30 AM are dispatched at 11 AM. Orders before 4:30 PM are dispatched at 5 PM.'
                : 'రోజుకు రెండు డెలివరీ స్లాట్లు — ఉదయం (11 గంటలు) మరియు సాయంత్రం (5 గంటలు).'
              }</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">
                {en ? '💰 What payment methods are accepted?' : '💰 చెల్లింపు విధానాలు ఏమిటి?'}
              </p>
              <p>{en
                ? 'We accept Cash on Delivery (COD) and UPI payments.'
                : 'మేము నగదు డెలివరీ (COD) మరియు UPI చెల్లింపులను అంగీకరిస్తాము.'
              }</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4">
              <p className="font-semibold text-foreground mb-1">
                {en ? '❌ Can I cancel my order?' : '❌ ఆర్డర్ రద్దు చేయవచ్చా?'}
              </p>
              <p>{en
                ? 'Yes. You can cancel your order from the Orders page as long as it is still in Pending status.'
                : 'అవును. ఆర్డర్ పెండింగ్ స్థితిలో ఉన్నప్పుడు ఆర్డర్లు పేజీ నుండి రద్దు చేయవచ్చు.'
              }</p>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 rounded-xl">
              <p className="font-semibold text-green-700 mb-1">
                {en ? '💬 Still need help?' : '💬 ఇంకా సహాయం కావాలా?'}
              </p>
              <p className="text-green-700 text-xs">
                {en
                  ? 'Contact us on WhatsApp for instant support.'
                  : 'తక్షణ సహాయం కోసం వాట్సాప్‌లో సంప్రదించండి.'}
              </p>
              <button
                onClick={() => window.open('https://wa.me/917550201424', '_blank')}
                className="mt-3 w-full py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold"
              >
                {en ? 'Open WhatsApp' : 'వాట్సాప్ తెరవండి'}
              </button>
            </div>
          </div>
        </InfoModal>
      )}

      {/* About Us */}
      {activeModal === 'about' && (
        <InfoModal title={en ? 'About Us' : 'మా గురించి'} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="text-center py-4">
              <p className="text-4xl mb-3">🛵</p>
              <h3 className="font-display text-xl font-bold text-foreground">Mana Angadi</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {en ? 'Your Village Commerce Platform' : 'మీ గ్రామ వాణిజ్య వేదిక'}
              </p>
            </div>
            <p>{en
              ? 'Mana Angadi is a rural commerce platform built to connect village customers with local merchants in Metpally and surrounding villages.'
              : 'మన అంగడి మెట్‌పల్లి మరియు చుట్టుపక్కల గ్రామాలలో స్థానిక వ్యాపారులతో గ్రామ వినియోగదారులను అనుసంధానించడానికి నిర్మించబడిన గ్రామీణ వాణిజ్య వేదిక.'
            }</p>
            <p>{en
              ? 'We believe every village deserves access to quality products delivered to their doorstep — reliably, affordably, and with love.'
              : 'ప్రతి గ్రామం నమ్మకంగా, సరసమైన ధరలో, ప్రేమతో వారి గుమ్మం వద్దకు నాణ్యమైన ఉత్పత్తులను పొందే హక్కు ఉందని మేము నమ్ముతాము.'
            }</p>
            <div className="bg-primary/5 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-foreground">
                {en ? 'Our Mission' : 'మా లక్ష్యం'}
              </p>
              <p>{en
                ? 'To become the rural commerce backbone across 50+ villages — enabling local trade, creating delivery jobs, and keeping money within the village economy.'
                : '50+ గ్రామాలలో గ్రామీణ వాణిజ్య వెన్నెముకగా మారడం — స్థానిక వ్యాపారాన్ని ప్రోత్సహించడం, డెలివరీ ఉద్యోగాలు సృష్టించడం మరియు గ్రామ ఆర్థిక వ్యవస్థలో డబ్బు ఉంచడం.'
              }</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {en ? 'Version 1.0.0 · Built with ❤️ for rural India' : 'వెర్షన్ 1.0.0 · గ్రామ భారత్ కోసం ❤️తో నిర్మించబడింది'}
            </p>
          </div>
        </InfoModal>
      )}

      {/* Terms & Conditions */}
      {activeModal === 'terms' && (
        <InfoModal title={en ? 'Terms & Conditions' : 'నిబంధనలు & షరతులు'} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            {[
              {
                title: en ? '1. Acceptance of Terms' : '1. నిబంధనల అంగీకారం',
                body: en
                  ? 'By using Mana Angadi, you agree to these terms. If you do not agree, please do not use the platform.'
                  : 'మన అంగడిని ఉపయోగించడం ద్వారా, మీరు ఈ నిబంధనలకు అంగీకరిస్తున్నారు.',
              },
              {
                title: en ? '2. User Responsibilities' : '2. వినియోగదారు బాధ్యతలు',
                body: en
                  ? 'You are responsible for providing accurate delivery address and contact information. Incorrect details may result in failed delivery.'
                  : 'మీరు సరైన డెలివరీ చిరునామా మరియు సంప్రదింపు సమాచారాన్ని అందించడానికి బాధ్యత వహిస్తారు.',
              },
              {
                title: en ? '3. Orders & Payments' : '3. ఆర్డర్లు & చెల్లింపులు',
                body: en
                  ? 'All orders are subject to availability. Prices are set by merchants and may change. Cash on Delivery and UPI are accepted.'
                  : 'అన్ని ఆర్డర్లు లభ్యతకు లోబడి ఉంటాయి. ధరలు వ్యాపారులచే నిర్ణయించబడతాయి.',
              },
              {
                title: en ? '4. Delivery' : '4. డెలివరీ',
                body: en
                  ? 'Delivery is available only to registered service villages. Two slots daily — 11 AM and 5 PM. Delays may occur due to weather or other circumstances.'
                  : 'డెలివరీ నమోదు చేయబడిన సేవా గ్రామాలకు మాత్రమే అందుబాటులో ఉంటుంది.',
              },
              {
                title: en ? '5. Merchant Responsibility' : '5. వ్యాపారి బాధ్యత',
                body: en
                  ? 'Merchants are solely responsible for the quality, accuracy and compliance of their products including food safety licenses (FSSAI).'
                  : 'వ్యాపారులు వారి ఉత్పత్తుల నాణ్యత మరియు FSSAI వంటి లైసెన్సులకు పూర్తి బాధ్యత వహిస్తారు.',
              },
              {
                title: en ? '6. Platform Rights' : '6. ప్లాట్‌ఫారమ్ హక్కులు',
                body: en
                  ? 'Mana Angadi reserves the right to suspend accounts, remove listings, or terminate service at its discretion.'
                  : 'మన అంగడి ఖాతాలను నిలిపివేయడానికి లేదా సేవను ముగించడానికి హక్కును కలిగి ఉంది.',
              },
            ].map((clause) => (
              <div key={clause.title} className="bg-muted/40 rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1 text-sm">{clause.title}</p>
                <p className="text-xs leading-relaxed">{clause.body}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center">
              {en ? 'Last updated: March 2026' : 'చివరిగా నవీకరించబడింది: మార్చి 2026'}
            </p>
          </div>
        </InfoModal>
      )}

      {/* Privacy Policy */}
      {activeModal === 'privacy' && (
        <InfoModal title={en ? 'Privacy Policy' : 'గోప్యతా విధానం'} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            {[
              {
                title: en ? '1. Data We Collect' : '1. మేము సేకరించే డేటా',
                body: en
                  ? 'We collect your name, phone number, email, delivery address, and order history to provide our service.'
                  : 'మేము మీ పేరు, ఫోన్ నంబర్, ఇమెయిల్, డెలివరీ చిరునామా మరియు ఆర్డర్ చరిత్రను సేకరిస్తాము.',
              },
              {
                title: en ? '2. How We Use Your Data' : '2. మేము మీ డేటాను ఎలా ఉపయోగిస్తాము',
                body: en
                  ? 'Your data is used only to process orders, calculate delivery fees, and communicate order updates. We never sell your data to third parties.'
                  : 'మీ డేటా ఆర్డర్లను ప్రాసెస్ చేయడానికి మాత్రమే ఉపయోగించబడుతుంది. మేము మీ డేటాను మూడవ పక్షాలకు విక్రయించము.',
              },
              {
                title: en ? '3. Data Storage' : '3. డేటా నిల్వ',
                body: en
                  ? 'All data is stored securely on Supabase servers with row-level security. Only you can access your personal information.'
                  : 'అన్ని డేటా సురక్షితంగా Supabase సర్వర్‌లలో నిల్వ చేయబడుతుంది.',
              },
              {
                title: en ? '4. Your Rights' : '4. మీ హక్కులు',
                body: en
                  ? 'You can request to view, edit or delete your personal data at any time by contacting us on WhatsApp.'
                  : 'మీరు ఎల్లప్పుడూ మీ వ్యక్తిగత డేటాను వీక్షించడానికి, సవరించడానికి లేదా తొలగించమని అభ్యర్థించవచ్చు.',
              },
              {
                title: en ? '5. Cookies' : '5. కుకీలు',
                body: en
                  ? 'We use session cookies to keep you logged in. No tracking or advertising cookies are used.'
                  : 'మీరు లాగిన్‌లో ఉండేందుకు మేము సెషన్ కుకీలను ఉపయోగిస్తాము. ట్రాకింగ్ కుకీలు ఉపయోగించబడవు.',
              },
            ].map((clause) => (
              <div key={clause.title} className="bg-muted/40 rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1 text-sm">{clause.title}</p>
                <p className="text-xs leading-relaxed">{clause.body}</p>
              </div>
            ))}
            <p className="text-xs text-muted-foreground text-center">
              {en ? 'Last updated: March 2026' : 'చివరిగా నవీకరించబడింది: మార్చి 2026'}
            </p>
          </div>
        </InfoModal>
      )}

      {/* Refund Policy */}
      {activeModal === 'refund' && (
        <InfoModal title={en ? 'Refund Policy' : 'రీఫండ్ విధానం'} onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="bg-amber-500/10 rounded-xl p-4">
              <p className="font-semibold text-amber-700 mb-1">
                {en ? '⚠️ Important Note' : '⚠️ ముఖ్యమైన గమనిక'}
              </p>
              <p className="text-amber-700 text-xs">
                {en
                  ? 'Mana Angadi is a platform connecting buyers and sellers. Refund eligibility depends on the specific situation.'
                  : 'మన అంగడి కొనుగోలుదారులు మరియు విక్రేతలను అనుసంధానించే వేదిక. రీఫండ్ అర్హత పరిస్థితిపై ఆధారపడి ఉంటుంది.'
                }
              </p>
            </div>
            {[
              {
                title: en ? '✅ Eligible for Refund' : '✅ రీఫండ్‌కు అర్హులు',
                body: en
                  ? 'Wrong item delivered • Damaged or spoiled product received • Order paid but not delivered • Duplicate charge.'
                  : 'తప్పు వస్తువు డెలివరీ • పాడైన ఉత్పత్తి వచ్చింది • ఆర్డర్ చెల్లించబడింది కానీ డెలివరీ కాలేదు • రెండుసార్లు చార్జ్.',
              },
              {
                title: en ? '❌ Not Eligible for Refund' : '❌ రీఫండ్‌కు అర్హులు కాదు',
                body: en
                  ? 'Change of mind after order is dispatched • Wrong address provided by customer • Perishable items after delivery.'
                  : 'ఆర్డర్ పంపిన తర్వాత మనసు మారడం • కస్టమర్ తప్పు చిరునామా అందించడం • డెలివరీ తర్వాత నాశనమయ్యే వస్తువులు.',
              },
              {
                title: en ? '🔄 Refund Process' : '🔄 రీఫండ్ ప్రక్రియ',
                body: en
                  ? 'Contact us on WhatsApp within 2 hours of delivery with photo evidence. Valid refunds are processed within 2-3 business days via UPI or as credit.'
                  : 'డెలివరీ తర్వాత 2 గంటల్లోపు ఫోటో సాక్ష్యంతో వాట్సాప్‌లో సంప్రదించండి. చెల్లుబాటు అయ్యే రీఫండ్‌లు 2-3 పని దినాల్లో ప్రాసెస్ చేయబడతాయి.',
              },
              {
                title: en ? '🚫 Order Cancellation' : '🚫 ఆర్డర్ రద్దు',
                body: en
                  ? 'Orders can be cancelled for free before dispatch. COD orders have no cancellation charge. UPI orders will be refunded within 3 business days.'
                  : 'పంపడానికి ముందు ఆర్డర్లను ఉచితంగా రద్దు చేయవచ్చు. UPI ఆర్డర్లు 3 పని దినాల్లో రీఫండ్ చేయబడతాయి.',
              },
            ].map((clause) => (
              <div key={clause.title} className="bg-muted/40 rounded-xl p-4">
                <p className="font-semibold text-foreground mb-1 text-sm">{clause.title}</p>
                <p className="text-xs leading-relaxed">{clause.body}</p>
              </div>
            ))}
            <button
              onClick={() => window.open('https://wa.me/917550201424', '_blank')}
              className="w-full py-3 rounded-xl bg-green-500 text-white text-sm font-semibold"
            >
              {en ? 'Contact for Refund on WhatsApp' : 'రీఫండ్ కోసం వాట్సాప్‌లో సంప్రదించండి'}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              {en ? 'Last updated: March 2026' : 'చివరిగా నవీకరించబడింది: మార్చి 2026'}
            </p>
          </div>
        </InfoModal>
      )}

    </MobileLayout>
  );
}