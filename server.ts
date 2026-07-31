import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { FORTUNE_WHEEL_SEGMENTS, SLOT_SYMBOLS, ROULETTE_NUMBERS, INITIAL_CRYPTO_PRICES } from './src/data/constants.js';

const app = express();
app.use(express.json());

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// Internal State
interface ClientConnection {
  ws: WebSocket;
  id: string;
  username: string;
  avatar: string;
  vipTier: string;
}

const clients = new Map<string, ClientConnection>();

let chatHistory: any[] = [
  {
    id: 'msg_14',
    username: 'Guta 🐋',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    text: 'jo🙌',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Platinum'
  },
  {
    id: 'msg_13',
    username: 'ማን ልበል?🤔',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    text: 'አታክብድ ደሎዬው',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Gold'
  },
  {
    id: 'msg_12',
    username: '😍 😍',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80',
    text: 'ዋቄ ደለላ',
    timestamp: Date.now() - 3600000 * 24,
    vipTier: 'Diamond'
  },
  {
    id: 'msg_11',
    username: '🔥',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80',
    text: '🔥🔥🔥',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Silver'
  },
  {
    id: 'msg_10',
    username: 'DEKUFA 🏆🎴',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80',
    text: '🥰🥰🥰',
    timestamp: Date.now() - 3600000 * 24,
    vipTier: 'Gold'
  },
  {
    id: 'msg_9',
    username: 'aman',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80',
    text: '@sola',
    timestamp: Date.now() - 3600000 * 24,
    vipTier: 'Platinum'
  },
  {
    id: 'msg_8',
    username: 'Fufu',
    avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=120&q=80',
    text: '✌️✌️✌️',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Bronze'
  },
  {
    id: 'msg_7',
    username: '@am_car_77',
    avatar: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80',
    text: 'ደፊ ባለው አየር የመኪና እቁብ መርከብ 👌',
    timestamp: Date.now() - 3600000 * 4,
    vipTier: 'Platinum'
  },
  {
    id: 'msg_6',
    username: 'Buze vxr w',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    text: 'Kash 17 bank 14 🤑 🤑',
    timestamp: Date.now() - 3600000 * 24,
    vipTier: 'Diamond'
  },
  {
    id: 'msg_5',
    username: 'bebelu jo🙌',
    avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80',
    text: '🥰 🥰 🥰',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Platinum'
  },
  {
    id: 'msg_4',
    username: 'Sudani Mnd',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    text: '🥰 🥰 🥰',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Gold'
  },
  {
    id: 'msg_3',
    username: 'Ante እዉነት',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    text: '🥰 🥰 🥰',
    timestamp: Date.now() - 3600000 * 48,
    vipTier: 'Bronze'
  },
  {
    id: 'msg_2',
    username: 'kingu 😎',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    text: '🥰 🥰 🥰',
    timestamp: Date.now() - 3600000 * 12,
    vipTier: 'Diamond'
  },
  {
    id: 'msg_1',
    username: 'ABDI_BORA',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80',
    text: 'are ene alewu',
    timestamp: Date.now() - 3600000 * 2,
    vipTier: 'Gold'
  }
];

let leaderboardData: any[] = [
  { rank: 1, username: 'kingu 😎', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 2485000, totalWageredUSD: 3800000, biggestMultiplier: 250, winsCount: 242, vipTier: 'Diamond' },
  { rank: 2, username: 'ABDI_BORA', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1950000, totalWageredUSD: 3100000, biggestMultiplier: 170, winsCount: 190, vipTier: 'Gold' },
  { rank: 3, username: '@am_car_77', avatar: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1620000, totalWageredUSD: 2600000, biggestMultiplier: 250, winsCount: 168, vipTier: 'Platinum' },
  { rank: 4, username: 'Buze vxr w', avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1380000, totalWageredUSD: 2200000, biggestMultiplier: 100, winsCount: 149, vipTier: 'Diamond' },
  { rank: 5, username: '@A_yema', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 1120000, totalWageredUSD: 1900000, biggestMultiplier: 100, winsCount: 135, vipTier: 'Gold' },
  { rank: 6, username: 'Aron jijiga', avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 940000, totalWageredUSD: 1500000, biggestMultiplier: 80, winsCount: 114, vipTier: 'Silver' },
  { rank: 7, username: 'Tamru zim', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 780000, totalWageredUSD: 1250000, biggestMultiplier: 100, winsCount: 94, vipTier: 'Gold' },
  { rank: 8, username: 'bebelu jo🙌', avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 560000, totalWageredUSD: 980000, biggestMultiplier: 50, winsCount: 88, vipTier: 'Platinum' },
  { rank: 9, username: 'Sudani Mnd', avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 420000, totalWageredUSD: 700000, biggestMultiplier: 14, winsCount: 72, vipTier: 'Gold' },
  { rank: 10, username: 'Ante እዉነት', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80', totalPayoutUSD: 390000, totalWageredUSD: 650000, biggestMultiplier: 10, winsCount: 65, vipTier: 'Bronze' }
];

let liveSpinsFeed: any[] = [
  {
    id: 'spin_init_1',
    mode: 'fortune',
    username: '@am_car_77',
    avatar: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'CBE',
    wagerUSD: 200,
    multiplier: 2000.0,
    payout: 400000,
    payoutUSD: 400000,
    timestamp: Date.now() - 3600000 * 1, // 1h ago
    serverSeedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    id: 'spin_init_2',
    mode: 'slots',
    username: 'Buze vxr w',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'Telebirr',
    wagerUSD: 200,
    multiplier: 2000.0,
    payout: 400000,
    payoutUSD: 400000,
    timestamp: Date.now() - 3600000 * 2, // 2h ago
    serverSeedHash: '8f4e2b1968d90472301e82847c1b72e12818967b848c489d2c208493a7493b82'
  },
  {
    id: 'spin_init_3',
    mode: 'roulette',
    username: '@A_yema',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'CBE',
    wagerUSD: 200,
    multiplier: 50.0,
    payout: 10000,
    payoutUSD: 10000,
    timestamp: Date.now() - 3600000 * 3, // 3h ago
    serverSeedHash: '7a9d048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85231'
  },
  {
    id: 'spin_init_4',
    mode: 'fortune',
    username: 'Aron jijiga',
    avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'Telebirr',
    wagerUSD: 200,
    multiplier: 75.0,
    payout: 15000,
    payoutUSD: 15000,
    timestamp: Date.now() - 3600000 * 4, // 4h ago
    serverSeedHash: '12b9c048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8123'
  },
  {
    id: 'spin_init_5',
    mode: 'slots',
    username: 'Tamru zim',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'CBE',
    wagerUSD: 200,
    multiplier: 125.0,
    payout: 25000,
    payoutUSD: 25000,
    timestamp: Date.now() - 3600000 * 5, // 5h ago
    serverSeedHash: '99b9c048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8999'
  },
  {
    id: 'spin_init_6',
    mode: 'fortune',
    username: 'bebelu jo🙌',
    avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'Telebirr',
    wagerUSD: 200,
    multiplier: 250.0,
    payout: 50000,
    payoutUSD: 50000,
    timestamp: Date.now() - 3600000 * 6, // 6h ago
    serverSeedHash: '44b9c048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8444'
  },
  {
    id: 'spin_init_7',
    mode: 'roulette',
    username: 'Sudani Mnd',
    avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'CBE',
    wagerUSD: 200,
    multiplier: 500.0,
    payout: 100000,
    payoutUSD: 100000,
    timestamp: Date.now() - 3600000 * 7, // 7h ago
    serverSeedHash: '33b9c048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8333'
  },
  {
    id: 'spin_init_8',
    mode: 'slots',
    username: 'Ante እዉነት',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    wager: 200,
    currency: 'Telebirr',
    wagerUSD: 200,
    multiplier: 50.0,
    payout: 10000,
    payoutUSD: 10000,
    timestamp: Date.now() - 3600000 * 8, // 8h ago
    serverSeedHash: '22b9c048291c149afbf4c8996fb92427ae41e4649b934ca495991b7852b8222'
  }
];

let transactionsLedger: any[] = [
  {
    id: 'tx_init_1',
    type: 'deposit',
    currency: 'CBE',
    amount: 500.0,
    usdValue: 500.00,
    address: '1000123456789',
    txHash: '5K2b9XzT8...3mN1pQ9v',
    status: 'completed',
    timestamp: Date.now() - 3600000,
    network: 'CBE Mainnet'
  }
];

// Broadcast function to all WebSocket clients
function broadcast(event: { type: string; payload: any }) {
  const json = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  });
}

// WebSocket Connection Logic
wss.on('connection', (ws) => {
  const clientId = 'user_' + Math.random().toString(36).substring(2, 9);
  
  // Send initial state sync to newly connected client
  ws.send(JSON.stringify({
    type: 'init',
    payload: {
      chatHistory,
      leaderboard: leaderboardData,
      recentSpins: liveSpinsFeed,
      onlineUsersCount: 30000 + wss.clients.size // Active multiplayer presence
    }
  }));

  ws.on('message', (messageRaw) => {
    try {
      const data = JSON.parse(messageRaw.toString());

      if (data.type === 'send_chat') {
        const msg = {
          id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
          username: data.username || 'Anonymous',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
          text: data.text,
          timestamp: Date.now(),
          vipTier: data.vipTier || 'Bronze'
        };
        chatHistory.push(msg);
        if (chatHistory.length > 50) chatHistory.shift();
        broadcast({ type: 'chat_message', payload: msg });
      }

      if (data.type === 'send_tip') {
        const tipMsg = {
          id: 'tip_' + Date.now(),
          username: data.username,
          avatar: data.avatar,
          text: `sent a ${data.amount} ${data.currency} tip to ${data.recipient}! 💎🎁`,
          timestamp: Date.now(),
          vipTier: data.vipTier || 'Bronze',
          tip: {
            amount: data.amount,
            currency: data.currency,
            recipient: data.recipient
          }
        };
        chatHistory.push(tipMsg);
        broadcast({ type: 'chat_message', payload: tipMsg });
      }
    } catch (err) {
      console.error('WS Error:', err);
    }
  });
});

// Periodic Simulated Online Activity to ensure live multiplayer feel
setInterval(() => {
  if (wss.clients.size > 0 || true) {
    const randomUsers = [
      { name: '@am_car_77', avatar: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=120&q=80', vip: 'Platinum' },
      { name: 'Buze vxr w', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', vip: 'Diamond' },
      { name: '@A_yema', avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=120&q=80', vip: 'Gold' },
      { name: 'Aron jijiga', avatar: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=120&q=80', vip: 'Silver' },
      { name: 'Tamru zim', avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=120&q=80', vip: 'Gold' },
      { name: 'bebelu jo🙌', avatar: 'https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=120&q=80', vip: 'Platinum' },
      { name: 'Sudani Mnd', avatar: 'https://images.unsplash.com/photo-1523824921230-7d41096c3d53?auto=format&fit=crop&w=120&q=80', vip: 'Gold' },
      { name: 'Ante እዉነት', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80', vip: 'Bronze' },
      { name: 'kingu 😎', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80', vip: 'Diamond' },
      { name: 'ABDI_BORA', avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=120&q=80', vip: 'Gold' }
    ];
    const user = randomUsers[Math.floor(Math.random() * randomUsers.length)];
    const currencies = ['CBE', 'Telebirr'] as const;
    const curr = currencies[Math.floor(Math.random() * currencies.length)];
    const modes = ['fortune', 'slots', 'roulette'] as const;
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const possiblePayouts = [10000, 15000, 20000, 35000, 50000, 100000, 250000, 400000];
    const payout = possiblePayouts[Math.floor(Math.random() * possiblePayouts.length)];
    const wager = 200;
    const mult = Number((payout / wager).toFixed(1));
    const price = INITIAL_CRYPTO_PRICES[curr].usdPrice;
    const wagerUSD = wager * price;
    const payoutUSD = payout * price;

    const botSpin = {
      id: 'spin_bot_' + Date.now(),
      mode,
      username: user.name,
      avatar: user.avatar,
      wager,
      currency: curr,
      wagerUSD,
      multiplier: mult,
      payout,
      payoutUSD,
      timestamp: Date.now(),
      serverSeedHash: crypto.createHash('sha256').update(Math.random().toString()).digest('hex')
    };

    liveSpinsFeed.unshift(botSpin);
    if (liveSpinsFeed.length > 30) liveSpinsFeed.pop();

    broadcast({ type: 'new_spin', payload: botSpin });

    // Update leaderboard entry if big win
    if (mult >= 10) {
      const existing = leaderboardData.find(l => l.username === user.name);
      if (existing) {
        existing.totalPayoutUSD += payoutUSD;
        existing.totalWageredUSD += wagerUSD;
        if (mult > existing.biggestMultiplier) existing.biggestMultiplier = mult;
      }
      leaderboardData.sort((a, b) => b.totalPayoutUSD - a.totalPayoutUSD);
      leaderboardData.forEach((item, index) => item.rank = index + 1);
      broadcast({ type: 'leaderboard_update', payload: leaderboardData });
    }
  }
}, 12000);

// API Endpoints
app.get('/api/crypto-prices', (req, res) => {
  res.json({ success: true, prices: INITIAL_CRYPTO_PRICES });
});

// Provably Fair Spin API Endpoint
app.post('/api/spin', (req, res) => {
  const { mode, wager, currency, clientSeed, nonce, rouletteBet } = req.body;

  if (!wager || wager <= 0) {
    return res.status(400).json({ error: 'Invalid wager amount' });
  }

  // Generate Server Seed and Hash
  const serverSeed = crypto.randomBytes(32).toString('hex');
  const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

  // Compute Provably Fair Hash
  const combinedSeed = `${serverSeed}:${clientSeed || 'default_client_seed'}:${nonce || 1}`;
  const hmac = crypto.createHmac('sha256', serverSeed).update(combinedSeed).digest('hex');
  const hmacNumber = parseInt(hmac.substring(0, 8), 16);
  const normalizedRoll = (hmacNumber % 10000) / 10000; // Value between 0 and 1

  let multiplier = 0;
  let resultDetails: any = {};

  if (mode === 'fortune') {
    let cumulative = 0;
    let selectedSegment = FORTUNE_WHEEL_SEGMENTS[0];
    for (const seg of FORTUNE_WHEEL_SEGMENTS) {
      cumulative += seg.probability;
      if (normalizedRoll <= cumulative) {
        selectedSegment = seg;
        break;
      }
    }
    multiplier = selectedSegment.multiplier;
    resultDetails = { segmentLabel: selectedSegment.label };
  } else if (mode === 'slots') {
    // 1% win rate for slots
    if (normalizedRoll <= 0.01) {
      const winSym = SLOT_SYMBOLS[Math.floor((normalizedRoll * 10000) % SLOT_SYMBOLS.length)];
      resultDetails = { slotSymbols: [winSym, winSym, winSym] };
      multiplier = winSym.multiplier;
    } else {
      const sym1 = SLOT_SYMBOLS[0];
      const sym2 = SLOT_SYMBOLS[1];
      const sym3 = SLOT_SYMBOLS[2];
      resultDetails = { slotSymbols: [sym1, sym2, sym3] };
      multiplier = 0;
    }
  } else if (mode === 'roulette') {
    // 1% win rate for roulette
    if (normalizedRoll <= 0.01) {
      let winningNum = 7;
      let winningColor = 'red';
      if (rouletteBet) {
        const { type, number } = rouletteBet;
        if (type === 'red') { winningNum = 1; winningColor = 'red'; multiplier = 2.0; }
        else if (type === 'black') { winningNum = 2; winningColor = 'black'; multiplier = 2.0; }
        else if (type === 'green') { winningNum = 0; winningColor = 'green'; multiplier = 14.0; }
        else if (type === 'even') { winningNum = 2; winningColor = 'black'; multiplier = 2.0; }
        else if (type === 'odd') { winningNum = 1; winningColor = 'red'; multiplier = 2.0; }
        else if (type === 'number') { winningNum = number; winningColor = ROULETTE_NUMBERS.find(r => r.num === number)?.color || 'red'; multiplier = 36.0; }
      } else {
        multiplier = 2.0;
      }
      resultDetails = { rouletteNumber: winningNum, rouletteColor: winningColor };
    } else {
      let losingNum = 0;
      let losingColor = 'green';
      if (rouletteBet) {
        const { type, number } = rouletteBet;
        if (type === 'red') { losingNum = 2; losingColor = 'black'; }
        else if (type === 'black') { losingNum = 1; losingColor = 'red'; }
        else if (type === 'green') { losingNum = 1; losingColor = 'red'; }
        else if (type === 'even') { losingNum = 1; losingColor = 'red'; }
        else if (type === 'odd') { losingNum = 2; losingColor = 'black'; }
        else if (type === 'number') { losingNum = (number + 1) % 37; losingColor = ROULETTE_NUMBERS.find(r => r.num === losingNum)?.color || 'black'; }
      }
      multiplier = 0;
      resultDetails = { rouletteNumber: losingNum, rouletteColor: losingColor };
    }
  }

  const curr = currency as keyof typeof INITIAL_CRYPTO_PRICES;
  const priceUSD = INITIAL_CRYPTO_PRICES[curr]?.usdPrice || 1;
  const wagerUSD = wager * priceUSD;
  const payout = Math.min(400000, wager * multiplier);
  const payoutUSD = Math.min(400000, payout * priceUSD);

  const spinResult = {
    id: 'spin_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    mode,
    username: req.body.username || 'You',
    avatar: req.body.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    wager,
    currency,
    wagerUSD,
    multiplier,
    payout,
    payoutUSD,
    timestamp: Date.now(),
    serverSeed,
    serverSeedHash,
    clientSeed: clientSeed || 'default_client_seed',
    nonce: nonce || 1,
    resultDetails
  };

  // Record in live feed if min win is 10,000 Birr
  if (spinResult.payout >= 10000) {
    liveSpinsFeed.unshift(spinResult);
    if (liveSpinsFeed.length > 30) liveSpinsFeed.pop();
    broadcast({ type: 'new_spin', payload: spinResult });
  }

  // Update Leaderboard if user won significantly
  if (multiplier > 0) {
    let userRank = leaderboardData.find(l => l.username === spinResult.username);
    if (!userRank) {
      userRank = {
        rank: leaderboardData.length + 1,
        username: spinResult.username,
        avatar: spinResult.avatar,
        totalPayoutUSD: 0,
        totalWageredUSD: 0,
        biggestMultiplier: 0,
        winsCount: 0,
        vipTier: 'Bronze'
      };
      leaderboardData.push(userRank);
    }
    userRank.totalPayoutUSD += payoutUSD;
    userRank.totalWageredUSD += wagerUSD;
    userRank.winsCount += 1;
    if (multiplier > userRank.biggestMultiplier) userRank.biggestMultiplier = multiplier;

    leaderboardData.sort((a, b) => b.totalPayoutUSD - a.totalPayoutUSD);
    leaderboardData.forEach((item, index) => item.rank = index + 1);

    broadcast({ type: 'leaderboard_update', payload: leaderboardData });
  }

  res.json({
    success: true,
    result: spinResult
  });
});

// Deposit Endpoint
app.post('/api/wallet/deposit', (req, res) => {
  const { currency, amount, address, network } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid deposit amount' });

  const curr = currency as keyof typeof INITIAL_CRYPTO_PRICES;
  const priceUSD = INITIAL_CRYPTO_PRICES[curr]?.usdPrice || 1;
  const usdValue = amount * priceUSD;

  const tx = {
    id: 'tx_dep_' + Date.now(),
    type: 'deposit',
    currency,
    amount,
    usdValue,
    address: address || '0x7F...92A1',
    txHash: crypto.randomBytes(16).toString('hex'),
    status: 'completed',
    timestamp: Date.now(),
    network: network || 'Mainnet'
  };

  transactionsLedger.unshift(tx);
  res.json({ success: true, transaction: tx });
});

// Withdraw Endpoint
app.post('/api/wallet/withdraw', (req, res) => {
  const { currency, amount, address, network } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid withdrawal amount' });

  const curr = currency as keyof typeof INITIAL_CRYPTO_PRICES;
  const priceUSD = INITIAL_CRYPTO_PRICES[curr]?.usdPrice || 1;
  const usdValue = amount * priceUSD;

  const tx = {
    id: 'tx_wd_' + Date.now(),
    type: 'withdrawal',
    currency,
    amount,
    usdValue,
    address,
    txHash: crypto.randomBytes(16).toString('hex'),
    status: 'completed',
    timestamp: Date.now(),
    network: network || 'Mainnet'
  };

  transactionsLedger.unshift(tx);
  res.json({ success: true, transaction: tx });
});

app.get('/api/leaderboard', (req, res) => {
  res.json({ success: true, leaderboard: leaderboardData });
});

app.get('/api/transactions', (req, res) => {
  res.json({ success: true, transactions: transactionsLedger });
});

// Setup Vite or static serving
async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Spin Crypto Casino Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
