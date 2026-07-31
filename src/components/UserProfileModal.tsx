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
  List
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar
} from 'recharts';
import { UserProfile, SpinResult, CryptoCurrency, GameMode } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  userSpins: SpinResult[];
  onUpdateClientSeed?: (seed: string) => void;
  onAddSampleSpins?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  userSpins,
  onUpdateClientSeed,
  onAddSampleSpins
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

  // Process data for the Profit Over Time Recharts graph
  let runningBalanceETB = 0;
  let peakProfitETB = 0;
  let lowestDrawdownETB = 0;

  // Chronological order (oldest to newest) for line plot
  const chronologicalSpins = [...filteredSpins].reverse();

  const chartData = chronologicalSpins.map((spin, index) => {
    const spinProfit = spin.payout - spin.wager;
    runningBalanceETB += spinProfit;

    if (runningBalanceETB > peakProfitETB) peakProfitETB = runningBalanceETB;
    if (runningBalanceETB < lowestDrawdownETB) lowestDrawdownETB = runningBalanceETB;

    const dateStr = spin.timestamp
      ? new Date(spin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : `Spin #${index + 1}`;

    return {
      index: index + 1,
      spinLabel: `Spin #${index + 1}`,
      time: dateStr,
      spinProfit: Number(spinProfit.toFixed(2)),
      cumulativeProfit: Number(runningBalanceETB.toFixed(2)),
      wager: spin.wager,
      payout: spin.payout,
      multiplier: spin.multiplier,
      mode: spin.mode,
      currency: spin.currency
    };
  });

  // Custom Recharts Area Tooltip for Profit Over Time
  const CustomProfitTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.cumulativeProfit >= 0;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs flex flex-col gap-1.5 min-w-[200px] backdrop-blur-md">
          <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1.5 mb-0.5">
            <span className="text-amber-400">{data.spinLabel}</span>
            <span className="text-slate-400 text-[10px] font-mono">{data.time}</span>
          </div>

          <div className="flex justify-between text-slate-300">
            <span>Game Mode:</span>
            <span className="font-semibold text-slate-100 uppercase">{data.mode}</span>
          </div>

          <div className="flex justify-between text-slate-300 font-mono">
            <span>Wager:</span>
            <span>{data.wager.toFixed(2)} {data.currency}</span>
          </div>

          <div className="flex justify-between text-slate-300 font-mono">
            <span>Payout:</span>
            <span className={data.multiplier > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              {data.payout.toFixed(2)} {data.currency} ({data.multiplier}x)
            </span>
          </div>

          <div className="flex justify-between font-mono font-bold pt-1.5 border-t border-slate-800 text-sm">
            <span>Profit / Loss:</span>
            <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {isPositive ? '+' : ''}{data.cumulativeProfit.toFixed(2)} ETB
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

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
              <span>Profit Over Time</span>
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

              {/* Four Stat Scorecard Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Win Rate</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-xl font-black font-mono text-amber-400">
                      {winRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-400">{winCount}W / {lossCount}L</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Total Wagered</span>
                  <div className="mt-2">
                    <span className="text-xl font-black font-mono text-slate-100">
                      {totalWageredETB.toLocaleString()} Birr
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Net Cumulative Profit</span>
                  <div className="mt-2">
                    <span className={`text-xl font-black font-mono ${netProfitETB >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netProfitETB >= 0 ? '+' : ''}{netProfitETB.toFixed(2)} Birr
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Max Multiplier</span>
                  <div className="mt-2">
                    <span className="text-xl font-black font-mono text-yellow-400">
                      {maxMultiplier.toFixed(1)}x
                    </span>
                  </div>
                </div>
              </div>

              {/* RECHARTS: Profit Over Time Graph */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-slate-100">
                      Profit Over Time Trajectory
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {chartData.length} Wagers Tracked
                  </span>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <Coins className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-xs font-semibold text-slate-400">No wager history found for selected filter.</p>
                    {onAddSampleSpins && (
                      <button
                        onClick={onAddSampleSpins}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        Generate Sample Wager History
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="profileProfitGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={netProfitETB >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={netProfitETB >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="spinLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v} Birr`} />
                        <Tooltip content={<CustomProfitTooltip />} />
                        <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" label={{ value: 'Breakeven', fill: '#64748b', fontSize: 10, position: 'insideBottomRight' }} />
                        <Area
                          type="monotone"
                          dataKey="cumulativeProfit"
                          stroke={netProfitETB >= 0 ? '#10b981' : '#f43f5e'}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#profileProfitGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
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
