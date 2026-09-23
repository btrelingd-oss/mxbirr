import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  LogIn,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../utils/authService';
import { sounds } from '../utils/audio';

interface LoginDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onSignOut: () => void;
  initialTab?: 'signin';
}

export const LoginDashboardModal: React.FC<LoginDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onSignOut,
  initialTab = 'signin'
}) => {
  const [activeTab, setActiveTab] = useState<'signin'>(initialTab);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setSuccessMessage(null);
      if (currentUser?.username && currentUser.username !== 'Addis_Spinner') {
        setName(currentUser.username);
      }
      if (currentUser?.phoneNumber || currentUser?.telebirrNumber) {
        setPhoneNumber(currentUser.phoneNumber || currentUser.telebirrNumber || '');
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle Name & Phone Login
  const handlePhoneAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter your name (ስምዎን ያስገቡ).');
      sounds.playLoss();
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setErrorMessage('Please enter a valid phone number (ስልክ ቁጥር ያስገቡ e.g. 09... or 07...).');
      sounds.playLoss();
      return;
    }

    try {
      setLoadingAction('phone');
      setErrorMessage(null);
      sounds.playChip();
      const user = await authService.signInWithPhoneAndName(name, phoneNumber);
      setSuccessMessage(`Logged in as ${user.name || user.username}! Saved to Firestore database.`);
      sounds.playWin();
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div
      id="login-dashboard-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="login-dashboard-modal"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-amber-500/10 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gold/Teal Gradient Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Login & Account Dashboard
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {currentUser.isAuthenticated ? 'Logged In' : 'Guest Session'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Sign in with your Name & Phone Number for instant Birr balances.
              </p>
            </div>
          </div>

          <button
            id="login-dashboard-close-btn"
            onClick={() => {
              onClose();
              sounds.playChip();
            }}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
            title="Close Dashboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-2 scrollbar-none">
          <div className="flex items-center gap-1.5">
            <button
              id="tab-btn-signin"
              onClick={() => {
                setActiveTab('signin');
                sounds.playChip();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 border-amber-500 text-amber-400 bg-slate-900 shadow-sm whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              <span>Phone & Name Sign In</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        <div className="px-5 pt-3">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="flex-1 font-semibold">{successMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {/* TAB: NAME & PHONE SIGN IN */}
          {activeTab === 'signin' && (
            <div className="max-w-md mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="text-center">
                <h3 className="text-base font-bold text-white">
                  Enter Your Credentials
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in or create your profile with your phone number & name
                </p>
              </div>

              <form onSubmit={handlePhoneAuth} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Full Name (ስም)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Abebe Kebede"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Phone Number (ስልክ ቁጥር)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">Ethiopia 🇪🇹</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-xs font-bold">
                      <span>+251</span>
                      <span className="mx-1.5 text-slate-600">|</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09... or 07... (e.g. 0912 345 678)"
                      className="w-full bg-slate-950/80 border border-slate-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-16 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-mono outline-none transition-all"
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

                <button
                  type="submit"
                  disabled={loadingAction === 'phone'}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm py-3 px-4 rounded-xl shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                >
                  {loadingAction === 'phone' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In with Phone & Name (ግባ)</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-center space-y-1">
                <p className="text-xs font-semibold text-slate-300">
                  ⚡ Automatic 1-Click Profile & Balance Sync
                </p>
                <p className="text-[11px] text-slate-500">
                  Your Telebirr & CBE balances (1.00 ETB minimum wager) will automatically sync to your account.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
