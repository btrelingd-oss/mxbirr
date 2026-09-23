import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  TrendingUp,
  TrendingDown,
  Award,
  Crown,
  Copy,
  Check,
  RefreshCw,
  Coins,
  Percent,
  Calendar,
  Zap,
  Sparkles,
  BarChart2,
  List,
  LogIn
} from 'lucide-react';
import { UserProfile, SpinResult, CryptoCurrency, GameMode } from '../types';
import { ProfitLossChart } from './ProfitLossChart';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  userSpins: SpinResult[];
  onUpdateClientSeed?: (seed: string) => void;
  onAddSampleSpins?: () => void;
  onOpenAuth?: (mode?: 'login' | 'register') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userSpins,
  onUpdateClientSeed,
  onAddSampleSpins,
  onOpenAuth
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'history' | 'settings'>('analytics');
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | CryptoCurrency>('ALL');
  const [gameFilter, setGameFilter] = useState<'ALL' | GameMode>('ALL');
  const [clientSeedInput, setClientSeedInput] = useState(user.clientSeed || '');
  const [seedSaved, setSeedSaved] = useState(false);

  if (!isOpen) return null;

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (user.address) {
      navigator.clipboard.writeText(user.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter spins based on user selection
  const filteredSpins = userSpins.filter((s) => {
    const matchesCurrency = currencyFilter === 'ALL' || s.currency === currencyFilter;
    const matchesGame = gameFilter === 'ALL' || s.mode === gameFilter;
    return matchesCurrency && matchesGame;
  });

  // Calculate stats
  const totalSpins = filteredSpins.length;
  const wins = filteredSpins.filter((s) => s.multiplier > 0);
  const winCount = wins.length;
  const lossCount = totalSpins - winCount;
  const winRate = totalSpins > 0 ? (winCount / totalSpins) * 100 : 0;

  const totalWageredETB = filteredSpins.reduce((sum, s) => sum + (s.wager || 0), 0);
  const totalPayoutETB = filteredSpins.reduce((sum, s) => sum + (s.payout || 0), 0);
  const netProfitETB = totalPayoutETB - totalWageredETB;
  const maxMultiplier = totalSpins > 0 ? Math.max(...filteredSpins.map((s) => s.multiplier)) : 0;

  const handleSaveSeed = () => {
    if (onUpdateClientSeed && clientSeedInput.trim()) {
      onUpdateClientSeed(clientSeedInput.trim());
      setSeedSaved(true);
      setTimeout(() => setSeedSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-100 flex items-center gap-2">
                User Profile & Wagering Performance
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualize profit trajectory, balance history, and provably fair wager stats.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card Bar */}
        <div className="bg-slate-950/40 p-4 border-b border-slate-800/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="w-14 h-14 rounded-2xl border-2 border-amber-500/50 object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-lg text-[10px] font-black shadow-md flex items-center gap-0.5">
                <Crown className="w-3 h-3" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{user.username}</h3>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  {user.vipTier} VIP
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {user.address ? `${user.address.substring(0, 6)}...${user.address.substring(user.address.length - 4)}` : 'Connected Wallet'}
                </span>
                {user.address && (
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Balance Summary Badges */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex flex-col min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">CBE Balance</span>
              <span className="font-mono font-bold text-slate-100 text-xs">
                {(user.balances.CBE || 0).toLocaleString()} Birr
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex flex-col min-w-[110px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Telebirr Balance</span>
              <span className="font-mono font-bold text-slate-100 text-xs">
                {(user.balances.Telebirr || 0).toLocaleString()} Birr
              </span>
            </div>

            <div className="bg-slate-900 border border-emerald-500/30 px-3 py-2 rounded-xl flex flex-col min-w-[120px]">
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Net Profit</span>
              <span className={`font-mono font-bold text-xs ${netProfitETB >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {netProfitETB >= 0 ? '+' : ''}{netProfitETB.toFixed(2)} Birr
              </span>
            </div>
          </div>
        </div>

        {/* Guest Warning Banner if not authenticated */}
        {!user.isAuthenticated && onOpenAuth && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You are playing as a <strong>Guest</strong>. Log in to permanently sync your balances, VIP perks, and wagering history!</span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="profile-modal-login-btn"
                onClick={() => onOpenAuth('login')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                id="profile-modal-register-btn"
                onClick={() => onOpenAuth('register')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold text-xs transition-all"
              >
                Register
              </button>
            </div>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="px-4 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'analytics'
                  ? 'border-amber-500 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Profit / Loss Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'history'
                  ? 'border-amber-500 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Wagering Logs ({filteredSpins.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-xl text-xs font-bold transition-all border-b-2 ${
                activeTab === 'settings'
                  ? 'border-amber-500 text-amber-400 bg-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Seed & Security</span>
            </button>
          </div>

          {onOpenAuth && (
            <button
              id="profile-open-switch-btn"
              onClick={() => onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all mb-1"
              title="Log In / Switch Account"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          )}

          {/* Action to add sample spins if graph has low data */}
          {onAddSampleSpins && (
            <button
              onClick={onAddSampleSpins}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[11px] font-bold mb-2 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Add Sample Wagers</span>
            </button>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Currency:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {(['ALL', 'CBE', 'Telebirr'] as const).map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurrencyFilter(c)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                          currencyFilter === c
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Game Mode:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    {(['ALL', 'fortune', 'slots', 'roulette'] as const).map((gm) => (
                      <button
                        key={gm}
                        onClick={() => setGameFilter(gm)}
                        className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                          gameFilter === gm
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {gm === 'fortune' ? 'Wheel' : gm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Profit / Loss Recharts Area Chart Visualization */}
              <ProfitLossChart
                spins={userSpins}
                currencyFilter={currencyFilter}
                gameFilter={gameFilter}
                onAddSampleSpins={onAddSampleSpins}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-200">Full Wagering Log</h3>
                <span className="text-xs text-slate-400 font-mono">{filteredSpins.length} Total Spins</span>
              </div>

              {filteredSpins.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">No wager logs found.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Wager</th>
                        <th className="p-3">Mult</th>
                        <th className="p-3">Payout</th>
                        <th className="p-3">Profit/Loss</th>
                        <th className="p-3 text-right">Fair Hash</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredSpins.map((s, idx) => {
                        const profit = s.payout - s.wager;
                        const isWin = s.multiplier > 0;
                        return (
                          <tr key={s.id || idx} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-200 uppercase">{s.mode}</td>
                            <td className="p-3 text-slate-300">{s.wager.toFixed(2)} {s.currency}</td>
                            <td className="p-3 font-bold text-amber-400">{s.multiplier}x</td>
                            <td className="p-3 text-slate-300">{s.payout.toFixed(2)} {s.currency}</td>
                            <td className={`p-3 font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {profit >= 0 ? '+' : ''}{profit.toFixed(2)}
                            </td>
                            <td className="p-3 text-right text-[10px] text-slate-500">
                              {s.serverSeedHash ? `${s.serverSeedHash.substring(0, 8)}...` : '0x7a81f...'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-xl">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-100">Provably Fair Client Seed</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Your client seed combines with our server seed hash to deterministically calculate every spin result. You can change your seed anytime to ensure total transparency.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Active Client Seed</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={clientSeedInput}
                      onChange={(e) => setClientSeedInput(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                      placeholder="Enter custom client seed..."
                    />
                    <button
                      onClick={handleSaveSeed}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-all"
                    >
                      {seedSaved ? 'Saved!' : 'Update Seed'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className="font-bold text-sm text-slate-100">VIP Tier Perks</h3>
                <div className="flex items-center justify-between text-xs bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-200">Current Tier: {user.vipTier}</span>
                  </div>
                  <span className="text-amber-400 font-mono font-bold">{user.vipPoints} VIP Points</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
