import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Trophy, Zap, Crown, Gift, Users, X } from 'lucide-react';
import { ChatMessage, LeaderboardEntry, SpinResult, CryptoCurrency, VipTier } from '../types';
import { sounds } from '../utils/audio';

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
  onSendTip: (recipient: string, amount: number, currency: CryptoCurrency) => void;
  username: string;
  vipTier: VipTier;
  onlineCount: number;
}

export const MultiplayerSidebar: React.FC<MultiplayerSidebarProps> = ({
  chatHistory,
  leaderboard,
  recentSpins,
  onSendChat,
  onSendTip,
  username,
  vipTier,
  onlineCount
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'leaderboard' | 'feed'>('feed');
  const [inputText, setInputText] = useState<string>('');
  const [tipModalOpen, setTipModalOpen] = useState<boolean>(false);
  const [tipRecipient, setTipRecipient] = useState<string>('');
  const [tipAmount, setTipAmount] = useState<number>(0.1);
  const [tipCurrency, setTipCurrency] = useState<CryptoCurrency>('SOL');
  const [inspectWinner, setInspectWinner] = useState<{
    username: string;
    avatar: string;
    vipTier?: string;
    payout?: number;
    wager?: number;
    multiplier?: number;
    currency?: string;
    timestamp?: number;
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

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tipRecipient || tipAmount <= 0) return;
    onSendTip(tipRecipient, tipAmount, tipCurrency);
    setTipModalOpen(false);
    sounds.playWin(true);
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
            onClick={() => { setActiveTab('chat'); sounds.playChip(); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-amber-400 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
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
        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{onlineCount.toLocaleString()}</span>
        </div>
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
                        setTipRecipient(msg.username);
                        setTipModalOpen(true);
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

          {/* Chat Tip Bar */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col gap-2">
            <button
              onClick={() => { setTipModalOpen(true); sounds.playChip(); }}
              className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-[11px] rounded-lg transition-colors font-medium"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Send Birr Tip to Player</span>
            </button>
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[320px] lg:min-h-0 bg-slate-950">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE WINNER FEED</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-extrabold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md">
              Min Win: 10,000 Birr
            </span>
          </div>

          {recentSpins.filter((s) => s.payout >= 10000).map((spin) => {
            const isWin = spin.multiplier > 0;
            const isBigWin = spin.payout >= 400000;
            return (
              <div
                key={spin.id}
                onClick={() => setInspectWinner({
                  username: spin.username,
                  avatar: spin.avatar,
                  payout: spin.payout,
                  wager: spin.wager,
                  multiplier: spin.multiplier,
                  currency: spin.currency,
                  timestamp: spin.timestamp
                })}
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between shadow-md transition-all cursor-pointer group ${
                  isBigWin
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/70 hover:border-amber-400 shadow-amber-500/10'
                    : 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={spin.avatar}
                      alt={spin.username}
                      className={`w-10 h-10 rounded-full border-2 object-cover shadow-sm transition-colors ${
                        isBigWin ? 'border-amber-400 shadow-amber-500/30' : 'border-slate-700 group-hover:border-amber-400'
                      }`}
                    />
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[7px] font-bold text-black">
                      ✓
                    </span>
                  </div>

                  <div className="truncate min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-white text-xs truncate group-hover:text-amber-300 transition-colors">
                        {spin.username}
                      </span>
                      {isBigWin && (
                        <span className="text-[8px] bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-1.5 py-0.2 rounded font-black tracking-wider uppercase shadow-sm">
                          BIG WIN
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatTimeAgo(spin.timestamp)}
                      </span>
                      <span className="text-[9px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.2 rounded font-bold uppercase">
                        {spin.mode}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTipRecipient(spin.username);
                          setTipModalOpen(true);
                          sounds.playChip();
                        }}
                        className="text-[10px] text-slate-300 hover:text-amber-400 font-bold ml-1 transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <span className={`font-mono font-black text-xs block ${isWin ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isWin ? `+${spin.payout ? spin.payout.toLocaleString() : '0'} Birr` : '0 Birr'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-black block">
                    {spin.multiplier}x multiplier
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Winner Profile Inspect Modal */}
      {inspectWinner && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setInspectWinner(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-1.5 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <div className="relative inline-block mb-3">
                <img
                  src={inspectWinner.avatar}
                  alt={inspectWinner.username}
                  className="w-20 h-20 rounded-full border-4 border-amber-500 shadow-xl object-cover"
                />
                <span className="absolute bottom-0 right-0 bg-amber-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-slate-900">
                  WINNER
                </span>
              </div>

              <h3 className="text-lg font-black text-white">{inspectWinner.username}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Verified Player • {formatTimeAgo(inspectWinner.timestamp)}</p>

              <div className="grid grid-cols-2 gap-2 mt-4 text-left">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Recent Win</span>
                  <span className="text-sm font-black text-emerald-400 font-mono block mt-0.5">
                    +{inspectWinner.payout?.toLocaleString() || 0} Birr
                  </span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Multiplier</span>
                  <span className="text-sm font-black text-amber-400 font-mono block mt-0.5">
                    {inspectWinner.multiplier || 0}x
                  </span>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => {
                    setTipRecipient(inspectWinner.username);
                    setInspectWinner(null);
                    setTipModalOpen(true);
                  }}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Send Tip to {inspectWinner.username.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tip Modal */}
      {tipModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-black border-2 border-red-600 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-base font-black text-white mb-3 flex items-center gap-2">
              <Gift className="w-5 h-5 text-red-500" />
              <span>Send Birr Tip</span>
            </h3>

            <form onSubmit={handleTipSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-red-500 font-bold block mb-1">Recipient Username</label>
                <input
                  type="text"
                  placeholder="e.g. ABDI_BORA"
                  value={tipRecipient}
                  onChange={(e) => setTipRecipient(e.target.value)}
                  className="w-full bg-white border-2 border-red-600 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-red-500 font-bold block mb-1">Channel</label>
                  <select
                    value={tipCurrency}
                    onChange={(e) => setTipCurrency(e.target.value as CryptoCurrency)}
                    className="w-full bg-white border-2 border-red-600 rounded-xl px-3 py-2 text-xs text-black font-bold focus:outline-none"
                  >
                    <option value="CBE">CBE Birr</option>
                    <option value="Telebirr">Telebirr</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-red-500 font-bold block mb-1">Tip Amount</label>
                  <input
                    type="number"
                    step={0.01}
                    value={tipAmount}
                    onChange={(e) => setTipAmount(Number(e.target.value))}
                    className="w-full bg-white border-2 border-red-600 rounded-xl px-3 py-2 text-xs text-black font-mono font-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTipModalOpen(false)}
                  className="flex-1 py-2 bg-black border border-red-600 text-red-500 font-black text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-xl transition-colors shadow-md border border-red-400"
                >
                  Confirm Tip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
