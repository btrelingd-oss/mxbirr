import React from 'react';

interface MXLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  variant?: 'red' | 'white';
}

export const MXLogoIcon: React.FC<{ className?: string; variant?: 'red' | 'white' }> = ({
  className = "w-10 h-10",
  variant = 'red'
}) => {
  const isRed = variant === 'red';

  return (
    <svg viewBox="0 0 160 110" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        {/* Rich red metallic gradient matching the brand image */}
        <linearGradient id="mx-red-gradient-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF3838" />
          <stop offset="35%" stopColor="#EF4444" />
          <stop offset="70%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>

        <linearGradient id="mx-red-cross-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B91C1C" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#FF4D4D" />
        </linearGradient>

        <linearGradient id="mx-white-silver" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#9CA3AF" />
        </linearGradient>

        <filter id="mx-brand-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={isRed ? "#DC2626" : "#FFFFFF"} floodOpacity={isRed ? "0.5" : "0.2"} />
        </filter>
      </defs>

      <g filter="url(#mx-brand-glow)">
        {/* Left vertical pillar of M */}
        <path
          d="M 14 18 L 36 18 L 36 92 L 14 92 Z"
          fill={isRed ? "url(#mx-red-gradient-brand)" : "url(#mx-white-silver)"}
        />

        {/* Center V of M into main diagonal of X */}
        <path
          d="M 36 18 L 68 68 L 100 18 L 122 18 L 148 92 L 126 92 L 92 42 L 68 88 L 36 38 V 18 Z"
          fill={isRed ? "url(#mx-red-gradient-brand)" : "url(#mx-white-silver)"}
        />

        {/* Crossing diagonal of X */}
        <path
          d="M 72 92 L 94 92 L 148 18 L 126 18 Z"
          fill={isRed ? "url(#mx-red-cross-gradient)" : "url(#mx-white-silver)"}
        />
      </g>
    </svg>
  );
};

export const MXLogo: React.FC<MXLogoProps> = ({ size = 'md', showText = true, variant = 'red' }) => {
  const containerSize = size === 'sm' ? 'w-9 h-9 p-1.5' : size === 'lg' ? 'w-16 h-16 p-2.5' : 'w-12 h-12 p-2';
  const iconSize = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-11 h-11' : 'w-8 h-8';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-3">
      {/* Sleek App Icon Squircle Badge */}
      <div className={`relative flex items-center justify-center ${containerSize} rounded-2xl bg-gradient-to-b from-slate-900 via-[#0b101d] to-[#060810] border border-slate-700/60 shadow-xl shadow-black/70 ring-1 ring-white/10 group hover:border-red-500/60 hover:shadow-red-950/30 transition-all duration-300 shrink-0 overflow-hidden`}>
        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl" />
        <MXLogoIcon className={`${iconSize} transform transition-transform group-hover:scale-105 duration-300`} variant={variant} />
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className={`${textSize} font-black tracking-wider font-mono leading-none bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent`}>
              MX
            </span>
            <span className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md tracking-wider uppercase shadow-md shadow-red-600/30 border border-red-400/30">
              PROVABLY FAIR
            </span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium hidden sm:block mt-0.5 tracking-tight">
            Real-Time Ethiopian Birr Platform
          </p>
        </div>
      )}
    </div>
  );
};

