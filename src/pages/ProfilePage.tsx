import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useUserMode } from '@/context/UserModeContext';
import { SwitchModeMenu } from '@/components/SwitchModeMenu';
import { User, Phone, MapPin, LogOut, Edit2, Check, Shield, Globe, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile, isLoading } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { resetMode } = useUserMode();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile?.display_name) {
      setEditedName(profile.display_name);
    }
  }, [profile?.display_name]);

  const handleLogout = async () => {
    resetMode();
    await signOut();
    navigate('/');
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error(language === 'en' ? 'Name cannot be empty' : 'పేరు ఖాళీగా ఉండకూడదు');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile({ display_name: editedName.trim() });
      setIsEditingName(false);
      toast.success(language === 'en' ? 'Name updated!' : 'పేరు నవీకరించబడింది!');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to update name' : 'పేరు నవీకరించడంలో విఫలమైంది');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = async (newLang: 'te' | 'en') => {
    setLanguage(newLang);
    try {
      await updateProfile({ preferred_language: newLang });
    } catch (error) {
      // Language is already changed locally, so just log the error
      console.error('Failed to save language preference:', error);
    }
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

  return (
    <MobileLayout>
      {/* Header */}
      <header className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground animate-fade-in">
            {t.myDetails}
          </h1>
          <SwitchModeMenu />
        </div>
      </header>

      <div className="px-4 pb-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-4 animate-fade-in">
          {/* Name */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
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
                    className="w-full px-2 py-1 rounded-lg border border-primary focus:outline-none text-foreground font-medium bg-background"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-foreground">
                    {profile?.display_name || (language === 'en' ? 'No name set' : 'పేరు సెట్ చేయలేదు')}
                  </p>
                )}
              </div>
            </div>
            
            {isEditingName ? (
              <button
                onClick={handleSaveName}
                disabled={isSaving}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditedName(profile?.display_name || '');
                  setIsEditingName(true);
                }}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center active:scale-95 transition-transform"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'en' ? 'Email' : 'ఇమెయిల్'}</p>
              <p className="font-medium text-foreground">{user?.email || '-'}</p>
            </div>
          </div>

          {/* Phone (if available) */}
          {profile?.phone && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t.mobileNumber}</p>
                <p className="font-medium text-foreground">+91 {profile.phone}</p>
              </div>
            </div>
          )}

          {/* Village */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.village}</p>
              <p className="font-medium text-foreground">
                {language === 'en' ? 'Metlachittapur' : 'మెట్లచిట్టాపూర్'}
              </p>
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
                onClick={() => handleLanguageChange('te')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  language === 'te'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => handleLanguageChange('en')}
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
