import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:pointer-events-none disabled:opacity-50',
          // Variants
          variant === 'primary' && 'bg-white text-black hover:bg-zinc-200 active:bg-zinc-300',
          variant === 'secondary' && 'bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 active:bg-zinc-800/80',
          variant === 'outline' && 'bg-transparent text-white border border-zinc-800 hover:bg-zinc-950 active:bg-zinc-900',
          variant === 'ghost' && 'bg-transparent text-zinc-400 hover:bg-zinc-950 hover:text-white',
          // Sizes
          size === 'sm' && 'h-8 px-3 text-xs rounded-sm',
          size === 'md' && 'h-10 px-4 text-sm rounded-md',
          size === 'lg' && 'h-12 px-6 text-sm rounded-md tracking-wide',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
