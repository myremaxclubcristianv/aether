import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const safeFallback = typeof fallback === 'string' && fallback.trim().length > 0 ? fallback : (alt || 'U');
  const initials = safeFallback
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl font-light',
  };

  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 font-medium text-zinc-300 select-none',
        sizeClasses[size],
        className
      )}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={alt}
          width={pixelSizes[size]}
          height={pixelSizes[size]}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="tracking-wider">{initials}</span>
      )}
    </div>
  );
};
