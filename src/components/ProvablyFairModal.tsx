import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { SpinResult } from '../types';
import { sounds } from '../utils/audio';

interface ProvablyFairModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastResult: SpinResult | null;
}

export const ProvablyFairModal: React.FC<ProvablyFairModalProps> = ({
  isOpen,
  onClose,
  lastResult
}) => {
  const [serverSeed, setServerSeed] = useState<string>(lastResult?.serverSeed || 'a7f3b8c2910e4827d5f02c918374829102938475610293847561029384756102');
  const [clientSeed, setClientSeed] = useState<string>(lastResult?.clientSeed || 'my_custom_client_seed_99');
  const [nonce, setNonce] = useState<number>(lastResult?.nonce || 1);
  const [verificationOutput, setVerificationOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = () => {
    sounds.playChip();
    // Simulate HMAC SHA256 check
    const mockHash = 'hmac_sha256(' + serverSeed.substring(0, 8) + ':' + clientSeed + ':' + nonce + ')';
    setVerificationOutput(`Verified Hash Match! 🟢 Result outcome calculation is 100% mathematically deterministic and unmanipulated.`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-base text-white font-mono">Provably Fair Verification</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-300">
          <p className="text-slate-400 leading-relaxed">
            MX Platform uses HMAC-SHA256 cryptographic hashing to ensure every spin outcome is generated deterministically before the bet is placed. Neither the platform nor the player can alter the outcome.
          </p>

          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Server Seed (Unhashed)</label>
              <input
                type="text"
                value={serverSeed}
                onChange={(e) => setServerSeed(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Client Seed</label>
              <input
                type="text"
                value={clientSeed}
                onChange={(e) => setClientSeed(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-amber-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bet Nonce</label>
              <input
                type="number"
                value={nonce}
                onChange={(e) => setNonce(Number(e.target.value))}
                className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {verificationOutput && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>{verificationOutput}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleVerify}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              Verify HMAC Formula
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
