import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trophy, Zap, Crown, Users, X, Building2, Smartphone, ShieldCheck, Lock, ChevronDown } from 'lucide-react';
import { ChatMessage, LeaderboardEntry, SpinResult, CryptoCurrency, VipTier, UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { OnlinePlayersModal } from './OnlinePlayersModal';
import { COMMUNITY_USERS } from '../data/communityUsers';
import { WinnerAvatar } from './WinnerAvatar';
import { INITIAL_LIVE_WINNERS, LiveWinnerFeedItem, generateNextLiveWinner } from '../data/liveWinnersData';

const formatTimeAgo = (timestamp?: number) => {
  if (!timestamp) return 'Just now';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

interface MultiplayerSidebarProps {
  chatHistory: ChatMessage[];
  leaderboard: LeaderboardEntry[];
  recentSpins: SpinResult[];
  onSendChat: (text: string) => void;
  onSendTip?: (recipient: string, amount: number, currency: CryptoCurrency) => void;
  username: string;
  vipTier: VipTier;
  onlineCount: number;
  activeTabOverride?: 'leaderboard' | 'feed';
  onUpdateUser?: (updated: { username?: string; cbeAccountNumber?: string; telebirrNumber?: string }) => void;
}

export const MultiplayerSidebar: React.FC<MultiplayerSidebarProps> = ({
  chatHistory,
  leaderboard,
  recentSpins,
  onSendChat,
  onSendTip,
  username,
  vipTier,
  onlineCount,
  activeTabOverride,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'feed'>('feed');

  useEffect(() => {
    if (activeTabOverride) {
      setActiveTab(activeTabOverride);
    }
  }, [activeTabOverride]);

  const [inputText, setInputText] = useState<string>('');
  const [onlinePlayersModalOpen, setOnlinePlayersModalOpen] = useState<boolean>(false);

  // Live winners rapid ticker and configuration
  const [liveWinners, setLiveWinners] = useState<LiveWinnerFeedItem[]>(INITIAL_LIVE_WINNERS);
  const [feedSpeed, setFeedSpeed] = useState<'hyper' | 'fast' | 'normal' | 'paused'>('hyper');
  const [minWinFilter, setMinWinFilter] = useState<number>(50000);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);

  // Fast live winners ticker (0.1s - 0.3s in hyper mode)
  useEffect(() => {
    if (feedSpeed === 'paused') return;

    const intervalMs =
      feedSpeed === 'hyper'
        ? Math.floor(180 + Math.random() * 120) // 180ms - 300ms (0.1s-0.3s)
        : feedSpeed === 'fast'
        ? 800
        : 2000;

    const timer = setInterval(() => {
      const nextWin = generateNextLiveWinner();
      if (minWinFilter === 0 || nextWin.payout >= minWinFilter) {
        setLiveWinners((prev) => [nextWin, ...prev.slice(0, 45)]);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [feedSpeed, minWinFilter]);

  // Stream in recent user spins as well
  useEffect(() => {
    if (recentSpins.length > 0) {
      const latest = recentSpins[0];
      if (latest && (minWinFilter === 0 || latest.payout >= minWinFilter)) {
        const item: LiveWinnerFeedItem = {
          id: 'user_spin_' + latest.id + '_' + Date.now(),
          username: latest.username || 'VIP Winner',
          badge: 'BIG WIN',
          mode: (latest.mode?.toUpperCase() as any) || 'FORTUNE',
          payout: latest.payout,
          multiplier: latest.multiplier,
          wager: latest.wager,
          timestamp: latest.timestamp || Date.now(),
          vipTier: latest.payout >= 100000 ? 'Diamond' : (latest.payout >= 50000 ? 'Platinum' : 'Gold'),
          bankName: 'Commercial Bank of Ethiopia (CBE)',
          bankAccountNumber: '1000 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' 1',
          telebirrNumber: '09' + Math.floor(10000000 + Math.random() * 90000000),
          location: 'Addis Ababa, Ethiopia'
        };
        setLiveWinners((prev) => [item, ...prev.slice(0, 45)]);
      }
    }
  }, [recentSpins, minWinFilter]);

  const [inspectWinner, setInspectWinner] = useState<{
    username: string;
    avatar: string;
    vipTier?: string;
    payout?: number;
    wager?: number;
    multiplier?: number;
    currency?: string;
    timestamp?: number;
    mode?: string;
    bankName?: string;
    bankAccountNumber?: string;
    telebirrNumber?: string;
    location?: string;
  } | null>(null);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendChat(inputText.trim());
    setInputText('');
    sounds.playChip();
  };

  return (
    <aside className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800/80 flex flex-col h-auto lg:h-[calc(100vh-65px)] sticky top-[65px] z-30">
      {/* Sidebar Header Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2 bg-slate-950/80">
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setActiveTab('feed'); sounds.playChip(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'feed'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Live Feed</span>
          </button>

          <button
            onClick={() => { setActiveTab('leaderboard'); sounds.playChip(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ranks</span>
          </button>
        </div>

        {/* Online Players Count Badge */}
        <button
          onClick={() => {
            setOnlinePlayersModalOpen(true);
            sounds.playChip();
          }}
          title="Click to view live online players"
          className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/60 px-2 py-0.5 rounded-full transition-all cursor-pointer shadow-sm active:scale-95 group"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="font-mono font-black">{onlineCount.toLocaleString()}</span>
          <Users className="w-3 h-3 text-emerald-400/80 group-hover:text-emerald-300 transition-colors" />
        </button>
      </div>

      {/* TAB 1: Live Global Chat */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col justify-between overflow-hidden p-3 min-h-[320px] lg:min-h-0 bg-slate-950">
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setInspectWinner({
                  username: msg.username,
                  avatar: msg.avatar,
                  vipTier: msg.vipTier,
                  payout: 150000,
                  multiplier: 5.0
                })}
                className="flex items-start gap-3 text-xs p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 transition-all cursor-pointer group shadow-sm"
              >
                <img
                  src={msg.avatar}
                  alt={msg.username}
                  className="w-10 h-10 rounded-full border-2 border-slate-700 group-hover:border-amber-400 mt-0.5 shrink-0 object-cover shadow-sm transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-extrabold text-amber-300 truncate text-xs group-hover:text-amber-400 transition-colors">
                      {msg.username}
                    </span>
                    {msg.vipTier && (
                      <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1 py-0.2 rounded font-bold">
                        {msg.vipTier}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-100 break-words font-semibold text-xs leading-snug">
                    {msg.text}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                    <span className="text-slate-400 font-medium">
                      {formatTimeAgo(msg.timestamp)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInputText(`@${msg.username} `);
                        sounds.playChip();
                      }}
                      className="text-slate-300 hover:text-amber-400 font-bold tracking-wide transition-colors"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        </div>
      )}

      {/* TAB 2: Live Global Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[320px] lg:min-h-0 bg-slate-950">
          <div className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-2 flex justify-between">
            <span>High Roller Ranks</span>
            <span>Total Payout</span>
          </div>

          {leaderboard.map((user) => (
            <div
              key={user.rank}
              onClick={() => setInspectWinner({
                username: user.username,
                avatar: user.avatar,
                vipTier: user.vipTier,
                payout: user.totalPayoutUSD,
                multiplier: user.biggestMultiplier
              })}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer hover:border-amber-500/50 ${
                user.rank === 1
                  ? 'bg-black border-2 border-emerald-500 shadow-lg'
                  : 'bg-black/90 border border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-black shrink-0 ${
                  user.rank === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-white'
                }`}>
                  {user.rank}
                </span>

                <img src={user.avatar} alt="Avatar" className="w-7 h-7 rounded-full border border-slate-700 shrink-0 object-cover" />

                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-xs text-white truncate">{user.username}</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded font-black">
                      {user.vipTier}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold block">
                    Highest: {user.biggestMultiplier}x
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-black text-xs text-emerald-400 block">
                  {user.totalPayoutUSD.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Birr
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {user.winsCount} Wins
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Live Feed */}
      {activeTab === 'feed' && (
        <div className="flex-1 flex flex-col min-h-[320px] lg:min-h-0 bg-[#030712] relative overflow-hidden">
          {/* Header matching image.png */}
          <div className="p-3 pb-2 border-b border-slate-900 bg-slate-950/90 flex items-center justify-between gap-1 flex-wrap">
            <div className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
              <span>LIVE WINNER FEED</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black tracking-normal">
                50,000+ BIRR
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Fast Ticker Speed Toggle (0.1s - 0.3s) */}
              <button
                onClick={() => {
                  setFeedSpeed((prev) => {
                    if (prev === 'hyper') return 'fast';
                    if (prev === 'fast') return 'normal';
                    if (prev === 'normal') return 'paused';
                    return 'hyper';
                  });
                  sounds.playChip();
                }}
                title="Click to toggle live feed speed"
                className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border shadow-sm cursor-pointer transition-all active:scale-95 ${
                  feedSpeed === 'hyper'
                    ? 'text-cyan-300 bg-cyan-950/90 border-cyan-400/80 shadow-cyan-500/20 animate-pulse'
                    : feedSpeed === 'fast'
                    ? 'text-cyan-300 bg-cyan-950/70 border-cyan-500/60'
                    : feedSpeed === 'normal'
                    ? 'text-slate-300 bg-slate-900 border-slate-700'
                    : 'text-rose-400 bg-rose-950/80 border-rose-600/70'
                }`}
              >
                <span>⚡</span>
                <span>
                  {feedSpeed === 'hyper'
                    ? '0.1s-0.3s'
                    : feedSpeed === 'fast'
                    ? '0.8s'
                    : feedSpeed === 'normal'
                    ? '2.0s'
                    : 'Paused'}
                </span>
              </button>

              {/* Min Win Filter (Default 50,000 Birr Big Win) */}
              <button
                onClick={() => {
                  setMinWinFilter((prev) => {
                    if (prev === 50000) return 75000;
                    if (prev === 75000) return 100000;
                    if (prev === 100000) return 50000;
                    return 50000;
                  });
                  sounds.playChip();
                }}
                title="Filter by minimum win amount (50,000+ Birr)"
                className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/80 px-2 py-0.5 rounded-full shadow-sm cursor-pointer transition-all active:scale-95"
              >
                <span className="text-[9px]">▼</span>
                <span>{`Min Win: ${minWinFilter.toLocaleString()} Birr`}</span>
              </button>
            </div>
          </div>

          {/* Winner Feed Cards List */}
          <div
            ref={feedContainerRef}
            className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 relative scrollbar-thin scrollbar-thumb-slate-800"
          >
            {liveWinners
              .filter((win) => minWinFilter === 0 || win.payout >= minWinFilter)
              .map((win) => {
                return (
                  <div
                    key={win.id}
                    onClick={() => {
                      setInspectWinner({
                        username: win.username,
                        avatar: '',
                        vipTier: win.vipTier,
                        payout: win.payout,
                        wager: win.wager,
                        multiplier: win.multiplier,
                        currency: 'CBE',
                        timestamp: win.timestamp,
                        mode: win.mode,
                        bankName: win.bankName,
                        bankAccountNumber: win.bankAccountNumber,
                        telebirrNumber: win.telebirrNumber,
                        location: win.location
                      });
                      sounds.playChip();
                    }}
                    className="p-2.5 sm:p-3 rounded-2xl border-2 border-amber-500/90 bg-[#060a14] hover:bg-[#0c1222] hover:border-amber-400 text-xs flex items-center justify-between shadow-lg shadow-amber-500/5 transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    {/* Left: Avatar + Username + Mode */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <WinnerAvatar size="md" showBadge={true} />

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-white text-xs sm:text-sm truncate group-hover:text-amber-300 transition-colors">
                            {win.username}
                          </span>
                          <span className="bg-[#f59e0b] text-slate-950 px-1.5 py-0.5 rounded font-black text-[9px] tracking-tight uppercase shadow-sm shrink-0">
                            BIG WIN
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-slate-400">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatTimeAgo(win.timestamp)}
                          </span>
                          <span className="text-[9px] text-slate-300 bg-slate-900 border border-slate-800 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            {win.mode}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Golden Payout + Multiplier */}
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-mono font-black text-xs sm:text-sm text-[#fbbf24] block leading-tight">
                        +{win.payout.toLocaleString()} Birr
                      </span>
                      <span className="text-[10px] text-amber-400/90 font-mono font-bold block mt-0.5">
                        {win.multiplier}x multiplier
                      </span>
                    </div>
                  </div>
                );
              })}

            {/* Jump to top floating button matching image.png */}
            <div className="sticky bottom-2 flex justify-end pr-1 pointer-events-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  feedContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                  sounds.playChip();
                }}
                title="Jump to latest winner"
                className="pointer-events-auto w-8 h-8 rounded-full bg-[#060a14] border border-amber-500 text-amber-400 flex items-center justify-center shadow-xl shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
              >
                <ChevronDown className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Profile Inspect Modal */}
      {inspectWinner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#080d1a] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 my-auto">
            {/* Close Button */}
            <button
              onClick={() => {
                setInspectWinner(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 p-2 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Avatar */}
            <div className="text-center pt-1">
              <div className="relative inline-block mb-3">
                <WinnerAvatar size="xl" showBadge={true} />
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#080d1a] shadow">
                  {inspectWinner.vipTier || 'VIP'}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <h3 className="text-xl font-black text-white">{inspectWinner.username}</h3>
                <span className="bg-[#f59e0b] text-slate-950 px-1.5 py-0.5 rounded font-black text-[9px] uppercase shadow-sm">
                  BIG WIN
                </span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>

              <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                <span>🇪🇹 {inspectWinner.location || 'Addis Ababa, Ethiopia'}</span>
                <span>•</span>
                <span>{formatTimeAgo(inspectWinner.timestamp)}</span>
              </p>

              {/* Win Summary Card */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Recent Big Win</span>
                  <span className="text-base font-black text-[#fbbf24] font-mono block mt-0.5">
                    +{inspectWinner.payout?.toLocaleString() || 0} Birr
                  </span>
                </div>

                <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Multiplier / Mode</span>
                  <span className="text-sm font-black text-amber-400 font-mono block mt-0.5 truncate">
                    {inspectWinner.multiplier || 0}x • {inspectWinner.mode || 'FORTUNE'}
                  </span>
                </div>
              </div>

              {/* Banking & Telebirr Profile Box - PRIVATE & PROTECTED */}
              <div className="mt-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black text-slate-200 tracking-wide uppercase">
                      Bank & Payout Profile
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    <ShieldCheck className="w-3 h-3" />
                    Verified & Encrypted
                  </span>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Primary Bank:</span>
                  <span className="font-bold text-slate-200">
                    {inspectWinner.bankName || 'Commercial Bank of Ethiopia (CBE)'}
                  </span>
                </div>

                {/* CBE Account Number (PRIVATE) */}
                <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase block">
                      CBE Account Number
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                        •••• •••• ••••
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Private
                  </span>
                </div>

                {/* Telebirr Phone Number (PRIVATE) */}
                <div className="flex items-center justify-between bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] text-sky-400 font-bold uppercase flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-sky-400" />
                      Telebirr Phone Number
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Lock className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                        09•• ••• •••
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Private
                  </span>
                </div>
              </div>

              {/* Action: Cheer in Community Chat */}
              <div className="mt-5">
                <button
                  onClick={() => {
                    onSendChat(`🎉 Huge congratulations to @${inspectWinner.username} on winning +${inspectWinner.payout?.toLocaleString() || 0} Birr!`);
                    setActiveTab('chat');
                    setInspectWinner(null);
                    sounds.playChip();
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-slate-950" />
                  <span>Cheer in Community Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online Players Explorer Modal */}
      <OnlinePlayersModal
        isOpen={onlinePlayersModalOpen}
        onClose={() => setOnlinePlayersModalOpen(false)}
        onlineCount={onlineCount}
        onInspectUser={(u) => {
          setInspectWinner({
            username: u.username,
            avatar: u.avatar,
            vipTier: (u.vipTier as any) || 'Diamond',
            payout: 25000,
            wager: 250,
            multiplier: 100,
            currency: 'CBE',
            timestamp: Date.now() - 1000 * 60 * 5,
            mode: 'FORTUNE',
            bankName: 'Commercial Bank of Ethiopia (CBE)',
            bankAccountNumber: '',
            telebirrNumber: '',
            location: 'Ethiopia'
          });
          setOnlinePlayersModalOpen(false);
        }}
      />
    </aside>
  );
};
