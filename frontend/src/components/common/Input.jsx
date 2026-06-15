import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({ className, label, error, leftIcon, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex w-full rounded-xl border bg-white px-3 py-2.5 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:ring-offset-slate-900 dark:placeholder:text-slate-500",
            leftIcon ? "pl-10" : "",
            error ? "border-rose-500 focus-visible:ring-rose-500" : "border-slate-200 dark:border-slate-700",
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-rose-500 mt-1">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";
