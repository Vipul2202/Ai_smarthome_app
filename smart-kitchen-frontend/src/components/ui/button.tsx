import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 sm:gap-3 whitespace-nowrap font-medium tracking-normal transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900 active:scale-95 hover:scale-105 overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 border border-white/20 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        destructive:
          "bg-gradient-to-r from-red-500 via-rose-500 to-pink-600 hover:from-red-600 hover:via-rose-600 hover:to-pink-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30 border border-white/20 backdrop-blur-sm before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:via-transparent before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300",
        outline:
          "border border-emerald-500/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm hover:shadow-md hover:border-emerald-600/80",
        secondary:
          "bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 border border-gray-200/60 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 backdrop-blur-xl shadow-sm hover:shadow-md",
        ghost:
          "hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 backdrop-blur-sm hover:shadow-sm",
        link: "text-emerald-600 dark:text-emerald-400 underline-offset-4 hover:underline shadow-none backdrop-blur-none",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg min-h-[32px] has-[>svg]:px-2",
        default: "h-9 px-4 text-sm rounded-lg min-h-[36px] has-[>svg]:px-3",
        lg: "h-10 px-5 text-sm rounded-lg min-h-[40px] has-[>svg]:px-4",
        xl: "h-11 px-6 text-base rounded-xl min-h-[44px] has-[>svg]:px-5",
        icon: "size-9 rounded-lg min-h-[36px] min-w-[36px]",
        "icon-sm": "size-8 rounded-lg min-h-[32px] min-w-[32px]",
        "icon-lg": "size-10 rounded-lg min-h-[40px] min-w-[40px]",
        "icon-xl": "size-11 rounded-xl min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }