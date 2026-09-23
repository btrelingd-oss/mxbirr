import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = true }) => {
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-2">
      {showText && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`${textSize} font-black tracking-wider font-mono leading-none bg-gradient-to-r from-white via-slate-100 to-amber-300 bg-clip-text text-transparent uppercase`}>
              YENE BIRR
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

export const MXLogo = BrandLogo;
export type MXLogoProps = BrandLogoProps;

