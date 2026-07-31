import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Wallet, Crown, ShieldCheck, ArrowDownRight, Sparkles, User, LineChart } from 'lucide-react';
import { Header } from './components/Header';
import { SpinArena } from './components/SpinArena';
import { MultiplayerSidebar } from './components/MultiplayerSidebar';
import { WalletModal } from './components/WalletModal';
import { ProvablyFairModal } from './components/ProvablyFairModal';
import { VipModal } from './components/VipModal';
import { UserProfileModal } from './components/UserProfileModal';
import { StreakNotification } from './components/StreakNotification';
import { UserProfile, CryptoCurrency, CryptoPrice, GameMode, SpinResult, ChatMessage, LeaderboardEntry, CryptoTransaction, WalletType } from './types';
import { INITIAL_CRYPTO_PRICES } from './data/constants';

const SAMPLE_USER_SPINS: SpinResult[] = [
  {
    id: 'user_spin_10',
    mode: 'fortune',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'CBE',
    wagerUSD: 20,
    multiplier: 5.0,
    payout: 100,
    payoutUSD: 100,
    timestamp: Date.now() - 60000 * 3,
    serverSeedHash: 'a9f2b3e811c002239',
    clientSeed: 'custom_client_seed_77',
    nonce: 10,
    resultDetails: { segmentLabel: '5.0x' }
  },
  {
    id: 'user_spin_9',
    mode: 'slots',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'CBE',
    wagerUSD: 20,
    multiplier: 10.0,
    payout: 200,
    payoutUSD: 200,
    timestamp: Date.now() - 60000 * 10,
    serverSeedHash: 'b81c3e901a221199a',
    clientSeed: 'custom_client_seed_77',
    nonce: 9,
    resultDetails: {}
  },
  {
    id: 'user_spin_8',
    mode: 'roulette',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'CBE',
    wagerUSD: 20,
    multiplier: 0.0,
    payout: 0,
    payoutUSD: 0,
    timestamp: Date.now() - 60000 * 18,
    serverSeedHash: 'c72d8a11039bb72a1',
    clientSeed: 'custom_client_seed_77',
    nonce: 8,
    resultDetails: { rouletteNumber: 17, rouletteColor: 'black' }
  },
  {
    id: 'user_spin_7',
    mode: 'fortune',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'Telebirr',
    wagerUSD: 20,
    multiplier: 3.0,
    payout: 60,
    payoutUSD: 60,
    timestamp: Date.now() - 60000 * 30,
    serverSeedHash: 'd63e9f002a8812c3b',
    clientSeed: 'custom_client_seed_77',
    nonce: 7,
    resultDetails: { segmentLabel: '3.0x' }
  },
  {
    id: 'user_spin_6',
    mode: 'slots',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'Telebirr',
    wagerUSD: 20,
    multiplier: 2.0,
    payout: 40,
    payoutUSD: 40,
    timestamp: Date.now() - 60000 * 45,
    serverSeedHash: 'e54f01239bbd771a2',
    clientSeed: 'custom_client_seed_77',
    nonce: 6,
    resultDetails: {}
  },
  {
    id: 'user_spin_5',
    mode: 'fortune',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'CBE',
    wagerUSD: 20,
    multiplier: 0.0,
    payout: 0,
    payoutUSD: 0,
    timestamp: Date.now() - 60000 * 60,
    serverSeedHash: 'f45a12388cc1a90b1',
    clientSeed: 'custom_client_seed_77',
    nonce: 5,
    resultDetails: { segmentLabel: '0x' }
  },
  {
    id: 'user_spin_4',
    mode: 'roulette',
    username: 'VIP_Player',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 20,
    currency: 'CBE',
    wagerUSD: 20,
    multiplier: 2.0,
    payout: 40,
    payoutUSD: 40,
    timestamp: Date.now() - 60000 * 75,
    serverSeedHash: 'a36b234771009a0f9',
    clientSeed: 'custom_client_seed_77',
    nonce: 4,
    resultDetails: { rouletteNumber: 7, rouletteColor: 'red' }
  }
];

export default function App() {
  // User State
  const [user, setUser] = useState<UserProfile>({
    username: 'VIP_Player_' + Math.floor(1000 + Math.random() * 9000),
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    address: '0x7F82a38419283749582736451029384756192A1B',
    connected: true,
    walletType: 'phantom',
    balances: {
      SOL: 25.50,
      USDT: 500.00,
      CBE: 200.00,
      Telebirr: 200.00
    },
    vipTier: 'Gold',
    vipPoints: 4800,
    clientSeed: 'custom_client_seed_77'
  });

  // App UI States
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency>('CBE');
  const [prices, setPrices] = useState<Record<CryptoCurrency, CryptoPrice>>(INITIAL_CRYPTO_PRICES);
  const [lastResult, setLastResult] = useState<SpinResult | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Real-Time Multiplayer State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg_10',
      username: 'ደፊ ባለው አየር የመኪና እቁብ መርከብ 👌',
      avatar: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80',
      text: 'ደፊ ባለው አየር የመኪና እቁብ መርከብ 👌',
      timestamp: Date.now() - 3600000 * 24 * 30,
      vipTier: 'Diamond'
    },
    {
      id: 'msg_9',
      username: 'ABDI_BORA',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      text: 'Kash 17 bank 14 🤑 🤑',
      timestamp: Date.now() - 3600000 * 24 * 16,
      vipTier: 'Gold'
    },
    {
      id: 'msg_8',
      username: 'MAMEEslt ❤️ ❤️ @gmail',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80',
      text: '💯 💯 🥰 🥰 🥰 🥰',
      timestamp: Date.now() - 3600000 * 24 * 7,
      vipTier: 'Platinum'
    },
    {
      id: 'msg_7',
      username: 'gelayewolde',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      text: '❤️ ❤️ ❤️',
      timestamp: Date.now() - 3600000 * 24 * 6,
      vipTier: 'Silver'
    },
    {
      id: 'msg_6',
      username: 'hocs',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
      text: '@👍 👍 👍',
      timestamp: Date.now() - 3600000 * 24 * 5,
      vipTier: 'Gold'
    },
    {
      id: 'msg_5',
      username: 'Hone',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80',
      text: '🥰 🥰 🥰',
      timestamp: Date.now() - 3600000 * 18,
      vipTier: 'Gold'
    },
    {
      id: 'msg_4',
      username: 'mirk 16',
      avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80',
      text: '🥰 🥰 🥰',
      timestamp: Date.now() - 3600000 * 24 * 3,
      vipTier: 'Platinum'
    },
    {
      id: 'msg_3',
      username: 'kingu 😎',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      text: '🥰 🥰 🥰',
      timestamp: Date.now() - 3600000 * 24 * 4,
      vipTier: 'Diamond'
    },
    {
      id: 'msg_2',
      username: 'kedir',
      avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80',
      text: '🥰 🥰 🥰',
      timestamp: Date.now() - 3600000 * 12,
      vipTier: 'Bronze'
    },
    {
      id: 'msg_1',
      username: 'Hafi the flash',
      avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80',
      text: 'are ene alewu',
      timestamp: Date.now() - 3600000 * 2,
      vipTier: 'Gold'
    }
  ]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, username: 'kingu 😎', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 2485000, totalWageredUSD: 3800000, biggestMultiplier: 250, winsCount: 242, vipTier: 'Diamond' },
    { rank: 2, username: 'ABDI_BORA', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1950000, totalWageredUSD: 3100000, biggestMultiplier: 170, winsCount: 190, vipTier: 'Gold' },
    { rank: 3, username: 'Hafi the flash', avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1620000, totalWageredUSD: 2600000, biggestMultiplier: 250, winsCount: 168, vipTier: 'Gold' },
    { rank: 4, username: 'MAMEEslt ❤️ ❤️ @gmail', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1380000, totalWageredUSD: 2200000, biggestMultiplier: 100, winsCount: 149, vipTier: 'Platinum' },
    { rank: 5, username: 'mirk 16', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1120000, totalWageredUSD: 1900000, biggestMultiplier: 100, winsCount: 135, vipTier: 'Platinum' },
    { rank: 6, username: 'gelayewolde', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 940000, totalWageredUSD: 1500000, biggestMultiplier: 80, winsCount: 114, vipTier: 'Silver' },
    { rank: 7, username: 'hocs', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 780000, totalWageredUSD: 1250000, biggestMultiplier: 100, winsCount: 94, vipTier: 'Gold' },
    { rank: 8, username: 'D.n Terefe dejen', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 560000, totalWageredUSD: 980000, biggestMultiplier: 50, winsCount: 88, vipTier: 'Silver' },
    { rank: 9, username: 'kedir', avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 390000, totalWageredUSD: 650000, biggestMultiplier: 25, winsCount: 65, vipTier: 'Bronze' }
  ]);
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
  const [userSpins, setUserSpins] = useState<SpinResult[]>(SAMPLE_USER_SPINS);
  const [transactions, setTransactions] = useState<CryptoTransaction[]>([]);
  const [onlineCount, setOnlineCount] = useState<number>(30000);

  // Modal & Streak States
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [walletInitialTab, setWalletInitialTab] = useState<'deposit' | 'withdraw' | 'transactions'>('deposit');
  const [provablyFairModalOpen, setProvablyFairModalOpen] = useState<boolean>(false);
  const [vipModalOpen, setVipModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [streakNotificationOpen, setStreakNotificationOpen] = useState<boolean>(false);

  // WebSocket Reference
  const wsRef = React.useRef<WebSocket | null>(null);

  // Connect WebSocket & Sync
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket Connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'init') {
            setChatHistory(data.payload.chatHistory || []);
            setLeaderboard(data.payload.leaderboard || []);
            setRecentSpins(data.payload.recentSpins || []);
            setOnlineCount(data.payload.onlineUsersCount || 30000);
          } else if (data.type === 'chat_message') {
            setChatHistory((prev) => [...prev.slice(-40), data.payload]);
          } else if (data.type === 'new_spin') {
            setRecentSpins((prev) => [data.payload, ...prev.slice(0, 25)]);
          } else if (data.type === 'leaderboard_update') {
            setLeaderboard(data.payload);
          }
        } catch (e) {
          console.error('WS Parse Error', e);
        }
      };
    } catch (e) {
      console.error('WS Connection error', e);
    }

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Fetch Crypto Prices from API
  useEffect(() => {
    fetch('/api/crypto-prices')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.prices) {
          setPrices(data.prices);
        }
      })
      .catch(() => {});
  }, []);

  // Handle Provably Fair Spin API Call
  const handleSpinSubmit = async (
    mode: GameMode,
    wager: number,
    currency: CryptoCurrency,
    rouletteBet?: any
  ): Promise<SpinResult | null> => {
    try {
      // Deduct wager immediately locally
      setUser((prev) => ({
        ...prev,
        balances: {
          ...prev.balances,
          [currency]: Math.max(0, prev.balances[currency] - wager)
        }
      }));

      const response = await fetch('/api/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          wager,
          currency,
          username: user.username,
          avatar: user.avatar,
          clientSeed: user.clientSeed,
          rouletteBet
        })
      });

      const data = await response.json();
      if (data.success && data.result) {
        const result: SpinResult = data.result;
        setLastResult(result);
        setUserSpins((prev) => [result, ...prev]);

        // Add payout back to balance & calculate win streak
        if (result.payout > 0 || result.multiplier > 0) {
          const clampedPayout = Math.min(400000, result.payout);
          setUser((prev) => ({
            ...prev,
            balances: {
              ...prev.balances,
              [currency]: prev.balances[currency] + clampedPayout
            }
          }));

          setWinStreak((prevStreak) => {
            const nextStreak = prevStreak + 1;
            if (nextStreak >= 3) {
              setStreakNotificationOpen(true);
            }
            return nextStreak;
          });
        } else {
          setWinStreak(0);
        }

        return result;
      }
    } catch (err) {
      console.error('Spin API Error', err);
    }
    return null;
  };

  // Deposit Handler
  const handleDeposit = async (currency: CryptoCurrency, amount: number, network: string) => {
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, amount, address: user.address, network })
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setUser((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            [currency]: prev.balances[currency] + amount
          }
        }));
        setTransactions((prev) => [data.transaction, ...prev]);
      }
    } catch (e) {
      console.error('Deposit Error', e);
    }
  };

  // Withdraw Handler
  const handleWithdraw = async (currency: CryptoCurrency, amount: number, address: string, network: string) => {
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, amount, address, network })
      });
      const data = await res.json();
      if (data.success && data.transaction) {
        setUser((prev) => ({
          ...prev,
          balances: {
            ...prev.balances,
            [currency]: Math.max(0, prev.balances[currency] - amount)
          }
        }));
        setTransactions((prev) => [data.transaction, ...prev]);
      }
    } catch (e) {
      console.error('Withdraw Error', e);
    }
  };

  // Send Chat Message via WebSocket
  const handleSendChat = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_chat',
          username: user.username,
          avatar: user.avatar,
          text,
          vipTier: user.vipTier
        })
      );
    }
  };

  // Send Tip via WebSocket
  const handleSendTip = (recipient: string, amount: number, currency: CryptoCurrency) => {
    if (user.balances[currency] < amount) {
      alert(`Insufficient ${currency} balance for tipping!`);
      return;
    }

    // Deduct tip locally
    setUser((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        [currency]: Math.max(0, prev.balances[currency] - amount)
      }
    }));

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: 'send_tip',
          username: user.username,
          avatar: user.avatar,
          recipient,
          amount,
          currency,
          vipTier: user.vipTier
        })
      );
    }
  };

  // Wallet Connection Handler
  const handleConnectWallet = (walletType: WalletType, address: string) => {
    setUser((prev) => ({
      ...prev,
      connected: true,
      walletType,
      address
    }));
  };

  // Wallet Disconnection Handler ("Turn Off")
  const handleDisconnectWallet = () => {
    setUser((prev) => ({
      ...prev,
      connected: false,
      walletType: undefined,
      address: ''
    }));
  };

  // Claim Daily Cashback Reward
  const handleClaimCashback = () => {
    setUser((prev) => ({
      ...prev,
      balances: {
        ...prev.balances,
        SOL: prev.balances.SOL + 0.25
      }
    }));
  };

  // Update Client Seed
  const handleUpdateClientSeed = (seed: string) => {
    setUser((prev) => ({ ...prev, clientSeed: seed }));
  };

  // Add Sample Spins for Profit Chart Exploration
  const handleAddSampleSpins = () => {
    const modes: GameMode[] = ['fortune', 'slots', 'roulette'];
    const currencies: CryptoCurrency[] = ['CBE', 'Telebirr'];
    const multipliers = [0, 0, 1.5, 2.0, 3.0, 5.0, 10.0, 0, 1.2];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    const wager = 20;
    const mult = multipliers[Math.floor(Math.random() * multipliers.length)];

    const newSpin: SpinResult = {
      id: 'demo_' + Date.now() + Math.random(),
      mode,
      username: user.username,
      avatar: user.avatar,
      wager,
      currency,
      wagerUSD: wager,
      multiplier: mult,
      payout: wager * mult,
      payoutUSD: wager * mult,
      timestamp: Date.now(),
      serverSeedHash: '0x' + Math.random().toString(16).substring(2, 10),
      clientSeed: user.clientSeed,
      nonce: userSpins.length + 1,
      resultDetails: {}
    };

    setUserSpins((prev) => [newSpin, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header
        user={user}
        prices={prices}
        selectedCurrency={selectedCurrency}
        winStreak={winStreak}
        onSelectCurrency={setSelectedCurrency}
        onOpenWallet={(tab) => {
          setWalletInitialTab(tab || 'deposit');
          setWalletModalOpen(true);
        }}
        onOpenVip={() => setVipModalOpen(true)}
        onOpenProvablyFair={() => setProvablyFairModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* 3-Spin Winning Streak Notification & Firework Animation Overlay */}
      <StreakNotification
        streak={winStreak}
        show={streakNotificationOpen}
        onClose={() => setStreakNotificationOpen(false)}
      />

      {/* Main Layout Grid */}
      <div className="flex-1 flex flex-col lg:flex-row w-full">
        {/* Game Stage Area */}
        <main className="flex-1 flex flex-col">
          <SpinArena
            user={user}
            selectedCurrency={selectedCurrency}
            onSpinSubmit={handleSpinSubmit}
            onOpenProvablyFair={() => setProvablyFairModalOpen(true)}
            lastResult={lastResult}
          />
        </main>

        {/* Live Multiplayer & Leaderboard Sidebar */}
        <MultiplayerSidebar
          chatHistory={chatHistory}
          leaderboard={leaderboard}
          recentSpins={recentSpins}
          onSendChat={handleSendChat}
          onSendTip={handleSendTip}
          username={user.username}
          vipTier={user.vipTier}
          onlineCount={onlineCount}
        />
      </div>

      {/* Mobile App Native Bottom Dock Navigation */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <Gamepad2 className="w-5 h-5 text-amber-400" />
          <span>Arena</span>
        </button>

        <button
          onClick={() => setProfileModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <LineChart className="w-5 h-5 text-cyan-400" />
          <span>Profile & Stats</span>
        </button>

        <button
          onClick={() => {
            setWalletInitialTab('deposit');
            setWalletModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ArrowDownRight className="w-5 h-5 text-emerald-400" />
          <span>Deposit</span>
        </button>

        <button
          onClick={() => {
            setWalletInitialTab('withdraw');
            setWalletModalOpen(true);
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white transition-colors"
        >
          <Wallet className="w-5 h-5 text-slate-300" />
          <span>Wallet</span>
        </button>

        <button
          onClick={() => setVipModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Crown className="w-5 h-5 text-purple-400" />
          <span>VIP</span>
        </button>

        <button
          onClick={() => setProvablyFairModalOpen(true)}
          className="flex flex-col items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ShieldCheck className="w-5 h-5 text-slate-400" />
          <span>Fair</span>
        </button>
      </div>

      {/* Modals */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        user={user}
        userSpins={userSpins}
        onUpdateClientSeed={handleUpdateClientSeed}
        onAddSampleSpins={handleAddSampleSpins}
      />

      <WalletModal
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        user={user}
        initialTab={walletInitialTab}
        onConnectWallet={handleConnectWallet}
        onDisconnectWallet={handleDisconnectWallet}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        transactions={transactions}
      />

      <ProvablyFairModal
        isOpen={provablyFairModalOpen}
        onClose={() => setProvablyFairModalOpen(false)}
        lastResult={lastResult}
      />

      <VipModal
        isOpen={vipModalOpen}
        onClose={() => setVipModalOpen(false)}
        user={user}
        onClaimCashback={handleClaimCashback}
      />
    </div>
  );
}
