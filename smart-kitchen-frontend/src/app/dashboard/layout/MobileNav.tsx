"use client"

import { Home, Package, ShoppingCart, Receipt, ChefHat } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useHapticFeedback } from '@/lib/haptics'

export type TabType = 'home' | 'inventory' | 'shopping' | 'expenses' | 'recipes'

interface MobileNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

const navItems = [
  { id: 'home' as const, icon: Home, label: 'Home' },
  { id: 'inventory' as const, icon: Package, label: 'Inventory' },
  { id: 'shopping' as const, icon: ShoppingCart, label: 'Shop' },
  { id: 'expenses' as const, icon: Receipt, label: 'Money' },
  { id: 'recipes' as const, icon: ChefHat, label: 'Recipes' },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const haptic = useHapticFeedback()
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/60 dark:border-slate-700/60 shadow-2xl lg:hidden">
      <div className="flex h-16 items-center justify-around px-2 sm:px-4 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                haptic.selection()
                onTabChange(item.id)
              }}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 min-w-[3rem] sm:min-w-[3.5rem] rounded-xl transition-all duration-300 touch-manipulation min-h-[44px]",
                "active:scale-95 hover:scale-105",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "w-5 h-5 sm:w-5 sm:h-5 transition-all duration-300",
                    isActive && "scale-110 drop-shadow-lg"
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <motion.div
                    layoutId="activeTabBg"
                    className="absolute -inset-2 sm:-inset-3 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-xl -z-10 shadow-lg shadow-emerald-500/20"
                    transition={{ 
                      type: "spring", 
                      bounce: 0.2, 
                      duration: 0.6 
                    }}
                  />
                )}
              </div>
              
              <span 
                className={cn(
                  "text-xs sm:text-xs font-medium transition-all duration-300 truncate max-w-full leading-tight",
                  isActive && "text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
                )}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full shadow-lg shadow-emerald-500/50"
                  transition={{ 
                    type: "spring", 
                    bounce: 0.2, 
                    duration: 0.6 
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
