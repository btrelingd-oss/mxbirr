import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Play, RotateCw, ShieldCheck, Zap, AlertCircle, Coins, Award, BarChart3 } from 'lucide-react';
import { GameMode, CryptoCurrency, FortuneSegment, SlotSymbol, SpinResult, UserProfile } from '../types';
import { FORTUNE_WHEEL_SEGMENTS, SLOT_SYMBOLS, ROULETTE_NUMBERS } from '../data/constants';
import { sounds } from '../utils/audio';

interface SpinArenaProps {
  user: UserProfile;
  selectedCurrency: CryptoCurrency;
  onSpinSubmit: (
    mode: GameMode,
    wager: number,
    currency: CryptoCurrency,
    rouletteBet?: any
  ) => Promise<SpinResult | null>;
  onOpenProvablyFair: () => void;
  lastResult: SpinResult | null;
}

export const SpinArena: React.FC<SpinArenaProps> = ({
  user,
  selectedCurrency,
  onSpinSubmit,
  onOpenProvablyFair,
  lastResult
}) => {
  const [activeMode, setActiveMode] = useState<GameMode>('fortune');
  const [wagerAmount, setWagerAmount] = useState<number>(20);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number>(10);
  const [isAutoSpinActive, setIsAutoSpinActive] = useState<boolean>(false);

  const autoSpinRef = useRef<boolean>(false);
  const autoSpinCountRef = useRef<number>(10);
  const isAutoSpinActiveRef = useRef<boolean>(false);
  const handleSpinRef = useRef<() => Promise<void>>();

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => {
    autoSpinCountRef.current = autoSpinCount;
  }, [autoSpinCount]);

  useEffect(() => {
    isAutoSpinActiveRef.current = isAutoSpinActive;
  }, [isAutoSpinActive]);

  const stopAutoSpin = () => {
    setIsAutoSpinActive(false);
    isAutoSpinActiveRef.current = false;
    setAutoSpin(false);
    autoSpinRef.current = false;
  };

  const startAutoSpin = () => {
    if (autoSpinCount <= 0) return;
    setIsAutoSpinActive(true);
    isAutoSpinActiveRef.current = true;
    setAutoSpin(true);
    autoSpinRef.current = true;
    if (!isSpinning && handleSpinRef.current) {
      handleSpinRef.current();
    }
  };

  const [rouletteBetType, setRouletteBetType] = useState<'red' | 'black' | 'green' | 'even' | 'odd' | 'number'>('red');
  const [rouletteNumber, setRouletteNumber] = useState<number>(7);

  // Wheel Animation States
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [currentWin, setCurrentWin] = useState<SpinResult | null>(null);

  // User Session Dashboard History State
  const [sessionSpins, setSessionSpins] = useState<SpinResult[]>(() => {
    const modes: GameMode[] = ['fortune', 'slots', 'roulette', 'fortune', 'slots', 'roulette', 'fortune', 'slots'];
    const now = Date.now();
    return Array.from({ length: 8 }, (_, i) => {
      const mode = modes[i % modes.length];
      const isWin = i % 3 !== 1;
      const multiplier = isWin ? (i % 2 === 0 ? 2.5 : 4.0) : 0;
      const wager = 10;
      const wagerUSD = 10;
      const payout = wager * multiplier;
      const payoutUSD = wagerUSD * multiplier;

      return {
        id: `session_init_${now}_${i}`,
        mode,
        username: user.username,
        avatar: user.avatar,
        wager,
        currency: selectedCurrency,
        wagerUSD,
        multiplier,
        payout,
        payoutUSD,
        timestamp: now - (8 - i) * 120000,
        serverSeedHash: 'f89a7b9c...4e1a',
        clientSeed: user.clientSeed,
        nonce: i + 1,
        resultDetails: {
          segmentLabel: multiplier > 0 ? `${multiplier}x WIN` : '0x LOSS'
        }
      };
    });
  });

  const handleAddDemoSpins = () => {
    const modes: GameMode[] = ['fortune', 'slots', 'roulette', 'fortune', 'slots'];
    const now = Date.now();
    const newDemoData: SpinResult[] = Array.from({ length: 10 }, (_, i) => {
      const mode = modes[i % modes.length];
      const isWin = i % 3 !== 2;
      const multiplier = isWin ? (i % 2 === 0 ? 3.0 : 6.0) : 0;
      const wager = 10;
      const wagerUSD = 10;
      const payout = wager * multiplier;
      const payoutUSD = wagerUSD * multiplier;

      return {
        id: `demo_${now}_${i}`,
        mode,
        username: user.username,
        avatar: user.avatar,
        wager,
        currency: selectedCurrency,
        wagerUSD,
        multiplier,
        payout,
        payoutUSD,
        timestamp: now - (10 - i) * 60000,
        serverSeedHash: 'a1b2c3d4...e5f6',
        clientSeed: user.clientSeed,
        nonce: i + 1,
        resultDetails: {
          segmentLabel: multiplier > 0 ? `${multiplier}x WIN` : '0x LOSS'
        }
      };
    });
    setSessionSpins(newDemoData);
  };

  const finalizeSpinResult = (res: SpinResult) => {
    setIsSpinning(false);
    setCurrentWin(res);
    setSessionSpins((prev) => [...prev, res]);
    if (res.multiplier > 0) {
      sounds.playWin(res.multiplier >= 10);
    }

    // Auto-spin continuation logic
    if (autoSpinRef.current && isAutoSpinActiveRef.current) {
      const remaining = autoSpinCountRef.current - 1;
      setAutoSpinCount(remaining);
      autoSpinCountRef.current = remaining;

      if (remaining > 0) {
        setTimeout(() => {
          if (autoSpinRef.current && isAutoSpinActiveRef.current) {
            if (handleSpinRef.current) {
              handleSpinRef.current();
            }
          }
        }, 1000);
      } else {
        stopAutoSpin();
      }
    }
  };

  // Slot Reel States
  const [slotReels, setSlotReels] = useState<SlotSymbol[]>([SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]]);

  // Canvas Ref for Wheel Rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Update default wager on currency change
  useEffect(() => {
    if (selectedCurrency === 'BTC') setWagerAmount(0.001);
    else if (selectedCurrency === 'ETH') setWagerAmount(0.02);
    else if (selectedCurrency === 'SOL') setWagerAmount(0.2);
    else if (selectedCurrency === 'DOGE') setWagerAmount(100);
    else setWagerAmount(20);
  }, [selectedCurrency]);

  // Draw Fortune Wheel on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 12;

    ctx.clearRect(0, 0, size, size);

    // Save context for wheel rotation
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate((rotationAngle * Math.PI) / 180);

    const totalSegments = FORTUNE_WHEEL_SEGMENTS.length;
    const anglePerSeg = (2 * Math.PI) / totalSegments;

    FORTUNE_WHEEL_SEGMENTS.forEach((seg, i) => {
      const startAngle = i * anglePerSeg;
      const endAngle = startAngle + anglePerSeg;

      // Draw segment wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = seg.color;
      ctx.fill();
      ctx.strokeStyle = '#121212';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw segment label
      ctx.save();
      ctx.rotate(startAngle + anglePerSeg / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.textColor || '#ffffff';
      ctx.font = '900 14px system-ui, -apple-system, sans-serif';
      ctx.fillText(seg.label, radius - 18, 5);
      ctx.restore();
    });

    ctx.restore();

    // Outer wheel border ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1e1e1e';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 1, 0, 2 * Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Top 12 o'clock Win Area Pointer Pin (pointing DOWN into the winning segment)
    const topPointerY = center - radius;
    ctx.beginPath();
    ctx.moveTo(center, topPointerY + 14); // tip pointing down into winning wheel segment
    ctx.lineTo(center - 10, topPointerY - 10);
    ctx.lineTo(center + 10, topPointerY - 10);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b'; // Amber Gold
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Glowing center dot on top win indicator pin
    ctx.beginPath();
    ctx.arc(center, topPointerY - 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // Center Hub & Teardrop Pointer (pointing UP to 12 o'clock Win Area)
    const hubRadius = 35;
    const tipY = center - hubRadius - 20;

    ctx.beginPath();
    // Start at top tip of teardrop
    ctx.moveTo(center, tipY);

    // Curve down right side to circle hub
    ctx.bezierCurveTo(
      center + 12, tipY + 10,
      center + hubRadius, center - 12,
      center + hubRadius, center
    );

    // Arc around bottom of center circle
    ctx.arc(center, center, hubRadius, 0, Math.PI, false);

    // Curve back up left side to top tip
    ctx.bezierCurveTo(
      center - hubRadius, center - 12,
      center - 12, tipY + 10,
      center, tipY
    );

    ctx.closePath();

    // Fill dark charcoal/black
    ctx.fillStyle = '#1c1c1c';
    ctx.fill();

    // Crisp white border outline exactly like user screenshot
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // White "SPIN" text centered inside hub
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', center, center + 2);

  }, [rotationAngle]);

  // Execute Spin Action
  const handleSpin = async () => {
    if (isSpinning) return;
    if (wagerAmount <= 0) {
      alert('Please enter a valid wager amount');
      stopAutoSpin();
      return;
    }
    if (user.balances[selectedCurrency] < wagerAmount) {
      alert(`Insufficient ${selectedCurrency} balance! Please deposit funds.`);
      stopAutoSpin();
      return;
    }

    setIsSpinning(true);
    setCurrentWin(null);
    sounds.playChip();

    let rouletteBetParam = undefined;
    if (activeMode === 'roulette') {
      rouletteBetParam = {
        type: rouletteBetType,
        number: rouletteBetType === 'number' ? rouletteNumber : undefined,
        amount: wagerAmount,
        currency: selectedCurrency
      };
    }

    // Call Backend Provably Fair Spin Endpoint
    const result = await onSpinSubmit(activeMode, wagerAmount, selectedCurrency, rouletteBetParam);

    if (!result) {
      setIsSpinning(false);
      stopAutoSpin();
      return;
    }

    // Animate Spin based on Mode
    if (activeMode === 'fortune') {
      let segIndex = FORTUNE_WHEEL_SEGMENTS.findIndex(s => s.label === result.resultDetails.segmentLabel);
      if (segIndex < 0) segIndex = 0;
      const totalSegs = FORTUNE_WHEEL_SEGMENTS.length;
      const anglePerSeg = 360 / totalSegs;

      // Desired modulo angle where segment segIndex is centered directly at 12 o'clock (270°)
      const desiredFinalModulo = ((270 - (segIndex + 0.5) * anglePerSeg) % 360 + 360) % 360;

      const fullSpins = 5 * 360;
      const currentModulo = rotationAngle % 360;
      let forwardDiff = desiredFinalModulo - currentModulo;
      if (forwardDiff <= 0) {
        forwardDiff += 360;
      }
      const targetAngle = rotationAngle + fullSpins + forwardDiff;

      const duration = 3500;
      const startTime = performance.now();
      const startAngle = rotationAngle;

      let lastTickAngle = startAngle;

      const animateWheel = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic formula
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

        setRotationAngle(currentAngle);

        if (currentAngle - lastTickAngle >= 40) {
          sounds.playTick();
          lastTickAngle = currentAngle;
        }

        if (progress < 1) {
          requestAnimationFrame(animateWheel);
        } else {
          finalizeSpinResult(result);
        }
      };

      requestAnimationFrame(animateWheel);
    } else if (activeMode === 'slots') {
      // Slot Reel Animation
      const duration = 2000;
      const interval = setInterval(() => {
        setSlotReels([
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)],
          SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]
        ]);
        sounds.playReelStop();
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        if (result.resultDetails.slotSymbols) {
          setSlotReels(result.resultDetails.slotSymbols);
        }
        finalizeSpinResult(result);
      }, duration);
    } else {
      // Roulette Spin Animation
      setTimeout(() => {
        finalizeSpinResult(result);
      }, 2000);
    }
  };

  useEffect(() => {
    handleSpinRef.current = handleSpin;
  });

  // Quick Preset Wager Adjustments
  const setWagerPreset = (type: 'half' | 'double' | 'max' | 'preset', val?: number) => {
    sounds.playChip();
    const currentBal = user.balances[selectedCurrency];
    if (type === 'half') setWagerAmount(Math.max(1, Math.floor(wagerAmount / 2)));
    else if (type === 'double') setWagerAmount(Math.min(currentBal, Math.floor(wagerAmount * 2)));
    else if (type === 'max') setWagerAmount(Math.floor(currentBal));
    else if (type === 'preset' && val) setWagerAmount(val);
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Game Mode Selector Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => { setActiveMode('fortune'); sounds.playChip(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeMode === 'fortune'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>Mega Fortune Wheel</span>
          </button>

          <button
            onClick={() => { setActiveMode('slots'); sounds.playChip(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeMode === 'slots'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Triple Crypto Slots</span>
          </button>

          <button
            onClick={() => { setActiveMode('roulette'); sounds.playChip(); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeMode === 'roulette'
                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Roulette Spin</span>
          </button>
        </div>

        {/* Fairness Indicator */}
        <button
          onClick={onOpenProvablyFair}
          className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Provably Fair RNG</span>
        </button>
      </div>

      {/* Primary Stage Box */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-10 flex flex-col items-center justify-center min-h-[420px] shadow-2xl overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* MODE 1: Mega Fortune Wheel */}
        {activeMode === 'fortune' && (
          <div
            onClick={isAutoSpinActive || isSpinning ? undefined : handleSpin}
            className={`relative flex flex-col items-center justify-center my-4 select-none ${
              isAutoSpinActive || isSpinning ? 'cursor-not-allowed opacity-90' : 'cursor-pointer group'
            }`}
            title={isAutoSpinActive ? 'Auto-Spin Active' : 'Click to Spin!'}
          >
            {/* Canvas Wheel */}
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] transition-transform group-hover:scale-[1.02] active:scale-95 drop-shadow-2xl"
            />
          </div>
        )}

        {/* MODE 2: Crypto Triple Slots */}
        {activeMode === 'slots' && (
          <div className="flex flex-col items-center justify-center my-6 w-full max-w-lg">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-inner">
              {slotReels.map((sym, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl bg-gradient-to-b ${sym.bgGradient} border border-slate-700/60 shadow-lg ${
                    isSpinning ? 'animate-pulse scale-95' : 'scale-100'
                  } transition-all`}
                >
                  <span className="text-4xl sm:text-6xl mb-2">{sym.symbol}</span>
                  <span className="text-xs font-bold text-slate-300">{sym.name}</span>
                  <span className="text-[10px] text-amber-400 font-mono mt-1">{sym.multiplier}x</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3 font-medium">Match 3 symbols for massive payout multipliers! 🎰</p>
          </div>
        )}

        {/* MODE 3: Roulette Spin */}
        {activeMode === 'roulette' && (
          <div className="flex flex-col items-center justify-center my-4 w-full max-w-2xl">
            {/* Roulette Winner Number Display */}
            {lastResult && lastResult.mode === 'roulette' && (
              <div className="mb-4 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Winning Number</span>
                <div className={`text-4xl font-black mt-1 ${
                  lastResult.resultDetails.rouletteColor === 'green' ? 'text-emerald-400' :
                  lastResult.resultDetails.rouletteColor === 'red' ? 'text-rose-500' : 'text-slate-200'
                }`}>
                  {lastResult.resultDetails.rouletteNumber} ({lastResult.resultDetails.rouletteColor?.toUpperCase()})
                </div>
              </div>
            )}

            {/* Roulette Betting Options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              <button
                onClick={() => { setRouletteBetType('red'); sounds.playChip(); }}
                className={`p-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 ${
                  rouletteBetType === 'red'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-400 shadow-lg shadow-rose-600/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-rose-600" />
                <span>RED</span>
                <span className="text-[11px] font-mono text-slate-400">2.0x Payout</span>
              </button>

              <button
                onClick={() => { setRouletteBetType('black'); sounds.playChip(); }}
                className={`p-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 ${
                  rouletteBetType === 'black'
                    ? 'bg-slate-700/30 border-slate-400 text-slate-200 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-600" />
                <span>BLACK</span>
                <span className="text-[11px] font-mono text-slate-400">2.0x Payout</span>
              </button>

              <button
                onClick={() => { setRouletteBetType('green'); sounds.playChip(); }}
                className={`p-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 ${
                  rouletteBetType === 'green'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500" />
                <span>GREEN (0)</span>
                <span className="text-[11px] font-mono text-emerald-400">14.0x Payout</span>
              </button>

              <button
                onClick={() => { setRouletteBetType('number'); sounds.playChip(); }}
                className={`p-4 rounded-xl font-bold text-sm border transition-all flex flex-col items-center justify-center gap-1 ${
                  rouletteBetType === 'number'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-lg'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Award className="w-4 h-4 text-amber-400" />
                <span>SPECIFIC #</span>
                <span className="text-[11px] font-mono text-amber-400">36.0x Payout</span>
              </button>
            </div>

            {rouletteBetType === 'number' && (
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs font-bold text-slate-300">Target Number (0-36):</span>
                <input
                  type="number"
                  min={0}
                  max={36}
                  value={rouletteNumber}
                  onChange={(e) => setRouletteNumber(Math.min(36, Math.max(0, Number(e.target.value))))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 w-20 text-center font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Spin Result Banner / Payout Toast */}
        {currentWin && (
          <div className={`mt-4 px-6 py-3 rounded-xl border text-center animate-in fade-in zoom-in-95 ${
            currentWin.multiplier > 0
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <div className="text-xs font-bold uppercase tracking-wider">
              {currentWin.multiplier > 0 ? '🎉 WINNER!' : 'NO WIN'}
            </div>
            <div className="text-xl font-black mt-0.5">
              {currentWin.multiplier > 0 ? (
                <>
                  +{currentWin.payout.toFixed(currentWin.currency === 'BTC' ? 4 : 2)} {currentWin.currency}
                  <span className="text-xs text-slate-400 font-mono ml-2">(${currentWin.payoutUSD.toFixed(2)})</span>
                  <span className="ml-2 bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold">
                    {currentWin.multiplier}x
                  </span>
                </>
              ) : (
                '0.00x - Try Again!'
              )}
            </div>
          </div>
        )}
      </div>

      {/* Betting Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl flex flex-col gap-4">
        {/* Auto-Spin Options Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoSpin}
              onChange={(e) => {
                const checked = e.target.checked;
                setAutoSpin(checked);
                autoSpinRef.current = checked;
                if (!checked) {
                  stopAutoSpin();
                } else {
                  if (autoSpinCount <= 0) {
                    setAutoSpinCount(10);
                    autoSpinCountRef.current = 10;
                  }
                  sounds.playChip();
                }
              }}
              disabled={isSpinning && isAutoSpinActive}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:opacity-50"
            />
            <span className="text-xs font-bold text-slate-200">Auto-Spin Mode</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Spins:</span>
            <div className="flex items-center gap-1">
              {[5, 10, 25, 50, 100].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => {
                    setAutoSpinCount(cnt);
                    autoSpinCountRef.current = cnt;
                    setAutoSpin(true);
                    autoSpinRef.current = true;
                    sounds.playChip();
                  }}
                  className={`px-2 py-1 text-xs font-extrabold rounded-lg border transition-all ${
                    autoSpinCount === cnt && autoSpin
                      ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white disabled:opacity-50'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={500}
              disabled={isAutoSpinActive || isSpinning}
              value={autoSpinCount}
              onChange={(e) => {
                const val = Math.max(1, Math.min(500, Number(e.target.value) || 1));
                setAutoSpinCount(val);
                autoSpinCountRef.current = val;
              }}
              className="w-16 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs text-amber-400 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Wager Input Section */}
          <div className="md:col-span-7 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Wager Amount ({selectedCurrency})</span>
              <span>Available: {user.balances[selectedCurrency].toFixed(selectedCurrency === 'BTC' ? 4 : 2)} {selectedCurrency}</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step={selectedCurrency === 'BTC' ? 0.0001 : 0.01}
                  min={0.0001}
                  disabled={isAutoSpinActive || isSpinning}
                  value={wagerAmount}
                  onChange={(e) => setWagerAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-white font-mono font-bold text-sm focus:outline-none transition-colors disabled:opacity-50"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-amber-400">{selectedCurrency}</span>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('preset', 20)}
                  className={`border font-bold text-xs px-2.5 py-3 rounded-xl transition-all disabled:opacity-50 ${
                    wagerAmount === 20
                      ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-extrabold shadow-sm shadow-amber-500/20'
                      : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-amber-300'
                  }`}
                >
                  20 Birr
                </button>
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('preset', 100)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-2 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  100
                </button>
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('preset', 1000)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-2 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  1K
                </button>
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('half')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-2 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  1/2
                </button>
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('double')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs px-2 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  2X
                </button>
                <button
                  disabled={isAutoSpinActive || isSpinning}
                  onClick={() => setWagerPreset('max')}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-amber-400 font-bold text-xs px-2 py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  MAX
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-5 flex items-center gap-3">
            {autoSpin ? (
              isAutoSpinActive ? (
                <button
                  onClick={stopAutoSpin}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-lg tracking-wider uppercase transition-all shadow-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30 active:scale-98"
                >
                  <RotateCw className="w-5 h-5 animate-spin text-white" />
                  <span>STOP AUTO ({autoSpinCount} LEFT)</span>
                </button>
              ) : (
                <button
                  onClick={startAutoSpin}
                  disabled={isSpinning || autoSpinCount <= 0}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-lg tracking-wider uppercase transition-all shadow-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>START AUTO-SPIN ({autoSpinCount})</span>
                </button>
              )
            ) : (
              <button
                onClick={handleSpin}
                disabled={isSpinning || isAutoSpinActive}
                className={`w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-lg tracking-wider uppercase transition-all shadow-xl ${
                  isSpinning
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 active:scale-98'
                }`}
              >
                {isSpinning ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin text-slate-400" />
                    <span>SPINNING...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-slate-950" />
                    <span>SPIN NOW</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Provably Fair Hash Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2 overflow-hidden">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-mono truncate">
              Server Seed Hash: {lastResult?.serverSeedHash ? `${lastResult.serverSeedHash.substring(0, 20)}...` : '4f8a92...9e2a'}
            </span>
          </div>
          <button
            onClick={onOpenProvablyFair}
            className="text-amber-400 hover:underline font-semibold text-[11px]"
          >
            Verify Fairness Hash
          </button>
        </div>
      </div>

    </div>
  );
};
