import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  inverted?: boolean; // For dark backgrounds (white logo)
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  inverted = false,
  onClick
}) => {
  const sizeMap = {
    xs: { emblem: 'w-6 h-6', text: 'text-xs', sub: 'text-[9px]' },
    sm: { emblem: 'w-8 h-8', text: 'text-sm', sub: 'text-[10px]' },
    md: { emblem: 'w-9 h-9', text: 'text-base', sub: 'text-[11px]' },
    lg: { emblem: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { emblem: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Brand Emblem (The circular infinity ERA GADGETS logo) */}
      <div
        className={`relative ${currentSize.emblem} shrink-0 rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-95 flex items-center justify-center`}
      >
        <img
          src="/logo.png"
          alt="Era Gadgets Logo"
          className={`w-full h-full object-contain ${
            inverted ? 'brightness-0 invert' : ''
          }`}
          loading="eager"
        />
      </div>

      {/* Brand Name Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-bold tracking-tight ${
              inverted ? 'text-white' : 'text-neutral-950'
            } ${currentSize.text}`}
          >
            Era Gadgets
          </span>
          <span
            className={`font-semibold uppercase tracking-widest text-[9px] mt-0.5 ${
              inverted ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Certified Tech
          </span>
        </div>
      )}
    </div>
  );
};
