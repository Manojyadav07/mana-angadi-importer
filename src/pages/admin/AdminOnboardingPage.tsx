import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { OnboardingRequest, OnboardingRequestStatus, ShopType } from '@/types';
import { UserPlus, Store, Check, X, Clock, ChevronRight } from 'lucide-react';

// Mock onboarding requests
const mockRequests: OnboardingRequest[] = [
  {
    id: 'req_1',
    requestType: 'merchant',
    name: 'Suresh Kumar',
    phone: '9876543210',
    shopType: 'kirana',
    shopName_te: 'సురేష్ కిరాణా',
    shopName_en: 'Suresh Kirana',
    status: 'Pending',
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'req_2',
    requestType: 'shop',
    name: 'Lakshmi Devi',
    phone: '9123456789',
    shopType: 'restaurant',
    shopName_te: 'లక్ష్మీ హోటల్',
    shopName_en: 'Lakshmi Hotel',
    status: 'Pending',
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: 'req_3',
    requestType: 'merchant',
    name: 'Ramu Reddy',
    phone: '9988776655',
    shopType: 'medical',
    shopName_te: 'రాము మెడికల్స్',
    shopName_en: 'Ramu Medicals',
    status: 'Approved',
    createdAt: new Date(Date.now() - 604800000),
  },
];

export function AdminOnboardingPage() {
  const { language } = useLanguage();
  const [requests, setRequests] = useState<OnboardingRequest[]>(mockRequests);
  const [filter, setFilter] = useState<'all' | OnboardingRequestStatus>('all');
  const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);

  const labels = {
    title: language === 'en' ? 'Onboarding' : 'ఆన్‌బోర్డింగ్',
    subtitle: language === 'en' ? 'Manage merchant & shop requests' : 'వ్యాపారి & షాప్ అభ్యర్థనలు',
    all: language === 'en' ? 'All' : 'అన్నీ',
    pending: language === 'en' ? 'Pending' : 'పెండింగ్',
    approved: language === 'en' ? 'Approved' : 'ఆమోదించిన',
    rejected: language === 'en' ? 'Rejected' : 'తిరస్కరించిన',
    merchant: language === 'en' ? 'Merchant' : 'వ్యాపారి',
    shop: language === 'en' ? 'Shop' : 'షాప్',
    approve: language === 'en' ? 'Approve' : 'ఆమోదించు',
    reject: language === 'en' ? 'Reject' : 'తిరస్కరించు',
    noRequests: language === 'en' ? 'No onboarding requests' : 'ఆన్‌బోర్డింగ్ అభ్యర్థనలు లేవు',
    shopType: language === 'en' ? 'Shop Type' : 'షాప్ రకం',
    phone: language === 'en' ? 'Phone' : 'ఫోన్',
    requestDate: language === 'en' ? 'Request Date' : 'అభ్యర్థన తేదీ',
    createMerchant: language === 'en' ? 'Create Merchant Account' : 'వ్యాపారి ఖాతా సృష్టించు',
    createShop: language === 'en' ? 'Create Shop' : 'షాప్ సృష్టించు',
    seedProducts: language === 'en' ? 'Add starter products' : 'స్టార్టర్ ప్రోడక్ట్స్ జోడించు',
  };

  const getShopTypeLabel = (type?: ShopType) => {
    if (!type) return '';
    const labels: Record<ShopType, { te: string; en: string }> = {
      kirana: { te: 'కిరాణా', en: 'Grocery' },
      restaurant: { te: 'హోటల్', en: 'Restaurant' },
      medical: { te: 'మెడికల్', en: 'Medical' },
    };
    return language === 'en' ? labels[type].en : labels[type].te;
  };

  const filteredRequests = requests.filter(r => 
    filter === 'all' || r.status === filter
  );

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Approved' as OnboardingRequestStatus } : r
    ));
    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'Rejected' as OnboardingRequestStatus } : r
    ));
    setSelectedRequest(null);
  };

  const getStatusBadge = (status: OnboardingRequestStatus) => {
    const styles = {
      Pending: 'bg-yellow-500/10 text-yellow-600',
      Approved: 'bg-green-500/10 text-green-600',
      Rejected: 'bg-red-500/10 text-red-600',
    };
    return styles[status];
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="screen-header">
        <div>
          <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(['all', 'Pending', 'Approved', 'Rejected'] as const).map((f) => (
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
               f === 'Pending' ? labels.pending :
               f === 'Approved' ? labels.approved : labels.rejected}
            </button>
          ))}
        </div>

        {/* Request List */}
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{labels.noRequests}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <button
                key={request.id}
                onClick={() => setSelectedRequest(request)}
                className="w-full bg-card rounded-2xl border border-border p-4 text-left hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.requestType === 'merchant' 
                        ? 'bg-blue-500/10 text-blue-600' 
                        : 'bg-green-500/10 text-green-600'
                    }`}>
                      {request.requestType === 'merchant' ? (
                        <UserPlus className="w-5 h-5" />
                      ) : (
                        <Store className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{request.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? request.shopName_en : request.shopName_te}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getShopTypeLabel(request.shopType)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {request.requestType === 'merchant' ? labels.merchant : labels.shop}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(request.status)}`}>
                      {request.status === 'Pending' ? labels.pending :
                       request.status === 'Approved' ? labels.approved : labels.rejected}
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
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div className="w-full max-w-md bg-background rounded-t-3xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-foreground">
                  {selectedRequest.name}
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 rounded-full hover:bg-muted"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{labels.shopType}</p>
                  <p className="font-medium text-foreground">{getShopTypeLabel(selectedRequest.shopType)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{labels.phone}</p>
                  <p className="font-medium text-foreground">{selectedRequest.phone}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'en' ? 'Shop Name (Telugu)' : 'షాప్ పేరు (తెలుగు)'}
                </p>
                <p className="font-medium text-foreground">{selectedRequest.shopName_te}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {language === 'en' ? 'Shop Name (English)' : 'షాప్ పేరు (ఆంగ్లం)'}
                </p>
                <p className="font-medium text-foreground">{selectedRequest.shopName_en}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{labels.requestDate}</p>
                <p className="font-medium text-foreground">
                  {new Date(selectedRequest.createdAt).toLocaleDateString(
                    language === 'en' ? 'en-IN' : 'te-IN'
                  )}
                </p>
              </div>

              {selectedRequest.status === 'Pending' && (
                <div className="space-y-3 pt-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {labels.createMerchant}
                    </label>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" defaultChecked className="rounded" />
                      {labels.createShop}
                    </label>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" className="rounded" />
                      {labels.seedProducts}
                    </label>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="flex-1 py-3 rounded-xl border border-red-500 text-red-500 font-medium flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {labels.reject}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {labels.approve}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  );
}
