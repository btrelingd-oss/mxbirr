import React from 'react';

interface WinnerAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showBadge?: boolean;
}

export const WinnerAvatar: React.FC<WinnerAvatarProps> = ({
  size = 'md',
  className = '',
  showBadge = true,
}) => {
  const sizeMap = {
    sm: {
      container: 'w-7 h-7',
      icon: 'w-4 h-4',
      badge: 'w-2.5 h-2.5 text-[6px]',
    },
    md: {
      container: 'w-10 h-10',
      icon: 'w-6 h-6',
      badge: 'w-3.5 h-3.5 text-[8px]',
    },
    lg: {
      container: 'w-14 h-14',
      icon: 'w-8 h-8',
      badge: 'w-4.5 h-4.5 text-[9px]',
    },
    xl: {
      container: 'w-20 h-20',
      icon: 'w-12 h-12',
      badge: 'w-6 h-6 text-[11px]',
    },
  };

  const current = sizeMap[size];

  return (
    <div className={`relative shrink-0 ${className}`}>
      {/* Yellow Circular Avatar Background */}
      <div className={`${current.container} rounded-full bg-[#f59e0b] hover:bg-[#fbbf24] flex items-center justify-center overflow-hidden shadow-md shadow-amber-500/20 transition-colors`}>
        {/* Solid Black Silhouette Person / User Profile */}
        <svg
          viewBox="0 0 24 24"
          className={`${current.icon} fill-[#050914] text-[#050914]`}
        >
          {/* Head & Torso Silhouette */}
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      </div>

      {/* Verified Green Circle Badge with Checkmark */}
      {showBadge && (
        <span className={`absolute -bottom-0.5 -right-0.5 ${current.badge} rounded-full bg-[#10b981] border-2 border-[#050914] flex items-center justify-center font-black text-[#050914] shadow-sm leading-none`}>
          ✓
        </span>
      )}
    </div>
  );
};
