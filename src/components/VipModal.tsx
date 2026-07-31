import React, { useState } from 'react';
import { X, Crown, Award, Gift, Sparkles, CheckCircle } from 'lucide-react';
import { UserProfile, VipTier } from '../types';
import { VIP_LEVELS } from '../data/constants';
import { sounds } from '../utils/audio';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onClaimCashback: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimCashback
}) => {
  const [claimed, setClaimed] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentLevel = VIP_LEVELS.find(v => v.name === user.vipTier) || VIP_LEVELS[0];

  const handleClaim = () => {
    sounds.playWin(true);
    onClaimCashback();
    setClaimed(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base text-white font-mono">VIP Rewards Club</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* VIP Level Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-950 border border-amber-500/40 text-center relative overflow-hidden shadow-xl">
            <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
            <span className="text-xs uppercase tracking-widest font-bold text-amber-400/80 block">Current Status</span>
            <h3 className="text-2xl font-black text-white mt-1">{user.vipTier} VIP Member</h3>
            <p className="text-xs text-slate-300 mt-1">Enjoy {currentLevel.cashbackPercent}% Daily Birr Cashback & Zero Fee Withdrawals</p>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-around text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Cashback Rate</span>
                <span className="font-bold text-emerald-400 text-sm">{currentLevel.cashbackPercent}%</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Rakeback Multiplier</span>
                <span className="font-bold text-amber-400 text-sm">1.5x Boost</span>
              </div>
            </div>
          </div>

          {/* Cashback Reward Claim Box */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Daily VIP Cashback Reward</span>
                <span className="text-[10px] text-emerald-400 font-mono">+250 Birr Daily Cashback Payout</span>
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={claimed}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                claimed
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              }`}
            >
              {claimed ? 'Claimed Today' : 'Claim Reward'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
