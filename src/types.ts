export type CryptoCurrency = 'CBE' | 'Telebirr';

export type WalletType = 'phantom' | 'metamask' | 'coinbase' | 'walletconnect';

export interface CryptoPrice {
  symbol: CryptoCurrency;
  name: string;
  usdPrice: number;
  change24h: number;
  icon: string;
}

export type VipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface UserProfile {
  username: string;
  avatar: string;
  address: string;
  connected: boolean;
  walletType?: WalletType;
  balances: Record<CryptoCurrency, number>;
  vipTier: VipTier;
  vipPoints: number;
  clientSeed: string;
}

export type GameMode = 'fortune' | 'slots' | 'roulette';

export interface FortuneSegment {
  id: number;
  label: string;
  multiplier: number;
  color: string;
  textColor: string;
  probability: number;
}

export interface SlotSymbol {
  id: string;
  name: string;
  symbol: string;
  multiplier: number;
  color: string;
  bgGradient: string;
}

export interface RouletteBet {
  type: 'red' | 'black' | 'green' | 'even' | 'odd' | 'number';
  number?: number;
  amount: number;
  currency: CryptoCurrency;
}

export interface SpinResult {
  id: string;
  mode: GameMode;
  username: string;
  avatar: string;
  wager: number;
  currency: CryptoCurrency;
  wagerUSD: number;
  multiplier: number;
  payout: number;
  payoutUSD: number;
  timestamp: number;
  serverSeedHash: string;
  clientSeed: string;
  nonce: number;
  resultDetails: {
    segmentLabel?: string;
    slotSymbols?: SlotSymbol[];
    rouletteNumber?: number;
    rouletteColor?: 'red' | 'black' | 'green';
  };
}

export interface ChatMessage {
  id: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  vipTier?: VipTier;
  tip?: {
    amount: number;
    currency: CryptoCurrency;
    recipient: string;
  };
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  totalPayoutUSD: number;
  totalWageredUSD: number;
  biggestMultiplier: number;
  winsCount: number;
  vipTier: VipTier;
}

export interface CryptoTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  currency: CryptoCurrency;
  amount: number;
  usdValue: number;
  address: string;
  txHash: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
  network: string;
}

export interface WebSocketEvent {
  type: 'init' | 'chat_message' | 'new_spin' | 'leaderboard_update' | 'user_joined' | 'user_left' | 'tip_sent' | 'crypto_prices';
  payload: any;
}
