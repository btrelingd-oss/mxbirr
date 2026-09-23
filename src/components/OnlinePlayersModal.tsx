import React, { useState } from 'react';
import { Users, Search, X, Zap, Trophy, ShieldCheck, Flame, MapPin } from 'lucide-react';
import { COMMUNITY_USERS } from '../data/communityUsers';
import { GameMode, VipTier } from '../types';
import { sounds } from '../utils/audio';

interface OnlinePlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onlineCount: number;
  onInspectUser?: (user: { username: string; avatar: string; vipTier?: string }) => void;
}

export const OnlinePlayersModal: React.FC<OnlinePlayersModalProps> = ({
  isOpen,
  onClose,
  onlineCount,
  onInspectUser
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState<'all' | GameMode>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | VipTier>('all');

  if (!isOpen) return null;

  const filteredPlayers = COMMUNITY_USERS.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = selectedGameFilter === 'all' || user.favoriteGame === selectedGameFilter;
    const matchesTier = selectedTierFilter === 'all' || user.vipTier === selectedTierFilter;
    return matchesSearch && matchesGame && matchesTier;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">Live Online Players</h2>
                <span className="flex items-center gap-1 text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {onlineCount.toLocaleString()} Active
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time active community members playing across Ethiopia</p>
            </div>
          </div>

          <button
            onClick={() => { onClose(); sounds.playChip(); }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Stats Bar */}
        <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/40 border-b border-slate-800 text-center">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Fortune Wheel</span>
            <span className="text-sm font-black font-mono text-amber-400">
              {Math.round(onlineCount * 0.42).toLocaleString()} Playing
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Addis 777 Slots</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {Math.round(onlineCount * 0.38).toLocaleString()} Playing
            </span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">CBE Roulette</span>
            <span className="text-sm font-black font-mono text-sky-400">
              {Math.round(onlineCount * 0.20).toLocaleString()} Playing
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-900 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by username or city (Addis, Hawassa, Bole)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Game Mode Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {(['all', 'fortune', 'slots', 'roulette'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => { setSelectedGameFilter(mode); sounds.playChip(); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors shrink-0 ${
                  selectedGameFilter === mode
                    ? 'bg-amber-500 text-black font-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'all' ? 'All Games' : mode}
              </button>
            ))}
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No players found matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredPlayers.map((player) => {
                const tierColor =
                  player.vipTier === 'Diamond'
                    ? 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40'
                    : player.vipTier === 'Platinum'
                    ? 'text-purple-300 bg-purple-500/20 border-purple-500/40'
                    : player.vipTier === 'Gold'
                    ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                    : player.vipTier === 'Silver'
                    ? 'text-slate-300 bg-slate-500/20 border-slate-500/40'
                    : 'text-amber-600 bg-amber-800/20 border-amber-800/40';

                return (
                  <div
                    key={player.id}
                    className="p-3 bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-2.5 transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={player.avatar}
                          alt={player.username}
                          className="w-10 h-10 rounded-full border border-slate-700 object-cover group-hover:border-amber-400 transition-colors"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-xs text-white truncate group-hover:text-amber-300">
                            {player.username}
                          </span>
                          <span className={`text-[9px] font-black border px-1 rounded uppercase ${tierColor}`}>
                            {player.vipTier}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          <span className="truncate">{player.location}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold text-amber-400 capitalize bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                            🎮 {player.favoriteGame}
                          </span>
                          <span className="text-[10px] font-mono font-black text-emerald-400">
                            +{player.totalWonBirr.toLocaleString()} Birr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 shrink-0">
                      {onInspectUser && (
                        <button
                          onClick={() => {
                            onInspectUser({
                              username: player.username,
                              avatar: player.avatar,
                              vipTier: player.vipTier
                            });
                            sounds.playChip();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 transition-colors"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
