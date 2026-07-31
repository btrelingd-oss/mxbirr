import React, { useState } from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, ShieldCheck, Crown, Volume2, VolumeX, Sparkles, ChevronDown, Flame } from 'lucide-react';
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
  soundEnabled: boolean;
  onToggleSound: () => void;
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
  soundEnabled,
  onToggleSound
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentPrice = prices[selectedCurrency]?.usdPrice || 1;
  const currentBalance = user.balances[selectedCurrency] || 0;
  const balanceUSD = `${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} Birr`;

  const currencies: CryptoCurrency[] = ['CBE', 'Telebirr'];

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

          {/* Wallet / Account Badge */}
          {user.connected ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/60 hover:border-slate-600 rounded-xl px-2.5 py-1.5 text-xs text-slate-200">
              <button
                onClick={() => {
                  if (onOpenProfile) onOpenProfile();
                  else onOpenWallet('deposit');
                  sounds.playChip();
                }}
                className="flex items-center gap-2 hover:text-amber-400 transition-colors"
                title="View Profile & Profit Graph"
              >
                <img src={user.avatar} alt="Avatar" className="w-6 h-6 rounded-full border border-amber-500/50 object-cover" referrerPolicy="no-referrer" />
                <span className="font-mono font-medium hidden md:inline">
                  {user.address ? `${user.address.substring(0, 4)}...${user.address.substring(user.address.length - 4)}` : user.username}
                </span>
              </button>
              <button
                onClick={onOpenVip}
                className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 transition-colors"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span>{user.vipTier}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenWallet('deposit');
                sounds.playChip();
              }}
              className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Wallet className="w-4 h-4 text-white" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
