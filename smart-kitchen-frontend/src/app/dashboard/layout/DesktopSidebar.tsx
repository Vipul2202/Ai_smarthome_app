"use client"

import { Home, Package, ShoppingCart, Receipt, ChefHat, User, ChevronRight, Settings, LogOut } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { TabType } from "./MobileNav"
import { clearAuthState, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface User {
  id: string
  name?: string
  email?: string
}

interface DesktopSidebarProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

type NavItem = {
  id: TabType
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  gradient: string
  darkGradient: string
  glow: string
  hoverGlow: string
}

const navItems: NavItem[] = [
  {
    id: "home",
    icon: Home,
    label: "Dashboard",
    gradient: "from-emerald-500 to-teal-600",
    darkGradient: "dark:from-emerald-400 dark:to-teal-500",
    glow: "shadow-emerald-500/20",
    hoverGlow: "group-hover:shadow-emerald-500/30",
  },
  {
    id: "inventory",
    icon: Package,
    label: "Inventory",
    gradient: "from-blue-500 to-cyan-600",
    darkGradient: "dark:from-blue-400 dark:to-cyan-500",
    glow: "shadow-blue-500/20",
    hoverGlow: "group-hover:shadow-blue-500/30",
  },
  {
    id: "shopping",
    icon: ShoppingCart,
    label: "Shopping",
    gradient: "from-purple-500 to-pink-600",
    darkGradient: "dark:from-purple-400 dark:to-pink-500",
    glow: "shadow-purple-500/20",
    hoverGlow: "group-hover:shadow-purple-500/30",
  },
  {
    id: "expenses",
    icon: Receipt,
    label: "Expenses",
    gradient: "from-orange-500 to-amber-600",
    darkGradient: "dark:from-orange-400 dark:to-amber-500",
    glow: "shadow-orange-500/20",
    hoverGlow: "group-hover:shadow-orange-500/30",
  },
  {
    id: "recipes",
    icon: ChefHat,
    label: "Recipes",
    gradient: "from-rose-500 to-red-600",
    darkGradient: "dark:from-rose-400 dark:to-red-500",
    glow: "shadow-rose-500/20",
    hoverGlow: "group-hover:shadow-rose-500/30",
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

export function DesktopSidebar({ activeTab, onTabChange }: DesktopSidebarProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(() => getCurrentUser())

  // Listen for auth state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleLogout = () => {
    clearAuthState()
    setUser(null) // Update local state immediately
    router.push('/login')
  }

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 border-r border-border/50 bg-background/95 dark:bg-background/95 backdrop-blur-xl">
      <motion.div
        className="flex-1 px-3 py-6 space-y-1"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div className="px-3 py-2 mb-4" variants={item}>
          <h2 className="text-[9px] sm:text-xs font-semibold text-muted-foreground dark:text-muted-foreground uppercase tracking-wider">
            Navigation
          </h2>
        </motion.div>

        {navItems.map((navItem, index) => {
          const Icon = navItem.icon
          const isActive = activeTab === navItem.id

          return (
            <motion.button
              key={navItem.id}
              type="button"
              onClick={() => onTabChange(navItem.id)}
              variants={item}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
                isActive 
                  ? "text-foreground dark:text-foreground" 
                  : "text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-foreground",
              )}
            >
              {/* Active Background */}
              <AnimatePresence mode="wait">
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveTab"
                    className="absolute inset-0 rounded-xl bg-muted/60 dark:bg-muted/40"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      type: "tween",
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* Hover Glow */}
              <motion.div
                className={cn(
                  "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                  !isActive && "group-hover:opacity-100 dark:group-hover:opacity-80",
                )}
                style={{
                  background: `radial-gradient(circle at center, ${
                    index === 0
                      ? "rgb(16 185 129 / 0.08)"
                      : index === 1
                      ? "rgb(59 130 246 / 0.08)"
                      : index === 2
                      ? "rgb(168 85 247 / 0.08)"
                      : index === 3
                      ? "rgb(249 115 22 / 0.08)"
                      : "rgb(244 63 94 / 0.08)"
                  }, transparent 70%)`,
                }}
              />

              {/* Icon */}
              <div
                className={cn(
                  "relative p-2 rounded-lg transition-all duration-200",
                  isActive
                    ? `bg-gradient-to-br ${navItem.gradient} ${navItem.darkGradient} shadow-lg ${navItem.glow}`
                    : `bg-muted/40 group-hover:bg-muted/60 dark:bg-muted/30 dark:group-hover:bg-muted/50 ${navItem.hoverGlow}`,
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-all",
                    isActive 
                      ? "text-white drop-shadow-sm" 
                      : "text-muted-foreground dark:text-muted-foreground group-hover:text-foreground dark:group-hover:text-foreground",
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "relative font-medium text-xs sm:text-sm transition-all",
                  isActive && "font-semibold",
                )}
              >
                {navItem.label}
              </span>

              {/* Active Dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="desktopActiveDot"
                    className={cn(
                      "absolute right-3 w-1.5 h-1.5 rounded-full bg-gradient-to-br",
                      navItem.gradient,
                      navItem.darkGradient,
                    )}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.2, ease: "easeOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Chevron */}
              <ChevronRight className="absolute right-3 w-4 h-4 text-muted-foreground dark:text-muted-foreground opacity-0 group-hover:opacity-50 dark:group-hover:opacity-40 transition-opacity" />
            </motion.button>
          )
        })}
      </motion.div>

      {/* User Profile */}
      <motion.div
        className="p-4 border-t border-border/50 dark:border-border/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Sheet>
          <SheetTrigger asChild>
            <motion.div
              className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/20 dark:bg-muted/20 hover:bg-muted/40 dark:hover:bg-muted/30 transition-all cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 dark:from-emerald-400 dark:to-teal-500 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {user?.name?.charAt(0) || 'U'}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate">{user?.name || 'Kitchen User'}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground truncate">Manage Account</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader className="pb-4">
              <SheetTitle>Account Menu</SheetTitle>
            </SheetHeader>
            
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/30 dark:bg-muted/50">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate">{user?.name || 'Kitchen User'}</p>
                  <p className="text-[9px] sm:text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>

              <Separator />

              {/* Menu Items */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Settings className="mr-3 h-4 w-4" />
                  Settings
                </Button>
                
                <Separator />
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sign out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </motion.div>
    </aside>
  )
}
