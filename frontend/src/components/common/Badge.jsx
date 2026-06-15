import React from 'react';
import { cn } from '../../utils/cn';

const variantStyles = {
  default: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
  primary: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  outline: "text-slate-950 border border-slate-200 dark:text-slate-50 dark:border-slate-800"
};

export function Badge({ className, variant = "default", children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-slate-800",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
