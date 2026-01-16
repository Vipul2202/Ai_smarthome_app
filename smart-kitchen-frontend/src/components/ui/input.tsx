import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
        "h-10 sm:h-11 w-full min-w-0 rounded-lg sm:rounded-xl border border-gray-200/60 dark:border-slate-700/60",
        "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 dark:shadow-black/20 sm:shadow-xl sm:shadow-slate-900/10 dark:sm:shadow-black/30",
        "px-3 sm:px-4 py-2 sm:py-3 text-mobile-sm sm:text-base md:text-lg font-medium tracking-wide",
        "transition-all duration-300 ease-out outline-none",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500",
        "hover:border-slate-300/80 dark:hover:border-slate-600/80",
        "focus:bg-white dark:focus:bg-slate-900",
        "focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 focus:shadow-xl",
        "text-slate-900 dark:text-slate-100",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:ring-destructive/30 dark:aria-invalid:ring-destructive/50 aria-invalid:border-destructive",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-mobile-sm file:font-semibold file:text-emerald-600",
        "min-h-[40px] sm:min-h-[44px]", // Ensure touch-friendly size
        className
      )}
      {...props}
    />
  );
}

export { Input };