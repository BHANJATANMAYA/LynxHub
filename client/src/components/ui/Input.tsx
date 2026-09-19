import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, prefixText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase text-[#1A1A1A]/70 tracking-wider">
            {label}
          </label>
        )}
        <div className="relative flex items-center rounded-2xl overflow-hidden bg-[#FAF9F5] border border-[#1A1A1A]/12 focus-within:border-[#034F46] focus-within:ring-2 focus-within:ring-[#034F46]/20 transition-all shadow-xs">
          {prefixText && (
            <span className="pl-3.5 pr-1 text-xs font-semibold text-[#034F46] select-none">
              {prefixText}
            </span>
          )}
          {leftIcon && <div className="pl-3.5 text-[#1A1A1A]/50 select-none">{leftIcon}</div>}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full bg-transparent px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              prefixText && 'pl-1',
              leftIcon && 'pl-2',
              rightIcon && 'pr-10',
              error && 'border-rose-500/80',
              className
            )}
            {...props}
          />
          {rightIcon && <div className="absolute right-3.5 text-[#1A1A1A]/50">{rightIcon}</div>}
        </div>
        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#1A1A1A]/50">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
