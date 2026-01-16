/**
 * Premium Mobile-First Design System
 * Consolidated utilities for consistent mobile app experience
 */

// ============================================
// TYPOGRAPHY SYSTEM - Mobile-First
// ============================================

export const typography = {
  // Headings - Premium, readable sizes
  heading: {
    h1: "text-mobile-4xl sm:text-5xl md:text-6xl font-bold tracking-tight",
    h2: "text-mobile-3xl sm:text-4xl md:text-5xl font-bold tracking-tight", 
    h3: "text-mobile-2xl sm:text-3xl md:text-4xl font-bold tracking-tight",
    h4: "text-mobile-xl sm:text-2xl md:text-3xl font-semibold tracking-tight",
    h5: "text-mobile-lg sm:text-xl md:text-2xl font-semibold tracking-tight",
    h6: "text-mobile-base sm:text-lg md:text-xl font-semibold tracking-tight",
  },
  
  // Body text - Readable, comfortable (minimum 14px on mobile)
  body: {
    large: "text-mobile-lg sm:text-xl md:text-2xl font-medium leading-relaxed",
    base: "text-mobile-base sm:text-lg md:text-xl font-medium leading-relaxed",
    small: "text-mobile-sm sm:text-base md:text-lg font-medium leading-relaxed",
    caption: "text-mobile-xs sm:text-sm md:text-base font-medium leading-relaxed text-muted-foreground",
  },
  
  // UI elements - Interface text
  ui: {
    button: "text-mobile-base sm:text-lg md:text-xl font-semibold tracking-wide",
    buttonSm: "text-mobile-sm sm:text-base md:text-lg font-semibold tracking-wide",
    buttonLg: "text-mobile-lg sm:text-xl md:text-2xl font-semibold tracking-wide",
    label: "text-mobile-sm sm:text-base md:text-lg font-medium tracking-wide",
    input: "text-mobile-base sm:text-lg md:text-xl font-medium",
    badge: "text-mobile-xs sm:text-sm md:text-base font-semibold tracking-wide",
  },
  
  // Card content
  card: {
    title: "text-mobile-lg sm:text-xl md:text-2xl font-semibold tracking-tight",
    subtitle: "text-mobile-base sm:text-lg md:text-xl font-medium",
    body: "text-mobile-sm sm:text-base md:text-lg font-medium leading-relaxed",
    caption: "text-mobile-xs sm:text-sm md:text-base font-medium text-muted-foreground",
  },
  
  // Navigation
  nav: {
    primary: "text-mobile-base sm:text-lg md:text-xl font-medium",
    secondary: "text-mobile-sm sm:text-base md:text-lg font-medium",
    breadcrumb: "text-mobile-xs sm:text-sm md:text-base font-medium text-muted-foreground",
    tab: "text-mobile-sm sm:text-base md:text-lg font-medium",
  }
} as const;

// ============================================
// SPACING SYSTEM - Consistent Scale
// ============================================

export const spacing = {
  // Standard spacing scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
  gap: {
    xs: "gap-1", // 4px
    sm: "gap-2", // 8px
    base: "gap-3", // 12px
    md: "gap-4", // 16px
    lg: "gap-5", // 20px
    xl: "gap-6", // 24px
    "2xl": "gap-8", // 32px
    "3xl": "gap-10", // 40px
    "4xl": "gap-12", // 48px
  },
  
  // Responsive gaps
  responsive: {
    tight: "gap-2 sm:gap-3 md:gap-4", // 8px -> 12px -> 16px
    normal: "gap-3 sm:gap-4 md:gap-5", // 12px -> 16px -> 20px
    relaxed: "gap-4 sm:gap-5 md:gap-6", // 16px -> 20px -> 24px
    loose: "gap-5 sm:gap-6 md:gap-8", // 20px -> 24px -> 32px
  },
  
  // Padding scale
  padding: {
    xs: "p-2", // 8px
    sm: "p-3", // 12px
    base: "p-4", // 16px
    md: "p-5", // 20px
    lg: "p-6", // 24px
    xl: "p-8", // 32px
  },
  
  // Responsive padding
  paddingResponsive: {
    tight: "p-3 sm:p-4 md:p-5", // 12px -> 16px -> 20px
    normal: "p-4 sm:p-5 md:p-6", // 16px -> 20px -> 24px
    relaxed: "p-5 sm:p-6 md:p-8", // 20px -> 24px -> 32px
  }
} as const;

// ============================================
// BUTTON SYSTEM - Touch-Friendly
// ============================================

export const buttons = {
  // Size variants - All meet 44x44px minimum touch target
  size: {
    sm: "h-11 px-4 text-mobile-sm sm:text-base md:text-lg min-h-[44px] min-w-[44px]", // 44px height
    base: "h-12 px-5 text-mobile-base sm:text-lg md:text-xl min-h-[48px] min-w-[48px]", // 48px height
    lg: "h-14 px-6 text-mobile-lg sm:text-xl md:text-2xl min-h-[56px] min-w-[56px]", // 56px height
    xl: "h-16 px-8 text-mobile-xl sm:text-2xl md:text-3xl min-h-[64px] min-w-[64px]", // 64px height
  },
  
  // Icon button sizes
  icon: {
    sm: "size-11 min-h-[44px] min-w-[44px]", // 44px - meets minimum
    base: "size-12 min-h-[48px] min-w-[48px]", // 48px
    lg: "size-14 min-h-[56px] min-w-[56px]", // 56px
    xl: "size-16 min-h-[64px] min-w-[64px]", // 64px
  },
  
  // Style variants
  variant: {
    primary: "bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 shadow-sm hover:shadow-md",
    outline: "border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-white dark:bg-gray-900",
    ghost: "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
    destructive: "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl",
  },
  
  // Common combinations - Slim and elegant
  primary: {
    sm: "h-8 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-700 text-white shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 text-xs font-medium tracking-normal min-h-[32px] border border-white/20 backdrop-blur-sm rounded-lg",
    base: "h-9 px-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-700 text-white shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 text-sm font-medium tracking-normal min-h-[36px] border border-white/20 backdrop-blur-sm rounded-xl",
    lg: "h-10 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 hover:from-emerald-600 hover:via-teal-600 hover:to-blue-700 text-white shadow-md shadow-emerald-500/15 hover:shadow-emerald-500/25 text-sm font-medium tracking-normal min-h-[40px] border border-white/20 backdrop-blur-sm rounded-xl",
  }
} as const;

// ============================================
// INPUT SYSTEM - Touch-Friendly Forms
// ============================================

export const inputs = {
  // Input sizes - All touch-friendly
  size: {
    sm: "h-11 px-4 text-mobile-sm sm:text-base md:text-lg min-h-[44px]",
    base: "h-12 px-4 text-mobile-base sm:text-lg md:text-xl min-h-[48px]",
    lg: "h-14 px-5 text-mobile-lg sm:text-xl md:text-2xl min-h-[56px]",
  },
  
  // Base input styles
  base: "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-lg shadow-sm transition-all duration-200 ease-out outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 hover:border-gray-300 dark:hover:border-gray-600 focus:bg-white dark:focus:bg-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-gray-900 dark:text-gray-100 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  
  // Textarea
  textarea: "min-h-[80px] sm:min-h-[96px] md:min-h-[112px] p-4 text-mobile-base sm:text-lg md:text-xl resize-none",
  
  // Select
  select: "h-12 px-4 text-mobile-base sm:text-lg md:text-xl min-h-[48px]",
} as const;

// ============================================
// CARD SYSTEM - Premium Layout
// ============================================

export const cards = {
  // Card sizes
  size: {
    sm: "p-4 sm:p-5 md:p-6", // 16px -> 20px -> 24px
    base: "p-5 sm:p-6 md:p-8", // 20px -> 24px -> 32px
    lg: "p-6 sm:p-8 md:p-10", // 24px -> 32px -> 40px
  },
  
  // Card variants
  variant: {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200",
    premium: "bg-white dark:bg-gray-900 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
    gradient: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300",
  },
  
  // Card header/content spacing
  header: "px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6",
  content: "px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6",
  footer: "px-5 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5",
} as const;

// ============================================
// LAYOUT SYSTEM - Page Structure
// ============================================

export const layout = {
  // Container sizes
  container: {
    sm: "max-w-sm mx-auto", // 384px
    md: "max-w-md mx-auto", // 448px
    lg: "max-w-lg mx-auto", // 512px
    xl: "max-w-xl mx-auto", // 576px
    "2xl": "max-w-2xl mx-auto", // 672px
    "4xl": "max-w-4xl mx-auto", // 896px
    "7xl": "max-w-7xl mx-auto", // 1280px
    full: "w-full max-w-7xl mx-auto",
  },
  
  // Page padding
  padding: {
    page: "px-4 sm:px-6 md:px-8", // Consistent page padding
    section: "py-4 sm:py-6 md:py-8", // Section spacing
    mobile: "px-3 sm:px-4 md:px-6", // Tighter mobile padding
  },
  
  // Safe areas
  safe: {
    bottom: "pb-safe", // iOS safe area
    mobileBtm: "pb-20 sm:pb-6 md:pb-8", // Mobile bottom nav space
  },
  
  // Grid layouts
  grid: {
    mobile: "grid grid-cols-1 gap-3 sm:gap-4 md:gap-5",
    tablet: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5",
    desktop: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5",
    stats: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5",
  }
} as const;

// ============================================
// ANIMATION SYSTEM - Smooth Interactions
// ============================================

export const animations = {
  // Hover effects
  hover: {
    scale: "hover:scale-[1.02] active:scale-95 transition-transform duration-200",
    shadow: "hover:shadow-lg transition-shadow duration-200",
    lift: "hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200",
  },
  
  // Page transitions
  page: {
    fadeIn: "animate-in fade-in-0 duration-300",
    slideUp: "animate-in slide-in-from-bottom-4 duration-300",
    slideDown: "animate-in slide-in-from-top-4 duration-300",
  },
  
  // Loading states
  loading: {
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
  }
} as const;

// ============================================
// UTILITY FUNCTIONS
// ============================================

export const utils = {
  // Combine classes safely
  cn: (...classes: (string | undefined | null | false)[]) => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get responsive text size
  getTextSize: (size: keyof typeof typography.body) => typography.body[size],
  
  // Get responsive button
  getButton: (size: keyof typeof buttons.primary, variant: 'primary' | 'secondary' = 'primary') => {
    if (variant === 'primary') return buttons.primary[size];
    return `${buttons.size[size]} ${buttons.variant.secondary}`;
  },
  
  // Get responsive card
  getCard: (size: keyof typeof cards.size, variant: keyof typeof cards.variant = 'default') => {
    return `${cards.size[size]} ${cards.variant[variant]}`;
  }
} as const;

// Export everything
export default {
  typography,
  spacing,
  buttons,
  inputs,
  cards,
  layout,
  animations,
  utils
};