import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Flame, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { sounds } from '../utils/audio';

interface StreakNotificationProps {
  streak: number;
  show: boolean;
  onClose: () => void;
}

export const triggerFireworks = () => {
  // Sound effect
  sounds.playWin();

  // Multi-stage fireworks explosion burst using canvas-confetti
  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;

  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Center & side fireworks launches
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#ff4d4d', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ef4444', '#8b5cf6']
    });
  }, 250);
};

export const StreakNotification: React.FC<StreakNotificationProps> = ({
  streak,
  show,
  onClose
}) => {
  useEffect(() => {
    if (show && streak >= 3) {
      triggerFireworks();

      // Auto dismiss after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, streak]);

  if (!show || streak < 3) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-in zoom-in-95 duration-300">
      <div className="relative bg-gradient-to-r from-amber-950/95 via-slate-900/95 to-red-950/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-[0_0_40px_rgba(245,158,11,0.5)] backdrop-blur-xl overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-3 bg-gradient-to-br from-amber-500 to-red-600 rounded-xl shadow-lg shadow-amber-500/30 text-white font-black animate-bounce">
              <Flame className="w-7 h-7 text-yellow-200 fill-amber-300" />
              <span className="absolute -top-1 -right-1 bg-white text-slate-950 text-[10px] px-1.5 py-0.5 rounded-full font-black border border-amber-400">
                {streak}x
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                <h4 className="font-black text-amber-400 uppercase tracking-wider text-sm">
                  {streak}-Spin Winning Streak!
                </h4>
              </div>
              <p className="text-xs text-slate-200 font-medium mt-0.5">
                You're on fire! Unlocked <span className="text-emerald-400 font-bold">Firework Celebration</span> & VIP bonus boost!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom progress bar countdown */}
        <div className="w-full bg-slate-800/80 h-1 rounded-full mt-3 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-red-500 h-full w-full animate-[shrink_5s_linear]" />
        </div>
      </div>
    </div>
  );
};
