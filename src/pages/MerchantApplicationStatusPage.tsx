import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useOnboardingApplication } from '@/hooks/useOnboardingApplication';
import {
  ArrowLeft, Clock, CheckCircle2, XCircle, Store, Loader2, RefreshCw,
} from 'lucide-react';

export function MerchantApplicationStatusPage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language } = useLanguage();
  const en = language === 'en';
  const { data: application, isLoading, refetch } = useOnboardingApplication(user?.id);

  const status = application?.status ?? 'pending';

  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
    pending: {
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      label: en ? 'Pending Review' : 'సమీక్ష పెండింగ్‌లో ఉంది',
    },
    approved: {
      icon: CheckCircle2,
      color: 'text-primary',
      bg: 'bg-primary/5 border-primary/20',
      label: en ? 'Approved' : 'ఆమోదించబడింది',
    },
    rejected: {
      icon: XCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/5 border-destructive/20',
      label: en ? 'Rejected' : 'తిరస్కరించబడింది',
    },
  };

  const cfg = statusConfig[status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.data?.status === 'approved') {
      navigate('/merchant/orders', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MobileLayout>
    );
  }

  const submittedDate = application?.created_at
    ? new Date(application.created_at).toLocaleDateString(en ? 'en-IN' : 'te-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <MobileLayout showNav={false}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-serif text-lg font-semibold text-foreground">{en ? 'Application Status' : 'దరఖాస్తు స్థితి'}</h1>
        </header>

        <div className="px-4 pt-8 pb-8 flex flex-col items-center text-center space-y-6">
          {/* Status Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${cfg.bg} border`}>
            <StatusIcon className={`w-10 h-10 ${cfg.color}`} />
          </div>

          {/* Status Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-4 h-4" />
            {cfg.label}
          </div>

          {/* Date */}
          {submittedDate && (
            <p className="text-sm text-muted-foreground">
              {en ? 'Submitted on' : 'సమర్పించిన తేదీ'}: {submittedDate}
            </p>
          )}

          {/* Status Messages */}
          <div className="bg-card rounded-2xl border border-border p-5 w-full max-w-sm">
            {status === 'pending' && (
              <div className="space-y-3">
                <Store className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {en
                    ? 'Our team is reviewing your application. We will notify you once your application is approved.'
                    : 'మా బృందం మీ దరఖాస్తును సమీక్షిస్తోంది. మీ దరఖాస్తు ఆమోదించబడిన తర్వాత మేము మీకు తెలియజేస్తాము.'}
                </p>
              </div>
            )}
            {status === 'approved' && (
              <div className="space-y-3">
                <CheckCircle2 className="w-8 h-8 text-primary mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {en
                    ? 'Congratulations! Your application has been approved. Set up your shop now.'
                    : 'అభినందనలు! మీ దరఖాస్తు ఆమోదించబడింది. ఇప్పుడు మీ దుకాణాన్ని సెటప్ చేయండి.'}
                </p>
              </div>
            )}
            {status === 'rejected' && (
              <div className="space-y-3">
                <XCircle className="w-8 h-8 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {en
                    ? 'Unfortunately, your application was not approved. You can reapply with updated information.'
                    : 'దురదృష్టవశాత్తూ, మీ దరఖాస్తు ఆమోదించబడలేదు. మీరు అప్డేట్ చేసిన సమాచారంతో తిరిగి దరఖాస్తు చేయవచ్చు.'}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full max-w-sm space-y-3">
            {status === 'pending' && (
              <button
                onClick={handleRefresh}
                className="w-full py-3 rounded-2xl border border-border bg-card text-foreground font-medium text-sm flex items-center justify-center gap-2 active:bg-muted/60 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {en ? 'Check Status' : 'స్థితి తనిఖీ చేయండి'}
              </button>
            )}
            {status === 'approved' && (
              <button
                onClick={() => navigate('/merchant/setup', { replace: true })}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-all"
              >
                {en ? 'Create Your Shop' : 'మీ దుకాణాన్ని సృష్టించండి'}
              </button>
            )}
            {status === 'rejected' && (
              <button
                onClick={() => navigate('/merchant/apply', { replace: true })}
                className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base active:scale-[0.98] transition-all"
              >
                {en ? 'Reapply' : 'మళ్ళీ దరఖాస్తు చేయండి'}
              </button>
            )}
            <button
              onClick={async () => { await signOut(); navigate('/', { replace: true }); }}
              className="w-full py-3 rounded-2xl border border-destructive/20 text-destructive font-medium text-sm active:bg-destructive/5 transition-colors"
            >
              {en ? 'Sign Out' : 'సైన్ అవుట్'}
            </button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
