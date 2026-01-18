import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { Store, ArrowRight, Loader2, ShoppingBag, Briefcase, Truck, Shield, Mail, Lock, User } from 'lucide-react';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { z } from 'zod';

const WELCOME_SHOWN_KEY = 'mana-angadi-welcome-shown';

type LoginRole = 'customer' | 'merchant' | 'delivery' | 'admin';

// Validation schemas
const emailSchema = z.string().trim().email({ message: "Invalid email address" }).max(255);
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" }).max(100);
const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" }).max(100);

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, setRole, user, role, isLoading: authLoading } = useAuth();
  const { t, language } = useLanguage();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('customer');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(WELCOME_SHOWN_KEY);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && role && !authLoading) {
      navigateByRole(role);
    }
  }, [user, role, authLoading]);

  const navigateByRole = (userRole: UserRole) => {
    switch (userRole) {
      case 'merchant':
        navigate('/merchant/orders');
        break;
      case 'delivery':
        navigate('/delivery/onboarding');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/home');
    }
  };

  const handleWelcomeDismiss = () => {
    localStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0]?.message;
      }
    }

    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0]?.message;
      }
    }

    if (isSignUp) {
      try {
        nameSchema.parse(displayName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.name = e.errors[0]?.message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isSignUp) {
        // Sign up
        const { error } = await signUp(email, password, displayName);
        if (error) {
          toast.error(language === 'en' ? error.message : 'ఖాతా సృష్టించడంలో విఫలమైంది');
          setIsLoading(false);
          return;
        }

        // Set the user's role after signup
        const { error: roleError } = await setRole(selectedRole);
        if (roleError) {
          console.error('Error setting role:', roleError);
        }

        toast.success(language === 'en' ? 'Account created successfully!' : 'ఖాతా విజయవంతంగా సృష్టించబడింది!');
        navigateByRole(selectedRole);
      } else {
        // Sign in
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(language === 'en' ? 'Invalid email or password' : 'తప్పు ఇమెయిల్ లేదా పాస్‌వర్డ్');
          setIsLoading(false);
          return;
        }

        toast.success(language === 'en' ? 'Logged in successfully!' : 'విజయవంతంగా లాగిన్ అయ్యారు!');
        // Navigation will be handled by useEffect when role loads
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(language === 'en' ? 'Something went wrong' : 'ఏదో తప్పు జరిగింది');
    } finally {
      setIsLoading(false);
    }
  };

  if (showWelcome) {
    return <WelcomeScreen onContinue={handleWelcomeDismiss} />;
  }

  if (authLoading) {
    return (
      <div className="mobile-container min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const adminLabel = language === 'en' ? 'Admin' : 'అడ్మిన్';
  const signUpLabel = language === 'en' ? 'Sign Up' : 'నమోదు చేయండి';
  const signInLabel = language === 'en' ? 'Sign In' : 'లాగిన్';
  const createAccountLabel = language === 'en' ? 'Create Account' : 'ఖాతా సృష్టించండి';
  const alreadyHaveAccountLabel = language === 'en' ? 'Already have an account?' : 'ఇప్పటికే ఖాతా ఉందా?';
  const noAccountLabel = language === 'en' ? "Don't have an account?" : 'ఖాతా లేదా?';
  const emailLabel = language === 'en' ? 'Email' : 'ఇమెయిల్';
  const passwordLabel = language === 'en' ? 'Password' : 'పాస్‌వర్డ్';
  const nameLabel = language === 'en' ? 'Your Name' : 'మీ పేరు';

  return (
    <div className="mobile-container min-h-screen flex flex-col bg-background">
      {/* Header Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-4">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-4 animate-scale-in">
          <Store className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground text-center animate-fade-in">
          {t.welcome}
        </h1>
        <p className="text-muted-foreground text-center mt-1 text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {isSignUp ? createAccountLabel : signInLabel}
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4 animate-slide-up">
        {/* Role Selection - Only show for signup */}
        {isSignUp && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {t.loginAs || 'I am a'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedRole === 'customer'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRole === 'customer' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <ShoppingBag className={`w-5 h-5 ${
                    selectedRole === 'customer' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  selectedRole === 'customer' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t.customer || 'Customer'}
                </span>
              </button>
              
              <button
                type="button"
                onClick={() => setSelectedRole('merchant')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  selectedRole === 'merchant'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedRole === 'merchant' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Briefcase className={`w-5 h-5 ${
                    selectedRole === 'merchant' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  selectedRole === 'merchant' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t.merchant}
                </span>
              </button>
            </div>
            
            {/* Delivery & Admin Options */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('delivery')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                  selectedRole === 'delivery'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRole === 'delivery' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Truck className={`w-4 h-4 ${
                    selectedRole === 'delivery' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  selectedRole === 'delivery' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {t.delivery}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                  selectedRole === 'admin'
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-card hover:border-muted-foreground/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedRole === 'admin' ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  <Shield className={`w-4 h-4 ${
                    selectedRole === 'admin' ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  selectedRole === 'admin' ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {adminLabel}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Name Input - Only for signup */}
        {isSignUp && (
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={nameLabel}
                className="input-village pl-12"
                autoComplete="name"
              />
            </div>
            {errors.name && (
              <p className="text-xs text-destructive px-1">{errors.name}</p>
            )}
          </div>
        )}

        {/* Email Input */}
        <div className="space-y-1">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailLabel}
              className="input-village pl-12"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive px-1">{errors.email}</p>
          )}
        </div>

        {/* Password Input */}
        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={passwordLabel}
              className="input-village pl-12"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
            />
          </div>
          {errors.password && (
            <p className="text-xs text-destructive px-1">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-accent w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              {isSignUp ? signUpLabel : signInLabel}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Toggle Sign In / Sign Up */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrors({});
            }}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? alreadyHaveAccountLabel : noAccountLabel}
          </button>
        </div>
      </form>

      {/* Village Badge */}
      <div className="px-6 pb-6 text-center">
        <span className="trust-badge">
          {t.villageBadge}
        </span>
      </div>
    </div>
  );
}
