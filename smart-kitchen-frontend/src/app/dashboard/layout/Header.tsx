"use client"

import { Bell, Settings, ChefHat, Moon, Sun, X, LogOut, User } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { clearAuthState, getCurrentUser } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export function Header() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    clearAuthState()
    router.push('/login')
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all">
              <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-mobile-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Kitchen
              </h1>
              <p className="text-mobile-xs sm:text-xs text-muted-foreground font-medium">AI-Powered</p>
            </div>
            <h1 className="text-mobile-base font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent sm:hidden">
              Kitchen
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px]">
              <Sun className="h-4 w-4 text-amber-500" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px] overflow-visible">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[11px] font-bold border-2 border-white dark:border-slate-900 shadow-lg rounded-full min-w-[20px] z-10 leading-none">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px]">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
      <div className="container flex h-14 sm:h-16 max-w-screen-2xl items-center px-3 sm:px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 rounded-2xl shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all cursor-pointer hover:scale-105 active:scale-95">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          
          {/* Desktop Logo */}
          <div className="hidden sm:block">
            <h1 className="text-mobile-lg sm:text-xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Smart Kitchen
            </h1>
            <p className="text-mobile-xs sm:text-xs text-muted-foreground font-medium">
              AI-Powered Management
            </p>
          </div>

          {/* Mobile Logo */}
          <h1 className="text-mobile-base sm:hidden font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Kitchen
          </h1>
        </div>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px] hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-purple-600" />
            )}
          </Button>

          {/* Notifications */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px] hover:scale-105 active:scale-95 overflow-visible"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-red-500 text-white text-[11px] font-bold border-2 border-white dark:border-slate-900 shadow-lg rounded-full min-w-[20px] z-10 leading-none">
                  3
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] p-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/10 dark:shadow-black/30">
              {/* Header */}
              <SheetHeader className="p-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-mobile-base sm:text-lg font-bold">
                    Notifications
                  </SheetTitle>
                  <Badge className="bg-muted text-muted-foreground border-0 text-mobile-xs sm:text-xs">
                    3 new
                  </Badge>
                </div>
              </SheetHeader>
              
              {/* Notifications List */}
              <div className="p-4 space-y-3 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <NotificationItem
                  title="Low Stock Alert"
                  description="Milk is running low (0.5L remaining)"
                  time="2 hours ago"
                  type="warning"
                />
                <NotificationItem
                  title="Expiry Warning"
                  description="Tomatoes will expire in 2 days"
                  time="5 hours ago"
                  type="error"
                />
                <NotificationItem
                  title="Shopping Reminder"
                  description="Monthly shopping due tomorrow"
                  time="1 day ago"
                  type="info"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 mt-auto">
                <Button variant="outline" className="w-full mobile-btn">
                  View All Notifications
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px] hover:scale-105 active:scale-95"
            aria-label="Settings"
            onClick={() => router.push('/dashboard/settings')}
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* User Menu - Desktop Only */}
          <div className="hidden sm:block">
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl hover:bg-muted/60 transition-all min-h-[36px] min-w-[36px] hover:scale-105 active:scale-95"
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-l border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/10 dark:shadow-black/30">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-mobile-lg">Account</SheetTitle>
                </SheetHeader>
                
                {/* User Info */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 rounded-2xl bg-muted/50 backdrop-blur-sm">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-mobile-sm sm:text-base font-medium truncate">{user?.name || 'User'}</p>
                      <p className="text-mobile-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Menu Items */}
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start mobile-btn rounded-2xl"
                      onClick={() => router.push('/dashboard/settings')}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Button>
                    
                    <Separator />
                    
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 mobile-btn rounded-2xl"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

function NotificationItem({ 
  title, 
  description, 
  time, 
  type 
}: { 
  title: string
  description: string
  time: string
  type: 'info' | 'warning' | 'error' 
}) {
  const config = {
    info: {
      bg: 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-900',
      dot: 'bg-blue-500',
      icon: '💡'
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900',
      dot: 'bg-amber-500',
      icon: '⚠️'
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900',
      dot: 'bg-red-500',
      icon: '🔴'
    },
  }

  const style = config[type]

  return (
    <div className={`p-4 rounded-2xl border ${style.bg} ${style.border} transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98]`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="text-xl shrink-0">{style.icon}</div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-mobile-sm sm:text-base text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {title}
            </h4>
            <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 ${style.dot} animate-pulse`} />
          </div>
          <p className="text-mobile-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
            {description}
          </p>
          <p className="text-mobile-xs text-muted-foreground font-medium">
            {time}
          </p>
        </div>
      </div>
    </div>
  )
}
