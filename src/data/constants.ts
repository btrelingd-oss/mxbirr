import { FortuneSegment, SlotSymbol, CryptoCurrency, CryptoPrice, VipTier } from '../types';

export const INITIAL_CRYPTO_PRICES: Record<CryptoCurrency, CryptoPrice> = {
  CBE: { symbol: 'CBE', name: 'CBE Birr', usdPrice: 1.00, change24h: 0.00, icon: '🏦' },
  Telebirr: { symbol: 'Telebirr', name: 'Telebirr', usdPrice: 1.00, change24h: 0.00, icon: '📱' }
};

export const FORTUNE_WHEEL_SEGMENTS: FortuneSegment[] = [
  { id: 0, label: '0x', multiplier: 0, color: '#8b0000', textColor: '#ffffff', probability: 0.40 },
  { id: 1, label: '1.5x', multiplier: 1.5, color: '#0d0d0d', textColor: '#ffffff', probability: 0.003 },
  { id: 2, label: '0x', multiplier: 0, color: '#8b0000', textColor: '#ffffff', probability: 0.30 },
  { id: 3, label: '2.0x', multiplier: 2.0, color: '#0d0d0d', textColor: '#ffffff', probability: 0.0025 },
  { id: 4, label: '0.5x', multiplier: 0.5, color: '#8b0000', textColor: '#ffffff', probability: 0.002 },
  { id: 5, label: '3.0x', multiplier: 3.0, color: '#0d0d0d', textColor: '#ffffff', probability: 0.001 },
  { id: 6, label: '0x', multiplier: 0, color: '#8b0000', textColor: '#ffffff', probability: 0.29 },
  { id: 7, label: '5.0x', multiplier: 5.0, color: '#0d0d0d', textColor: '#ffffff', probability: 0.0008 },
  { id: 8, label: '1.2x', multiplier: 1.2, color: '#8b0000', textColor: '#ffffff', probability: 0.0004 },
  { id: 9, label: '10.0x', multiplier: 10.0, color: '#0d0d0d', textColor: '#ffffff', probability: 0.0002 },
  { id: 10, label: '25.0x', multiplier: 25.0, color: '#8b0000', textColor: '#ffffff', probability: 0.00007 },
  { id: 11, label: '100x', multiplier: 100.0, color: '#0d0d0d', textColor: '#f59e0b', probability: 0.00003 }
];

export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'cbe', name: 'CBE Birr', symbol: '🏦', multiplier: 50, color: '#f59e0b', bgGradient: 'from-amber-500/20 to-amber-600/30' },
  { id: 'telebirr', name: 'Telebirr', symbol: '📱', multiplier: 25, color: '#0284c7', bgGradient: 'from-sky-500/20 to-sky-600/30' },
  { id: 'flag', name: 'Ethiopian Crown', symbol: '👑', multiplier: 15, color: '#a855f7', bgGradient: 'from-purple-500/20 to-purple-600/30' },
  { id: 'coin', name: 'Gold Coin', symbol: '🪙', multiplier: 8, color: '#10b981', bgGradient: 'from-emerald-500/20 to-emerald-600/30' },
  { id: 'star', name: 'Gold Star', symbol: '⭐', multiplier: 5, color: '#eab308', bgGradient: 'from-yellow-500/20 to-yellow-600/30' },
  { id: 'gem', name: 'Crypto Gem', symbol: '💎', multiplier: 100, color: '#38bdf8', bgGradient: 'from-sky-500/20 to-sky-600/30' },
  { id: 'wild', name: '777 Wild', symbol: '🎰', multiplier: 250, color: '#ef4444', bgGradient: 'from-red-500/20 to-red-600/30' }
];

export const ROULETTE_NUMBERS = [
  { num: 0, color: 'green' },
  { num: 32, color: 'red' }, { num: 15, color: 'black' }, { num: 19, color: 'red' }, { num: 4, color: 'black' },
  { num: 21, color: 'red' }, { num: 2, color: 'black' }, { num: 25, color: 'red' }, { num: 17, color: 'black' },
  { num: 34, color: 'red' }, { num: 6, color: 'black' }, { num: 27, color: 'red' }, { num: 13, color: 'black' },
  { num: 36, color: 'red' }, { num: 11, color: 'black' }, { num: 30, color: 'red' }, { num: 8, color: 'black' },
  { num: 23, color: 'red' }, { num: 10, color: 'black' }, { num: 5, color: 'red' }, { num: 24, color: 'black' },
  { num: 16, color: 'red' }, { num: 33, color: 'black' }, { num: 1, color: 'red' }, { num: 20, color: 'black' },
  { num: 14, color: 'red' }, { num: 31, color: 'black' }, { num: 9, color: 'red' }, { num: 22, color: 'black' },
  { num: 18, color: 'red' }, { num: 29, color: 'black' }, { num: 7, color: 'red' }, { num: 28, color: 'black' },
  { num: 12, color: 'red' }, { num: 35, color: 'black' }, { num: 3, color: 'red' }, { num: 26, color: 'black' }
];

export const VIP_LEVELS: { name: VipTier; minWageredUSD: number; cashbackPercent: number; badgeColor: string }[] = [
  { name: 'Bronze', minWageredUSD: 0, cashbackPercent: 1.0, badgeColor: 'from-amber-700 to-amber-900' },
  { name: 'Silver', minWageredUSD: 1000, cashbackPercent: 2.5, badgeColor: 'from-slate-400 to-slate-600' },
  { name: 'Gold', minWageredUSD: 5000, cashbackPercent: 5.0, badgeColor: 'from-yellow-400 to-amber-500' },
  { name: 'Platinum', minWageredUSD: 25000, cashbackPercent: 8.0, badgeColor: 'from-cyan-400 to-blue-600' },
  { name: 'Diamond', minWageredUSD: 100000, cashbackPercent: 12.0, badgeColor: 'from-purple-400 to-pink-600' }
];
