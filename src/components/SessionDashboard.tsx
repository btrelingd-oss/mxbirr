import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Award,
  RotateCcw,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Zap,
  Percent,
  Coins,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { SpinResult, GameMode } from '../types';

interface SessionDashboardProps {
  sessionSpins: SpinResult[];
  onResetSession: () => void;
  onAddDemoSpins?: () => void;
}

export const SessionDashboard: React.FC<SessionDashboardProps> = ({
  sessionSpins,
  onResetSession,
  onAddDemoSpins
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'modes'>('overview');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | GameMode>('all');

  // Filter spins by selected mode
  const filteredSpins = selectedModeFilter === 'all'
    ? sessionSpins
    : sessionSpins.filter(s => s.mode === selectedModeFilter);

  // Statistics calculation
  const totalSpins = filteredSpins.length;
  const wins = filteredSpins.filter(s => s.multiplier > 0);
  const losses = filteredSpins.filter(s => s.multiplier === 0);
  const winCount = wins.length;
  const lossCount = losses.length;
  const winRate = totalSpins > 0 ? ((winCount / totalSpins) * 100) : 0;
  const winLossRatio = lossCount > 0 ? (winCount / lossCount) : winCount;

  const totalWageredUSD = filteredSpins.reduce((acc, s) => acc + (s.wagerUSD || 0), 0);
  const totalPayoutUSD = filteredSpins.reduce((acc, s) => acc + (s.payoutUSD || 0), 0);
  const netProfitUSD = totalPayoutUSD - totalWageredUSD;
  const maxMultiplier = filteredSpins.length > 0 ? Math.max(...filteredSpins.map(s => s.multiplier)) : 0;

  // Pie Chart Data (Wins vs Losses)
  const pieData = [
    { name: 'Wins', value: winCount, color: '#10b981' },
    { name: 'Losses', value: lossCount, color: '#f43f5e' }
  ];

  // Cumulative Net Profit Line/Area Data
  let runningProfit = 0;
  const cumulativeData = filteredSpins.map((spin, idx) => {
    const profit = spin.payoutUSD - spin.wagerUSD;
    runningProfit += profit;
    return {
      spinIndex: idx + 1,
      label: `Spin #${idx + 1}`,
      spinProfit: Number(profit.toFixed(2)),
      cumulativeProfit: Number(runningProfit.toFixed(2)),
      mode: spin.mode,
      multiplier: spin.multiplier,
      wagerUSD: spin.wagerUSD,
      payoutUSD: spin.payoutUSD
    };
  });

  // Game Mode Breakdown Data
  const gameModes: { id: GameMode; label: string }[] = [
    { id: 'fortune', label: 'Mega Fortune' },
    { id: 'slots', label: 'Crypto Slots' },
    { id: 'roulette', label: 'Roulette Spin' }
  ];

  const modeBreakdownData = gameModes.map(m => {
    const modeSpins = sessionSpins.filter(s => s.mode === m.id);
    const mWins = modeSpins.filter(s => s.multiplier > 0).length;
    const mLosses = modeSpins.filter(s => s.multiplier === 0).length;
    const mNet = modeSpins.reduce((acc, s) => acc + (s.payoutUSD - s.wagerUSD), 0);
    const mWinRate = modeSpins.length > 0 ? (mWins / modeSpins.length) * 100 : 0;

    return {
      mode: m.id,
      name: m.label,
      wins: mWins,
      losses: mLosses,
      total: modeSpins.length,
      winRate: Number(mWinRate.toFixed(1)),
      netProfit: Number(mNet.toFixed(2))
    };
  });

  // Custom Recharts Tooltips
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const pct = totalSpins > 0 ? ((data.value / totalSpins) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
          <div className="flex items-center gap-2 font-bold text-white mb-1">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="text-slate-300 font-mono">
            {data.value} Spins ({pct}%)
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomAreaTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositive = data.cumulativeProfit >= 0;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3.5 rounded-xl shadow-2xl text-xs flex flex-col gap-1 min-w-[170px]">
          <div className="font-bold text-amber-400 border-b border-slate-800 pb-1 mb-1">
            {data.label} ({data.mode.toUpperCase()})
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Result:</span>
            <span className={data.multiplier > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {data.multiplier > 0 ? `${data.multiplier}x Win` : '0x Loss'}
            </span>
          </div>
          <div className="flex justify-between text-slate-300 font-mono">
            <span>Wagered:</span>
            <span>${data.wagerUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-300 font-mono">
            <span>Payout:</span>
            <span>${data.payoutUSD.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-mono font-bold pt-1 border-t border-slate-800">
            <span>Cumulative P/L:</span>
            <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
              {isPositive ? '+' : ''}${data.cumulativeProfit.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs flex flex-col gap-1">
          <div className="font-bold text-slate-100 mb-1 border-b border-slate-800 pb-1">
            {data.name}
          </div>
          <div className="text-emerald-400 font-semibold flex justify-between gap-4">
            <span>Wins:</span>
            <span>{data.wins}</span>
          </div>
          <div className="text-rose-400 font-semibold flex justify-between gap-4">
            <span>Losses:</span>
            <span>{data.losses}</span>
          </div>
          <div className="text-amber-400 font-semibold flex justify-between gap-4">
            <span>Win Rate:</span>
            <span>{data.winRate}%</span>
          </div>
          <div className={`font-mono font-bold flex justify-between gap-4 ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <span>Net Profit:</span>
            <span>{data.netProfit >= 0 ? '+' : ''}${data.netProfit.toFixed(2)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-6">
      {/* Dashboard Top Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 rounded-xl text-amber-400 shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-100 flex items-center gap-2">
              Session Analytics Dashboard
              <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono px-2 py-0.5 rounded-full uppercase tracking-wider">
                Live Stats
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Real-time win/loss ratio, payout trends, and game performance for this session.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {onAddDemoSpins && totalSpins === 0 && (
            <button
              onClick={onAddDemoSpins}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load Demo Data</span>
            </button>
          )}

          {totalSpins > 0 && (
            <button
              onClick={onResetSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Mode Filter Pills & Tab Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Chart View Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Ratio & Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('trend')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'trend'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>P/L Profit Trend</span>
          </button>

          <button
            onClick={() => setActiveTab('modes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'modes'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Mode Breakdown</span>
          </button>
        </div>

        {/* Mode Filter Selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Filter Game:</span>
          <select
            value={selectedModeFilter}
            onChange={(e) => setSelectedModeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Game Modes</option>
            <option value="fortune">Mega Fortune Wheel</option>
            <option value="slots">Crypto Slots</option>
            <option value="roulette">Roulette Spin</option>
          </select>
        </div>
      </div>

      {/* Key Metric Scorecards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Win Rate */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Win Rate</span>
            <Percent className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
              {winRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              {winCount}W / {lossCount}L
            </span>
          </div>
        </div>

        {/* Metric 2: Win/Loss Ratio */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>W/L Ratio</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-slate-100 font-mono">
              {lossCount === 0 && winCount > 0 ? '100%' : winLossRatio.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {totalSpins} Total Spins
            </span>
          </div>
        </div>

        {/* Metric 3: Net Profit / Loss */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Session Net P/L</span>
            {netProfitUSD >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl sm:text-2xl font-black font-mono ${netProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfitUSD >= 0 ? '+' : ''}{netProfitUSD.toFixed(2)} Birr
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {totalWageredUSD.toFixed(1)} Birr Wagered
            </span>
          </div>
        </div>

        {/* Metric 4: Best Win Multiplier */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Best Multiplier</span>
            <Award className="w-3.5 h-3.5 text-yellow-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">
              {maxMultiplier.toFixed(1)}x
            </span>
            <span className="text-[11px] text-slate-400">Peak Payout</span>
          </div>
        </div>
      </div>

      {/* Main Chart Visualization Section */}
      {totalSpins === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-8 bg-slate-950/50 border border-slate-800/60 rounded-xl text-center min-h-[240px]">
          <Coins className="w-12 h-12 text-slate-600 mb-3 animate-bounce" />
          <h4 className="font-bold text-slate-300 text-sm">No Session Spins Recorded Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
            Place your first bet or spin the wheel above to start tracking real-time win/loss analytics with interactive charts.
          </p>
          {onAddDemoSpins && (
            <button
              onClick={onAddDemoSpins}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all"
            >
              Generate Demo Session Data 📊
            </button>
          )}
        </div>
      ) : (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 min-h-[300px] flex flex-col justify-center">
          {/* TAB 1: Ratio Donut & Summary Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Recharts Pie Donut Chart */}
              <div className="md:col-span-6 h-[250px] relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={3} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Overlay Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {winRate.toFixed(0)}%
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Win Rate
                  </span>
                </div>
              </div>

              {/* Detailed Ratio & Statistics Breakdown */}
              <div className="md:col-span-6 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-200">Winning Spins</span>
                  </div>
                  <div className="font-mono font-bold text-emerald-400">
                    {winCount} ({totalSpins > 0 ? ((winCount / totalSpins) * 100).toFixed(1) : 0}%)
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="font-semibold text-slate-200">Loss / Non-Winning Spins</span>
                  </div>
                  <div className="font-mono font-bold text-rose-400">
                    {lossCount} ({totalSpins > 0 ? ((lossCount / totalSpins) * 100).toFixed(1) : 0}%)
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-slate-300">Total USD Wagered</span>
                  <span className="font-mono font-bold text-slate-200">${totalWageredUSD.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-slate-300">Total USD Paid Out</span>
                  <span className="font-mono font-bold text-amber-400">${totalPayoutUSD.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Cumulative Profit/Loss Trend Area Chart */}
          {activeTab === 'trend' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
                <span>Cumulative Net Profit Progression (USD)</span>
                <span className="font-mono">Spins 1 to {totalSpins}</span>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={netProfitUSD >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={netProfitUSD >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="label" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val}`} />
                    <Tooltip content={<CustomAreaTooltip />} />
                    <ReferenceLine y={0} stroke="#475569" strokeDasharray="3 3" />
                    <Area
                      type="monotone"
                      dataKey="cumulativeProfit"
                      stroke={netProfitUSD >= 0 ? '#10b981' : '#f43f5e'}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorProfit)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 3: Mode Breakdown Bar Chart */}
          {activeTab === 'modes' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
                <span>Wins vs Losses by Game Mode</span>
                <span className="font-mono">Fortune vs Slots vs Roulette</span>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modeBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="wins" name="Wins" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="losses" name="Losses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
