// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Enhanced font sizes for mobile-first premium experience
      fontSize: {
        // Mobile-optimized sizes (base mobile, then desktop)
        'mobile-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],      // 12px
        'mobile-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],  // 14px
        'mobile-base': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],     // 16px
        'mobile-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],  // 18px
        'mobile-xl': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],   // 20px
        'mobile-2xl': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],      // 24px
        'mobile-3xl': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 30px
        'mobile-4xl': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '800' }],   // 36px
        
        // Premium button text sizes
        'btn-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.025em' }],
        'btn-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '0.025em' }],
        'btn-base': ['1rem', { lineHeight: '1.5rem', fontWeight: '600', letterSpacing: '0.025em' }],
        'btn-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '0.025em' }],
      },
      
      // Enhanced spacing for mobile
      spacing: {
        'mobile-xs': '0.375rem',  // 6px
        'mobile-sm': '0.5rem',    // 8px
        'mobile-md': '0.75rem',   // 12px
        'mobile-lg': '1rem',      // 16px
        'mobile-xl': '1.25rem',   // 20px
        'mobile-2xl': '1.5rem',   // 24px
        'mobile-3xl': '2rem',     // 32px
      },
      
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "heartbeat": {
          "0%, 100%": { transform: "scale(1)" },
          "25%": { transform: "scale(1.1)" },
          "50%": { transform: "scale(1.05)" },
          "75%": { transform: "scale(1.15)" },
        },
        "shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "pulse-glow": {
          "0%, 100%": { 
            boxShadow: "0 0 20px rgba(244, 63, 94, 0.3)",
            transform: "scale(1)"
          },
          "50%": { 
            boxShadow: "0 0 30px rgba(244, 63, 94, 0.5)",
            transform: "scale(1.02)"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "heartbeat": "heartbeat 0.6s ease-in-out",
        "shimmer": "shimmer 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("tailwindcss-animate"),
    function ({ addUtilities }: { addUtilities: (utils: Record<string, unknown>) => void }) {
      addUtilities({
        ".focus-ring": {
          "@apply outline-none ring-2 ring-ring/70 ring-offset-2 ring-offset-background":
            {},
        },
      })
    },
  ],
}

export default config
