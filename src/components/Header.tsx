import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronDown,
  Flame,
  Smartphone,
  LogOut,
  Mail,
  User,
  CheckCircle2,
  RefreshCw,
  LogIn,
  Check
} from 'lucide-react';
import { UserProfile, CryptoCurrency, CryptoPrice } from '../types';
import { sounds } from '../utils/audio';
import { MXLogo } from './MXLogo';

interface HeaderProps {
  user: UserProfile;
  prices: Record<CryptoCurrency, CryptoPrice>;
  selectedCurrency: CryptoCurrency;
  winStreak?: number;
  onSelectCurrency: (curr: CryptoCurrency) => void;
  onOpenWallet: (tab?: 'deposit' | 'withdraw') => void;
  onOpenVip: () => void;
  onOpenProvablyFair: () => void;
  onOpenProfile?: () => void;
  onOpenAuth: (mode?: 'login' | 'register' | 'google') => void;
  onOpenLoginDashboard: () => void;
  onSignOut: () => void;
  onOpenAdmin?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isPhoneMode?: boolean;
  onTogglePhoneMode?: () => void;
  onRestoreOneBirr?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  prices,
  selectedCurrency,
  winStreak = 0,
  onSelectCurrency,
  onOpenWallet,
  onOpenVip,
  onOpenProvablyFair,
  onOpenProfile,
  onOpenAuth,
  onOpenLoginDashboard,
  onSignOut,
  onOpenAdmin,
  soundEnabled,
  onToggleSound,
  isPhoneMode,
  onTogglePhoneMode,
  onRestoreOneBirr
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const currentBalance = user.balances[selectedCurrency] || 0;
  const balanceUSD = `${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} Birr`;

  const currencies: CryptoCurrency[] = ['CBE', 'Telebirr'];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      {/* Top Crypto Price Ticker */}
      <div className="hidden md:flex items-center justify-between text-xs border-b border-slate-800/50 pb-2 mb-3 overflow-x-auto gap-6 scrollbar-none">
        <div className="flex items-center gap-2 text-slate-400 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Ethiopian Birr Rate:
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 whitespace-nowrap bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="font-semibold text-slate-300">🇪🇹 Birr Rate</span>
            <span className="text-emerald-400 font-bold">1 Birr = 1 Birr</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="font-semibold text-slate-300">⚡ Live Status</span>
            <span className="text-emerald-400 font-bold">Instant Birr Payouts Active</span>
          </div>
          <div className="flex items-center gap-1.5 whitespace-nowrap bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30 text-emerald-400 font-medium text-[11px]" title="Connected to Google Cloud Firebase Firestore">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Firebase Connected</span>
          </div>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <MXLogo />

        {/* Action Controls & Wallet */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Win Streak Counter Badge */}
          {winStreak > 0 && (
            <div
              className={`flex items-center gap-1.5 text-xs font-black px-2.5 py-1.5 rounded-xl border transition-all ${
                winStreak >= 3
                  ? 'bg-gradient-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border-amber-500/80 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse'
                  : 'bg-slate-900/90 border-amber-500/40 text-amber-400'
              }`}
              title={`${winStreak}-Spin Winning Streak Active!`}
            >
              <Flame className={`w-4 h-4 ${winStreak >= 3 ? 'text-yellow-300 fill-amber-400 animate-bounce' : 'text-amber-500 fill-amber-500/40'}`} />
              <span className="font-mono tracking-tight">{winStreak}x Streak</span>
            </div>
          )}

          {/* Provably Fair Badge Button */}
          <button
            onClick={onOpenProvablyFair}
            className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 px-2.5 py-1.5 rounded-lg transition-colors"
            title="Provably Fair Verifier"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Fairness</span>
          </button>

          {/* Admin Command Center Button (Code preserved, hidden from screen per request) */}
          {false && onOpenAdmin && (user.role === 'admin' || user.isAdmin || user.email === 'beamlakub9@gmail.com') && (
            <button
              id="header-admin-portal-btn"
              onClick={() => {
                onOpenAdmin();
                sounds.playChip();
              }}
              className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/60 text-amber-300 font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-amber-500/10 transition-all active:scale-95 animate-pulse"
              title="Admin Command Center"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Firebase Admin</span>
            </button>
          )}

          {/* Phone App View Toggle Button */}
          {onTogglePhoneMode && (
            <button
              onClick={() => {
                onTogglePhoneMode();
                sounds.playChip();
              }}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-bold transition-all active:scale-95 ${
                isPhoneMode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-700/60 text-slate-300'
              }`}
              title={isPhoneMode ? 'Switch to Full Web Layout' : 'Switch to Smartphone App Shell'}
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{isPhoneMode ? 'Phone Frame' : 'Phone App'}</span>
            </button>
          )}

          {/* Sound Toggle Button */}
          <button
            onClick={() => {
              onToggleSound();
              sounds.playChip();
            }}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Currency Switcher Dropdown & Balance Display */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-850 border border-amber-500/30 rounded-xl px-3 py-1.5 transition-all shadow-inner"
            >
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-amber-400">{user.balances[selectedCurrency].toFixed(2)}</span>
                  <span className="text-[11px] font-semibold text-slate-300">{selectedCurrency}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 block">{balanceUSD}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Currency</div>
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => {
                      onSelectCurrency(curr);
                      setDropdownOpen(false);
                      sounds.playChip();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-800 transition-colors ${
                      selectedCurrency === curr ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{prices[curr]?.icon}</span>
                      <span>{curr}</span>
                    </div>
                    <span className="font-mono text-slate-400">{user.balances[curr].toFixed(2)}</span>
                  </button>
                ))}

                {onRestoreOneBirr && (
                  <div className="pt-2 mt-2 border-t border-slate-800 px-2">
                    <button
                      type="button"
                      onClick={() => {
                        onRestoreOneBirr();
                        setDropdownOpen(false);
                        sounds.playChip();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-between transition-colors"
                      title="Restore wallet balance to 1.00 Birr"
                    >
                      <span>Restore 1.00 Birr</span>
                      <span className="font-mono text-slate-300">1.00 ETB</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Deposit Button */}
          <button
            onClick={() => {
              onOpenWallet('deposit');
              sounds.playChip();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Deposit</span>
          </button>

          {/* Withdraw Button */}
          <button
            onClick={() => {
              onOpenWallet('withdraw');
              sounds.playChip();
            }}
            className="hidden sm:flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/70 font-semibold text-xs px-3.5 py-2 rounded-xl transition-all active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
            <span>Withdraw</span>
          </button>

          {/* User Session Management & Authentication Controls */}
          {user.isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button
                id="header-user-profile-btn"
                onClick={() => {
                  setUserMenuOpen(!userMenuOpen);
                  sounds.playChip();
                }}
                className="flex items-center justify-center p-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 border-2 border-amber-500/90 hover:border-amber-400 transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                title="Private User Profile"
              >
                {/* Amber circle avatar with dark user silhouette and verified checkmark badge matching screenshot */}
                <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-inner">
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-950 fill-slate-950 stroke-[2]" />
                  {/* Verified check badge in bottom-right corner */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-slate-950 shadow-sm">
                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 stroke-[3.5]" />
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center shadow-inner shrink-0">
                        <User className="w-5 h-5 text-slate-950 fill-slate-950 stroke-[2]" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-slate-950 shadow-sm">
                          <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                        </div>
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                          <span>{user.username || 'Private User'}</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                            Verified
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate font-mono mt-0.5">
                          ID: {user.id ? user.id.slice(0, 10) + '•••' : 'Private Session'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400">VIP Tier:</span>
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-amber-400" />
                        {user.vipTier}
                      </span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        if (onOpenProfile) onOpenProfile();
                        sounds.playChip();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-amber-400" />
                      <span>Profile & Profit Stats</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenWallet('deposit');
                        sounds.playChip();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span>Birr Cashier / Wallet</span>
                    </button>

                    {onOpenAdmin && (user.role === 'admin' || user.isAdmin || user.email === 'beamlakub9@gmail.com') && (
                      <button
                        id="dropdown-admin-dashboard-btn"
                        onClick={() => {
                          setUserMenuOpen(false);
                          onOpenAdmin();
                          sounds.playChip();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 transition-colors font-bold border-y border-amber-500/20 bg-amber-500/5"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Firebase Admin Command Center</span>
                      </button>
                    )}

                    <button
                      id="dropdown-switch-account-btn"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenAuth('login');
                        sounds.playChip();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-amber-400" />
                      <span>Log In / Switch Account</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800/80">
                    <button
                      id="dropdown-signout-btn"
                      onClick={() => {
                        setUserMenuOpen(false);
                        onSignOut();
                        sounds.playChip();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Log In Button */}
              <button
                id="header-login-btn"
                onClick={() => {
                  onOpenAuth('login');
                  sounds.playChip();
                }}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/80 hover:border-amber-500/50 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 whitespace-nowrap cursor-pointer"
                title="Log In"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span>Log In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
