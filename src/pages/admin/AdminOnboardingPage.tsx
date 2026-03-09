import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAdminOnboarding, OnboardingWithProfile } from '@/hooks/useAdminOnboarding';
import { UserPlus, Check, X, Clock, ChevronRight, Loader2, RefreshCw } from 'lucide-react';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export function AdminOnboardingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const {
    applications,
    isLoading,
    error,
    actionLoading,
    approveMerchant,
    rejectApplication,
    refetch,
  } = useAdminOnboarding();

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedApp, setSelectedApp] = useState<OnboardingWithProfile | null>(null);

  const labels = {
    title: language === 'en' ? 'Onboarding' : 'ఆన్‌బోర్డింగ్',
    subtitle: language === 'en' ? 'Manage merchant & delivery requests' : 'వ్యాపారి & డెలివరీ అభ్యర్థనలు',
    all: language === 'en' ? 'All' : 'అన్నీ',
    pending: language === 'en' ? 'Pending' : 'పెండింగ్',
    approved: language === 'en' ? 'Approved' : 'ఆమోదించిన',
    rejected: language === 'en' ? 'Rejected' : 'తిరస్కరించిన',
    approve: language === 'en' ? 'Approve' : 'ఆమోదించు',
    reject: language === 'en' ? 'Reject' : 'తిరస్కరించు',
    noRequests: language === 'en' ? 'No onboarding requests' : 'ఆన్‌బోర్డింగ్ అభ్యర్థనలు లేవు',
    phone: language === 'en' ? 'Phone' : 'ఫోన్',
    role: language === 'en' ? 'Role' : 'పాత్ర',
    requestDate: language === 'en' ? 'Request Date' : 'అభ్యర్థన తేదీ',
    status: language === 'en' ? 'Status' : 'స్థితి',
    loading: language === 'en' ? 'Loading…' : 'లోడ్ అవుతోంది…',
    errorMsg: language === 'en' ? 'Failed to load requests' : 'అభ్యర్థనలు లోడ్ చేయడం విఫలమైంది',
  };

  const filteredApps = applications.filter((a) =>
    filter === 'all' || a.status === filter
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-600',
      approved: 'bg-green-500/10 text-green-600',
      rejected: 'bg-red-500/10 text-red-600',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return labels.pending;
    if (status === 'approved') return labels.approved;
    if (status === 'rejected') return labels.rejected;
    return status;
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="screen-header">
        <div className="flex items-center justify-between w-full">
          <div>
            <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
            <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
          </div>
          <button onClick={() => refetch()} className="p-2 rounded-full hover:bg-muted">
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {f === 'all' ? labels.all :
               f === 'pending' ? labels.pending :
               f === 'approved' ? labels.approved : labels.rejected}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{labels.loading}</span>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-12 text-destructive">
            <p>{labels.errorMsg}</p>
            <button onClick={() => refetch()} className="mt-2 text-sm underline">
              {language === 'en' ? 'Retry' : 'మళ్ళీ ప్రయత్నించండి'}
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && filteredApps.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{labels.noRequests}</p>
          </div>
        )}

        {/* Request List */}
        {!isLoading && !error && filteredApps.length > 0 && (
          <div className="space-y-3">
            {filteredApps.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelectedApp(app)}
                className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {app.profile?.display_name || app.user_id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">{app.role}</p>
                      {app.profile?.phone && (
                        <p className="text-xs text-muted-foreground mt-0.5">{app.profile.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setSelectedApp(null)}>
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">
                  {selectedApp.profile?.display_name || selectedApp.user_id.slice(0, 8)}
                </h3>
                <button onClick={() => setSelectedApp(null)} className="p-2 rounded-full hover:bg-muted">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 pb-32">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{labels.role}</p>
                  <p className="font-medium text-foreground capitalize">{selectedApp.role}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{labels.phone}</p>
                  <p className="font-medium text-foreground">{selectedApp.profile?.phone || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{labels.status}</p>
                <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadge(selectedApp.status)}`}>
                  {getStatusLabel(selectedApp.status)}
                </span>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{labels.requestDate}</p>
                <p className="font-medium text-foreground">
                  {selectedApp.created_at
                    ? new Date(selectedApp.created_at).toLocaleDateString(
                        language === 'en' ? 'en-IN' : 'te-IN'
                      )
                    : '—'}
                </p>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    disabled={!!actionLoading}
                    onClick={async () => {
                      await rejectApplication(selectedApp.user_id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 py-3 rounded-xl border border-red-500 text-red-500 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === selectedApp.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    {labels.reject}
                  </button>
                  <button
                    disabled={!!actionLoading}
                    onClick={async () => {
                      await approveMerchant(selectedApp.user_id);
                      setSelectedApp(null);
                    }}
                    className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === selectedApp.user_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {labels.approve}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






