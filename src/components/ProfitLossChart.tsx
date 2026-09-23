import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Percent,
  Coins,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { SpinResult, CryptoCurrency, GameMode } from '../types';

interface ProfitLossChartProps {
  spins: SpinResult[];
  currencyFilter: 'ALL' | CryptoCurrency;
  gameFilter: 'ALL' | GameMode;
  onAddSampleSpins?: () => void;
}

type ChartViewMode = 'cumulative' | 'perSpin';
type RangeMode = 'ALL' | '10' | '20' | '50';

export const ProfitLossChart: React.FC<ProfitLossChartProps> = ({
  spins,
  currencyFilter,
  gameFilter,
  onAddSampleSpins
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('cumulative');
  const [rangeMode, setRangeMode] = useState<RangeMode>('ALL');

  // Filter spins according to active filters
  const filteredSpins = useMemo(() => {
    return spins.filter((s) => {
      const matchesCurrency = currencyFilter === 'ALL' || s.currency === currencyFilter;
      const matchesGame = gameFilter === 'ALL' || s.mode === gameFilter;
      return matchesCurrency && matchesGame;
    });
  }, [spins, currencyFilter, gameFilter]);

  // Sliced according to range
  const scopedSpins = useMemo(() => {
    if (rangeMode === 'ALL') return filteredSpins;
    const limit = parseInt(rangeMode, 10);
    return filteredSpins.slice(0, limit);
  }, [filteredSpins, rangeMode]);

  // Chronological order (oldest to newest) for chart plotting
  const chartData = useMemo(() => {
    const chronological = [...scopedSpins].reverse();
    let cumulative = 0;
    let peak = 0;
    let drawdown = 0;

    return chronological.map((spin, index) => {
      const spinProfit = Number((spin.payout - spin.wager).toFixed(2));
      cumulative = Number((cumulative + spinProfit).toFixed(2));

      if (cumulative > peak) peak = cumulative;
      if (cumulative < drawdown) drawdown = cumulative;

      const dateStr = spin.timestamp
        ? new Date(spin.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : `#${index + 1}`;

      return {
        index: index + 1,
        label: `Spin ${index + 1}`,
        time: dateStr,
        spinProfit,
        cumulativeProfit: cumulative,
        wager: spin.wager,
        payout: spin.payout,
        multiplier: spin.multiplier,
        mode: spin.mode,
        currency: spin.currency,
        isWin: spin.multiplier > 0
      };
    });
  }, [scopedSpins]);

  // Overall statistics for current scope
  const stats = useMemo(() => {
    const totalWagered = scopedSpins.reduce((acc, s) => acc + (s.wager || 0), 0);
    const totalPayout = scopedSpins.reduce((acc, s) => acc + (s.payout || 0), 0);
    const netProfit = totalPayout - totalWagered;
    const wins = scopedSpins.filter((s) => s.multiplier > 0);
    const winRate = scopedSpins.length > 0 ? (wins.length / scopedSpins.length) * 100 : 0;
    const roi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;

    let peak = 0;
    let maxDrawdown = 0;
    let currentCum = 0;

    [...scopedSpins].reverse().forEach((s) => {
      currentCum += s.payout - s.wager;
      if (currentCum > peak) peak = currentCum;
      if (currentCum < maxDrawdown) maxDrawdown = currentCum;
    });

    return {
      totalWagered,
      totalPayout,
      netProfit,
      winRate,
      roi,
      peak,
      maxDrawdown,
      spinCount: scopedSpins.length,
      winCount: wins.length,
      lossCount: scopedSpins.length - wins.length
    };
  }, [scopedSpins]);

  // Gradient offset calculation for dynamic profit (emerald) / loss (rose) split
  const activeDataKey = viewMode === 'cumulative' ? 'cumulativeProfit' : 'spinProfit';

  const gradientOffset = useMemo(() => {
    if (chartData.length === 0) return 0.5;
    const values = chartData.map((d) => d[activeDataKey]);
    const max = Math.max(...values, 0);
    const min = Math.min(...values, 0);

    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  }, [chartData, activeDataKey]);

  // Custom rich Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSpinProfitable = data.spinProfit >= 0;
      const isCumProfitable = data.cumulativeProfit >= 0;

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl text-xs flex flex-col gap-2 min-w-[220px] backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-2">
            <span className="text-amber-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              {data.label}
            </span>
            <span className="text-slate-400 text-[10px] font-mono">{data.time}</span>
          </div>

          {/* Mode & Currency */}
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-[11px] text-slate-400">Game Type:</span>
            <span className="font-semibold text-slate-100 uppercase text-[11px] bg-slate-800 px-2 py-0.5 rounded">
              {data.mode === 'fortune' ? 'Wheel' : data.mode}
            </span>
          </div>

          {/* Wager vs Payout */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <div>
              <span className="text-slate-400 block text-[10px]">Wagered</span>
              <span className="font-mono text-slate-200 font-semibold">
                {data.wager.toFixed(2)} {data.currency}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px]">Payout ({data.multiplier}x)</span>
              <span
                className={`font-mono font-bold ${
                  data.multiplier > 0 ? 'text-emerald-400' : 'text-slate-400'
                }`}
              >
                {data.payout.toFixed(2)} {data.currency}
              </span>
            </div>
          </div>

          {/* Spin Delta */}
          <div className="flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-1.5 font-mono">
            <span className="text-slate-400">Spin Result:</span>
            <span
              className={`font-bold flex items-center gap-0.5 ${
                isSpinProfitable ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isSpinProfitable ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {isSpinProfitable ? '+' : ''}
              {data.spinProfit.toFixed(2)} Birr
            </span>
          </div>

          {/* Cumulative Total */}
          <div className="flex items-center justify-between text-xs font-bold font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
            <span className="text-slate-300">Cumulative PnL:</span>
            <span className={isCumProfitable ? 'text-emerald-400' : 'text-rose-400'}>
              {isCumProfitable ? '+' : ''}
              {data.cumulativeProfit.toFixed(2)} Birr
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl border ${
              stats.netProfit >= 0
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
            }`}
          >
            {stats.netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-100 flex items-center gap-2">
              <span>Historical Profit / Loss Area Chart</span>
              <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                Recharts
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Visualizes real-time wager performance, drawdown, and net trajectory over spins.
            </p>
          </div>
        </div>

        {/* View Mode & Range Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switch: Cumulative vs Per-Spin */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'cumulative'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Cumulative PnL
            </button>
            <button
              onClick={() => setViewMode('perSpin')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                viewMode === 'perSpin'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Per-Spin Delta
            </button>
          </div>

          {/* Scope / Range Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            {(['ALL', '10', '20'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRangeMode(r)}
                className={`px-2 py-1 rounded-lg font-bold transition-all text-[11px] ${
                  rangeMode === r
                    ? 'bg-slate-800 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'ALL' ? 'All' : `Last ${r}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Financial Key Performance Indicator Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Net Realized PnL</span>
            {stats.netProfit >= 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            )}
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className={`text-base sm:text-lg font-black font-mono ${
                stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {stats.netProfit >= 0 ? '+' : ''}
              {stats.netProfit.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Birr</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            ROI: {stats.roi >= 0 ? '+' : ''}
            {stats.roi.toFixed(1)}%
          </span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Peak Profit</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400">
              +{stats.peak.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Birr</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 mt-0.5">All-time high</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Max Drawdown</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black font-mono text-rose-400">
              {stats.maxDrawdown.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Birr</span>
          </div>
          <span className="text-[10px] text-rose-400/80 mt-0.5">Deepest trough</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-400">Win / Loss Ratio</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black font-mono text-amber-400">
              {stats.winRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">
            {stats.winCount} Wins / {stats.lossCount} Losses
          </span>
        </div>
      </div>

      {/* Main Recharts Area Chart Container */}
      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 bg-slate-900/40 rounded-xl border border-dashed border-slate-800">
          <Coins className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
          <p className="text-xs font-semibold text-slate-300">
            No historical wagers matching current filters.
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
            Spin the wheel, slots, or roulette in the arena or add sample spins to generate your profit/loss curve.
          </p>
          {onAddSampleSpins && (
            <button
              onClick={onAddSampleSpins}
              className="mt-3.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Sample Spin Data</span>
            </button>
          )}
        </div>
      ) : (
        <div className="h-[290px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 12, right: 15, left: -10, bottom: 0 }}>
              <defs>
                {/* Dynamic split gradient: Green above zero, Red below zero */}
                <linearGradient id="splitFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.45} />
                  <stop offset={`${gradientOffset * 100}%`} stopColor="#10b981" stopOpacity={0.08} />
                  <stop offset={`${gradientOffset * 100}%`} stopColor="#f43f5e" stopOpacity={0.08} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.45} />
                </linearGradient>

                <linearGradient id="splitStroke" x1="0" y1="0" x2="0" y2="1">
                  <stop offset={`${gradientOffset * 100}%`} stopColor="#10b981" stopOpacity={1} />
                  <stop offset={`${gradientOffset * 100}%`} stopColor="#f43f5e" stopOpacity={1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              
              <XAxis
                dataKey="label"
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
              />
              
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                tickLine={false}
                tickFormatter={(v) => `${v > 0 ? '+' : ''}${v} Birr`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Zero Reference Line indicating Breakeven Point */}
              <ReferenceLine
                y={0}
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: 'Breakeven (0 Birr)',
                  fill: '#94a3b8',
                  fontSize: 10,
                  position: 'insideBottomRight'
                }}
              />

              <Area
                type="monotone"
                dataKey={activeDataKey}
                stroke="url(#splitStroke)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#splitFill)"
                activeDot={{
                  r: 6,
                  fill: '#f59e0b',
                  stroke: '#020617',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Chart Footer with Provably Fair & Verification Note */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Every point maps to a cryptographic SHA-256 seed & nonce</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Profit Region
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Loss Region
          </span>
        </div>
      </div>
    </div>
  );
};
