export interface LiveWinnerFeedItem {
  id: string;
  username: string;
  badge: string; // 'BIG WIN'
  mode: 'FORTUNE' | 'ROULETTE' | 'SLOTS' | 'PRIZE WHEEL';
  payout: number;
  multiplier: number;
  wager: number;
  timestamp: number;
  vipTier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
  bankName: string;
  bankAccountNumber: string;
  telebirrNumber: string;
  location: string;
}

export const INITIAL_LIVE_WINNERS: LiveWinnerFeedItem[] = [
  {
    id: 'win_1',
    username: 'Liyu_Master',
    badge: 'BIG WIN',
    mode: 'FORTUNE',
    payout: 52500,
    multiplier: 100,
    wager: 525,
    timestamp: Date.now() - 300,
    vipTier: 'Diamond',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 4821 9923 1',
    telebirrNumber: '0911 482 992',
    location: 'Addis Ababa (Bole)'
  },
  {
    id: 'win_2',
    username: 'bebelu jo 🎧',
    badge: 'BIG WIN',
    mode: 'ROULETTE',
    payout: 66750,
    multiplier: 50,
    wager: 1335,
    timestamp: Date.now() - 800,
    vipTier: 'Platinum',
    bankName: 'Telebirr SuperApp',
    bankAccountNumber: '0922 667 501',
    telebirrNumber: '0922 667 501',
    location: 'Hawassa'
  },
  {
    id: 'win_3',
    username: 'Bekele_Gold',
    badge: 'BIG WIN',
    mode: 'FORTUNE',
    payout: 50950,
    multiplier: 50,
    wager: 1019,
    timestamp: Date.now() - 1400,
    vipTier: 'Gold',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 5095 8124 2',
    telebirrNumber: '0912 509 500',
    location: 'Adama'
  },
  {
    id: 'win_4',
    username: 'Liyu_Master',
    badge: 'BIG WIN',
    mode: 'SLOTS',
    payout: 59650,
    multiplier: 100,
    wager: 596,
    timestamp: Date.now() - 1900,
    vipTier: 'Diamond',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 4821 9923 1',
    telebirrNumber: '0911 482 992',
    location: 'Addis Ababa (Bole)'
  },
  {
    id: 'win_5',
    username: 'ABDI_BORA',
    badge: 'BIG WIN',
    mode: 'FORTUNE',
    payout: 69000,
    multiplier: 100,
    wager: 690,
    timestamp: Date.now() - 2500,
    vipTier: 'Gold',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 6900 1289 4',
    telebirrNumber: '0922 419 8812',
    location: 'Bishoftu'
  },
  {
    id: 'win_6',
    username: '@am_car_77',
    badge: 'BIG WIN',
    mode: 'SLOTS',
    payout: 95500,
    multiplier: 3,
    wager: 31833,
    timestamp: Date.now() - 3200,
    vipTier: 'Platinum',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 7716 3901 8',
    telebirrNumber: '0935 955 007',
    location: 'Addis Ababa (CMC)'
  },
  {
    id: 'win_7',
    username: 'Sami_Fast',
    badge: 'BIG WIN',
    mode: 'PRIZE WHEEL',
    payout: 53200,
    multiplier: 50,
    wager: 1064,
    timestamp: Date.now() - 3800,
    vipTier: 'Gold',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 2660 7412 9',
    telebirrNumber: '0913 266 000',
    location: 'Bahir Dar'
  },
  {
    id: 'win_8',
    username: 'bebelu jo 🎧',
    badge: 'BIG WIN',
    mode: 'FORTUNE',
    payout: 62250,
    multiplier: 25,
    wager: 2490,
    timestamp: Date.now() - 4500,
    vipTier: 'Platinum',
    bankName: 'Telebirr SuperApp',
    bankAccountNumber: '0922 667 501',
    telebirrNumber: '0922 667 501',
    location: 'Hawassa'
  },
  {
    id: 'win_9',
    username: 'Tadesse_Pro',
    badge: 'BIG WIN',
    mode: 'FORTUNE',
    payout: 84000,
    multiplier: 80,
    wager: 1050,
    timestamp: Date.now() - 5200,
    vipTier: 'Diamond',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 8400 3391 2',
    telebirrNumber: '0910 840 011',
    location: 'Addis Ababa (Megenagna)'
  },
  {
    id: 'win_10',
    username: 'Helen_Fortune',
    badge: 'BIG WIN',
    mode: 'SLOTS',
    payout: 115000,
    multiplier: 150,
    wager: 766,
    timestamp: Date.now() - 6000,
    vipTier: 'Platinum',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 1150 4912 3',
    telebirrNumber: '0911 115 000',
    location: 'Addis Ababa (Sarbet)'
  },
  {
    id: 'win_11',
    username: 'Dawit_Hero',
    badge: 'BIG WIN',
    mode: 'ROULETTE',
    payout: 75000,
    multiplier: 50,
    wager: 1500,
    timestamp: Date.now() - 6800,
    vipTier: 'Gold',
    bankName: 'Telebirr SuperApp',
    bankAccountNumber: '0924 375 001',
    telebirrNumber: '0924 375 001',
    location: 'Dire Dawa'
  },
  {
    id: 'win_12',
    username: 'Chala_Jackpot',
    badge: 'BIG WIN',
    mode: 'PRIZE WHEEL',
    payout: 78200,
    multiplier: 70,
    wager: 1117,
    timestamp: Date.now() - 7500,
    vipTier: 'Diamond',
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: '1000 7820 5519 8',
    telebirrNumber: '0912 782 000',
    location: 'Jimma'
  }
];

export const WINNERS_POOL = [
  { name: 'Liyu_Master', vip: 'Diamond' as const, loc: 'Addis Ababa (Bole)', cbe: '1000 4821 9923 1', tele: '0911 482 992' },
  { name: 'bebelu jo 🎧', vip: 'Platinum' as const, loc: 'Hawassa', cbe: '1000 6675 0192 3', tele: '0922 667 501' },
  { name: 'Bekele_Gold', vip: 'Gold' as const, loc: 'Adama', cbe: '1000 5095 8124 2', tele: '0912 509 500' },
  { name: 'ABDI_BORA', vip: 'Gold' as const, loc: 'Bishoftu', cbe: '1000 6900 1289 4', tele: '0922 419 8812' },
  { name: '@am_car_77', vip: 'Platinum' as const, loc: 'Addis Ababa (CMC)', cbe: '1000 7716 3901 8', tele: '0935 955 007' },
  { name: 'Sami_Fast', vip: 'Gold' as const, loc: 'Bahir Dar', cbe: '1000 2660 7412 9', tele: '0913 266 000' },
  { name: 'Tadesse_Pro', vip: 'Diamond' as const, loc: 'Addis Ababa (Megenagna)', cbe: '1000 8400 3391 2', tele: '0910 840 011' },
  { name: 'Helen_Fortune', vip: 'Platinum' as const, loc: 'Addis Ababa (Sarbet)', cbe: '1000 1150 4912 3', tele: '0911 115 000' },
  { name: 'Dawit_Hero', vip: 'Gold' as const, loc: 'Dire Dawa', cbe: '1000 3750 9182 5', tele: '0924 375 001' },
  { name: 'Chala_Jackpot', vip: 'Diamond' as const, loc: 'Jimma', cbe: '1000 7820 5519 8', tele: '0912 782 000' },
  { name: 'Aster_Gold', vip: 'Platinum' as const, loc: 'Gondar', cbe: '1000 4920 1827 6', tele: '0918 492 001' },
  { name: 'Natnael_VIP', vip: 'Diamond' as const, loc: 'Addis Ababa (Piassa)', cbe: '1000 9120 4481 0', tele: '0911 912 000' },
  { name: 'Kassahun_Win', vip: 'Gold' as const, loc: 'Adama', cbe: '1000 3180 6629 1', tele: '0913 318 000' },
  { name: 'Buze_Fast', vip: 'Platinum' as const, loc: 'Addis Ababa (Kazanchis)', cbe: '1000 7250 8812 4', tele: '0920 725 000' },
  { name: 'Mulugeta_Rich', vip: 'Diamond' as const, loc: 'Debre Zeit', cbe: '1000 9810 2234 5', tele: '0911 981 000' }
];

export const WIN_AMOUNTS_POOL = [
  { payout: 50000, mult: 50 },
  { payout: 50950, mult: 50 },
  { payout: 52500, mult: 75 },
  { payout: 54000, mult: 60 },
  { payout: 59650, mult: 100 },
  { payout: 66750, mult: 50 },
  { payout: 69000, mult: 100 },
  { payout: 75000, mult: 50 },
  { payout: 78200, mult: 70 },
  { payout: 84000, mult: 80 },
  { payout: 92000, mult: 90 },
  { payout: 95500, mult: 30 },
  { payout: 115000, mult: 150 },
  { payout: 128000, mult: 200 },
  { payout: 150000, mult: 150 },
  { payout: 185000, mult: 185 },
  { payout: 240000, mult: 240 }
];

export function generateNextLiveWinner(): LiveWinnerFeedItem {
  const profile = WINNERS_POOL[Math.floor(Math.random() * WINNERS_POOL.length)];
  const win = WIN_AMOUNTS_POOL[Math.floor(Math.random() * WIN_AMOUNTS_POOL.length)];
  const modes: ('FORTUNE' | 'ROULETTE' | 'SLOTS' | 'PRIZE WHEEL')[] = ['FORTUNE', 'ROULETTE', 'SLOTS', 'PRIZE WHEEL'];
  const mode = modes[Math.floor(Math.random() * modes.length)];

  return {
    id: 'win_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    username: profile.name,
    badge: 'BIG WIN',
    mode,
    payout: win.payout,
    multiplier: win.mult,
    wager: Math.max(1, Math.round(win.payout / win.mult)),
    timestamp: Date.now(),
    vipTier: profile.vip,
    bankName: 'Commercial Bank of Ethiopia (CBE)',
    bankAccountNumber: profile.cbe,
    telebirrNumber: profile.tele,
    location: profile.loc
  };
}
