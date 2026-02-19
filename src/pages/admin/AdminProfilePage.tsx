import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useUserMode } from '@/context/UserModeContext';
import { SwitchModeMenu } from '@/components/SwitchModeMenu';
import { AdminBottomNav } from '@/components/admin/AdminBottomNav';
import { User, LogOut, Globe, Shield } from 'lucide-react';

export function AdminProfilePage() {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useApp();
  const { signOut } = useAuth();

  const labels = {
    title: language === 'en' ? 'Admin Profile' : 'అడ్మిన్ ప్రొఫైల్',
    admin: language === 'en' ? 'Administrator' : 'అడ్మినిస్ట్రేటర్',
    language: language === 'en' ? 'Language' : 'భాష',
    telugu: 'తెలుగు',
    english: 'English',
    logout: t.logout,
    adminRole: language === 'en' ? 'Super Admin' : 'సూపర్ అడ్మిన్',
  };
  const { resetMode } = useUserMode();

  const handleLogout = async () => {
    resetMode();
    await signOut();
    logout();
    navigate('/');
  };

  return (
    <div className="mobile-container min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="screen-header flex items-center justify-between px-4">
        <h1 className="font-bold text-xl text-foreground">{labels.title}</h1>
        <SwitchModeMenu />
      </header>

      <div className="px-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">{user?.name || labels.admin}</p>
              <p className="text-sm text-muted-foreground">{user?.phone}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {labels.adminRole}
              </span>
            </div>
          </div>
        </div>

        {/* Language Toggle */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{labels.language}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage('te')}
              className={`flex-1 py-3 rounded-xl text-center font-medium transition-all ${
                language === 'te'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {labels.telugu}
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`flex-1 py-3 rounded-xl text-center font-medium transition-all ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {labels.english}
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-card rounded-2xl border border-border p-4 flex items-center gap-3 text-red-500 hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{labels.logout}</span>
        </button>
      </div>

      <AdminBottomNav />
    </div>
  );
}
