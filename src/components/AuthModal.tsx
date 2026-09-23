import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Loader2,
  LogIn,
  UserPlus,
  User,
  Phone,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../utils/authService';
import { sounds } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register' | 'google';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode === 'register' ? 'register' : 'login');

  // Input states
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Status states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    sounds.playChip();
  };

  // Name and Phone Login / Register Handler
  const handlePhoneLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name (እባክዎ ስምዎን ያስገቡ).');
      sounds.playLoss();
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setErrorMessage('Please enter a valid phone number (እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ e.g. 09... or 07...).');
      sounds.playLoss();
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      sounds.playChip();

      const userProfile = await authService.signInWithPhoneAndName(name, phoneNumber);
      setSuccessMessage(`Welcome, ${userProfile.name || userProfile.username}! Saved to Firestore database.`);
      sounds.playWin();

      setTimeout(() => {
        onSuccess(userProfile);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Account Sign In (Demo Player)
  const handleQuickSignIn = async (quickName: string, quickPhone: string) => {
    try {
      setSubmitting(true);
      setName(quickName);
      setPhoneNumber(quickPhone);
      setErrorMessage(null);
      sounds.playChip();

      const userProfile = await authService.signInWithPhoneAndName(quickName, quickPhone);
      setSuccessMessage(`Welcome, ${userProfile.name || userProfile.username}! Synced to Firestore.`);
      sounds.playWin();

      setTimeout(() => {
        onSuccess(userProfile);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Amber Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                {mode === 'login' ? 'Log In to Yene Birr' : 'Register New Account'}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Enter your name and phone number to sign in' : 'Create your account with your phone number'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              sounds.playChip();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs Switcher */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/60">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex-1 font-semibold">{successMessage}</div>
            </div>
          )}

          {/* Main Name & Phone Number Login Form */}
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  Full Name (ስም)
                </span>
                <span className="text-[10px] text-amber-400/90 font-medium">Required</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  Phone Number (ስልክ ቁጥር)
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Ethiopia 🇪🇹</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                  <span>+251</span>
                  <span className="mx-1.5 text-slate-600">|</span>
                </div>
                <input
                  id="auth-input-phone"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="09... or 07... (e.g. 0912 345 678)"
                  className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/80 rounded-xl pl-16 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Supports Ethio Telecom, Telebirr & Safaricom</span>
                <span className="text-amber-400/90 font-medium flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Saves to Firestore
                </span>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  <span>{mode === 'login' ? 'Log In (ግባ)' : 'Create Account (ይመዝገቡ)'}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Instant 1-Click Fast Accounts */}
          <div className="pt-2 border-t border-slate-800/60">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Quick Player Demo Access:
              </span>
              <span className="text-[10px] text-slate-500">1-Click Fast Access</span>
            </div>

            <button
              type="button"
              onClick={() => handleQuickSignIn('Ethiopian_Eagle', '0911223344')}
              className="w-full mb-2 flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors text-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-amber-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-200 group-hover:text-amber-400 truncate flex items-center gap-1.5">
                    <span>VIP Player (Ethiopian_Eagle)</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">GOLD</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">Phone: 0911 ••• 344</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-400">
                Continue →
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSignIn('Addis_Spinner', '0922419881')}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-950 hover:bg-slate-800/90 border border-slate-800 text-left transition-colors text-xs group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 truncate">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80"
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <div className="font-bold text-slate-200 group-hover:text-emerald-400 truncate flex items-center gap-1.5">
                    <span>VIP Player (Addis_Spinner)</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-mono">SILVER</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate font-mono">Phone: 0922 ••• 881</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-400">
                Continue →
              </span>
            </button>
          </div>
        </div>

        {/* Modal Footer / Provably Fair Guarantee */}
        <div className="p-3 bg-slate-950/70 border-t border-slate-800/60 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secure SHA-256 session encryption & provably fair verification</span>
        </div>
      </div>
    </div>
  );
};
