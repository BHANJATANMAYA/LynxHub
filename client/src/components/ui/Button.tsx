import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'pill-primary' | 'pill-secondary' | 'pill-outline' | 'pill-pine';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'pill-lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

    const variants = {
      primary:
        'rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 active:scale-[0.98] focus:ring-indigo-500',
      secondary:
        'rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/60 active:scale-[0.98] focus:ring-slate-400',
      outline:
        'rounded-xl bg-transparent hover:bg-slate-800/50 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 active:scale-[0.98] focus:ring-slate-500',
      ghost:
        'rounded-xl bg-transparent hover:bg-slate-800/40 text-slate-300 hover:text-white active:scale-[0.98] focus:ring-slate-500',
      danger:
        'rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-600/20 active:scale-[0.98] focus:ring-rose-500',
      // Wispr Flow Signature Pill Styles
      'pill-primary':
        'rounded-full bg-[#034F46] hover:bg-[#023832] text-[#FFFFEB] shadow-md shadow-[#034F46]/20 hover:shadow-lg hover:shadow-[#034F46]/30 active:scale-[0.98] focus:ring-[#034F46]',
      'pill-secondary':
        'rounded-full bg-[#FFFFEB] hover:bg-[#F4F3DE] text-[#1A1A1A] border border-[#1A1A1A]/10 shadow-sm active:scale-[0.98] focus:ring-[#034F46]',
      'pill-outline':
        'rounded-full bg-transparent hover:bg-[#1A1A1A]/5 text-[#1A1A1A] border border-[#1A1A1A]/15 active:scale-[0.98] focus:ring-[#034F46]',
      'pill-pine':
        'rounded-full bg-[#062823] hover:bg-[#09352F] text-[#FFFFEB] border border-[#FFFFEB]/15 shadow-md shadow-[#062823]/30 active:scale-[0.98] focus:ring-[#FFFFEB]',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-2.5 gap-2.5',
      'pill-lg': 'text-sm sm:text-base px-7 py-3 gap-2.5 tracking-tight',
      icon: 'p-2 text-sm rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
