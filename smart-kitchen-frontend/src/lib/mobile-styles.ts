/**
 * Premium Mobile Typography & Styling Utilities
 * Consistent, accessible, and premium mobile-first design system
 */

// Typography Classes - Mobile-first, premium sizing
export const typography = {
  // Headings - Large, bold, premium
  heading: {
    h1: "text-mobile-4xl sm:text-5xl font-bold tracking-tight",
    h2: "text-mobile-3xl sm:text-4xl font-bold tracking-tight", 
    h3: "text-mobile-2xl sm:text-3xl font-bold tracking-tight",
    h4: "text-mobile-xl sm:text-2xl font-semibold tracking-tight",
    h5: "text-mobile-lg sm:text-xl font-semibold tracking-tight",
    h6: "text-mobile-base sm:text-lg font-semibold tracking-tight",
  },
  
  // Body text - Readable, comfortable
  body: {
    large: "text-mobile-lg sm:text-xl font-medium leading-relaxed",
    base: "text-mobile-base sm:text-lg font-medium leading-relaxed",
    small: "text-mobile-sm sm:text-base font-medium leading-relaxed",
    xs: "text-mobile-xs sm:text-sm font-medium leading-relaxed",
  },
  
  // UI text - Interface elements
  ui: {
    button: "text-mobile-base sm:text-lg font-semibold tracking-wide",
    buttonSm: "text-mobile-sm sm:text-base font-semibold tracking-wide",
    buttonLg: "text-mobile-lg sm:text-xl font-semibold tracking-wide",
    label: "text-mobile-sm sm:text-base font-medium tracking-wide",
    caption: "text-mobile-xs sm:text-sm font-medium text-muted-foreground",
    badge: "text-mobile-xs sm:text-sm font-semibold tracking-wide",
  },
  
  // Card text - Content in cards
  card: {
    title: "text-mobile-lg sm:text-xl font-semibold tracking-tight",
    subtitle: "text-mobile-base sm:text-lg font-medium",
    body: "text-mobile-sm sm:text-base font-medium leading-relaxed",
    caption: "text-mobile-xs sm:text-sm font-medium text-muted-foreground",
  },
  
  // Navigation text
  nav: {
    primary: "text-mobile-base sm:text-lg font-medium",
    secondary: "text-mobile-sm sm:text-base font-medium",
    breadcrumb: "text-mobile-xs sm:text-sm font-medium text-muted-foreground",
  }
} as const;

// Button Classes - Premium, accessible, touch-friendly
export const buttons = {
  // Size variants
  size: {
    xs: "btn-mobile-xs min-h-[32px] px-3 text-mobile-xs",
    sm: "btn-mobile-sm min-h-[40px] px-4 text-mobile-sm", 
    base: "btn-mobile-base min-h-[48px] px-5 text-mobile-base",
    lg: "btn-mobile-lg min-h-[56px] px-6 text-mobile-lg",
  },
  
  // Style variants
  variant: {
    primary: "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100",
    outline: "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    destructive: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg",
  },
  
  // Common combinations
  primary: {
    sm: "btn-mobile-sm bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    base: "btn-mobile-base bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    lg: "btn-mobile-lg bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
  },
  
  secondary: {
    sm: "btn-mobile-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
    base: "btn-mobile-base bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
    lg: "btn-mobile-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700",
  }
} as const;

// Input Classes - Premium, accessible
export const inputs = {
  size: {
    sm: "input-mobile-sm min-h-[40px] px-3 text-mobile-sm",
    base: "input-mobile-base min-h-[48px] px-4 text-mobile-base", 
    lg: "input-mobile-lg min-h-[56px] px-5 text-mobile-lg",
  },
  
  // Common input styling
  base: "input-mobile-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-200",
} as const;

// Card Classes - Premium, consistent
export const cards = {
  size: {
    sm: "card-mobile-sm p-4 rounded-xl shadow-lg",
    base: "card-mobile-base p-5 rounded-xl shadow-lg",
    lg: "card-mobile-lg p-6 rounded-2xl shadow-xl",
  },
  
  // Style variants
  variant: {
    default: "bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50",
    elevated: "bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 shadow-xl",
    glass: "bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200/30 dark:border-gray-800/30",
  },
  
  // Common combinations
  default: {
    sm: "card-mobile-sm bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50",
    base: "card-mobile-base bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50", 
    lg: "card-mobile-lg bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50",
  }
} as const;

// Layout Classes - Consistent spacing and structure
export const layout = {
  // Container classes
  container: {
    page: "page-container page-padding",
    section: "w-full max-w-4xl mx-auto px-4 sm:px-6",
    card: "w-full max-w-2xl mx-auto",
  },
  
  // Spacing classes
  spacing: {
    section: "section-spacing space-y-5 sm:space-y-6 lg:space-y-8",
    subsection: "subsection-spacing space-y-3 sm:space-y-4 lg:space-y-5", 
    tight: "space-y-2 sm:space-y-3",
    loose: "space-y-6 sm:space-y-8 lg:space-y-10",
  },
  
  // Grid classes
  grid: {
    tight: "grid-mobile-tight gap-3",
    normal: "grid-mobile-normal gap-4", 
    relaxed: "grid-mobile-relaxed gap-5",
    loose: "grid-mobile-loose gap-6",
  },
  
  // Flex classes
  flex: {
    tight: "flex-mobile-tight gap-2",
    normal: "flex-mobile-normal gap-3",
    relaxed: "flex-mobile-relaxed gap-4", 
    loose: "flex-mobile-loose gap-5",
  }
} as const;

// Status Classes - Consistent status indicators
export const status = {
  success: "mobile-status-success bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25",
  warning: "mobile-status-warning bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25",
  error: "mobile-status-error bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25",
  info: "mobile-status-info bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25",
} as const;

// Animation Classes - Smooth, premium animations
export const animations = {
  hover: "mobile-hover-lift transition-transform duration-200 ease-out hover:-translate-y-1",
  press: "active:scale-95 transition-transform duration-150 ease-out",
  fade: "mobile-fade-in opacity-0 animate-in fade-in duration-400",
  slide: "mobile-slide-up translate-y-4 animate-in slide-in-from-bottom duration-400",
} as const;

// Utility function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Helper function to get responsive text class
export function getResponsiveText(size: keyof typeof typography.body): string {
  return typography.body[size];
}

// Helper function to get button classes
export function getButtonClasses(size: keyof typeof buttons.size, variant: keyof typeof buttons.variant): string {
  return cn(buttons.size[size], buttons.variant[variant]);
}

// Helper function to get card classes  
export function getCardClasses(size: keyof typeof cards.size, variant: keyof typeof cards.variant): string {
  return cn(cards.size[size], cards.variant[variant]);
}

// Export all utilities as default
export default {
  typography,
  buttons,
  inputs,
  cards,
  layout,
  status,
  animations,
  cn,
  getResponsiveText,
  getButtonClasses,
  getCardClasses,
};