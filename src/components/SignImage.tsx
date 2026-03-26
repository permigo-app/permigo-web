'use client';

import { useState } from 'react';
import { SVG_SIGNS } from './signs';

interface SignImageProps {
  code: string;
  size?: number;
  className?: string;
}

export default function SignImage({ code, size = 80, className = '' }: SignImageProps) {
  const [error, setError] = useState(false);

  // Check if it's an inline SVG sign (feux, marquages, témoins)
  const SvgComponent = SVG_SIGNS[code];
  if (SvgComponent) {
    return <span className={className}>{SvgComponent({ size })}</span>;
  }

  if (error || !code) {
    return (
      <div
        className={`sign-placeholder ${className}`}
        style={{ width: size, height: size }}
      >
        {code || '?'}
      </div>
    );
  }

  // File-based sign (SVG from Wikimedia, fallback to PNG)
  return (
    <img
      src={`/signs/${code}.svg`}
      alt={`Panneau ${code}`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={(e) => {
        const img = e.currentTarget;
        if (img.src.endsWith('.svg')) {
          img.src = `/signs/${code}.png`;
        } else {
          setError(true);
        }
      }}
    />
  );
}
