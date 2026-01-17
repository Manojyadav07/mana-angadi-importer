import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useApp } from '@/context/AppContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Phone, MapPin, LogOut, Edit2, Check, Shield, Globe } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUserName } = useApp();
  const { t, language, setLanguage } = useLanguage();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveName = () => {
    updateUserName(editedName.trim());
    setIsEditingName(false);
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground animate-fade-in">
          {t.myDetails}
        </h1>
      </header>

      <div className="px-4 pb-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4 animate-fade-in">
          {/* Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t.name}</p>
                {isEditingName ? (
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg border border-primary focus:outline-none text-foreground font-medium"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-foreground">
                    {user?.name || t.noName}
                  </p>
                )}
              </div>
            </div>
            
            {isEditingName ? (
              <button
                onClick={handleSaveName}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform"
              >
                <Check className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditedName(user?.name || '');
                  setIsEditingName(true);
                }}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.mobileNumber}</p>
              <p className="font-medium text-foreground">+91 {user?.phone}</p>
            </div>
          </div>

          {/* Village */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.village}</p>
              <p className="font-medium text-foreground">Metlachittapur</p>
            </div>
          </div>
        </div>

        {/* Language Toggle Card */}
        <div className="bg-card rounded-2xl border border-border p-4 animate-fade-in" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.language}</p>
                <p className="font-medium text-foreground">
                  {language === 'te' ? 'తెలుగు' : 'English'}
                </p>
              </div>
            </div>
            
            {/* Segmented Control */}
            <div className="flex items-center bg-muted rounded-full p-1">
              <button
                onClick={() => setLanguage('te')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  language === 'te'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  language === 'en'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="bg-primary/10 rounded-2xl p-4 flex items-start gap-3 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Shield className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground">
              {t.privacyGuarantee}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {t.privacyNote}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-destructive/20 text-destructive font-medium active:scale-[0.99] transition-transform animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          <LogOut className="w-5 h-5" />
          {t.logout}
        </button>
      </div>
    </MobileLayout>
  );
}
