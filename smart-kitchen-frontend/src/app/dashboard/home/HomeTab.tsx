"use client"

import { motion } from 'framer-motion'
import { Package, AlertCircle, ShoppingCart, TrendingUp, Camera, ChefHat, Receipt, Bell, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from "next/navigation"
import { useInventory } from '@/hooks/use-inventory'
import { useQuery } from '@apollo/client'
import { GET_UPCOMING_REMINDERS, GET_EXPENSE_STATS, GET_SHOPPING_LISTS } from '@/lib/graphql/queries'
import { useCurrentKitchen } from '@/hooks/use-kitchen'
import { DashboardSkeleton } from '@/components/skeleton-loaders'
import { useHapticFeedback } from '@/lib/haptics'
import Image from 'next/image'

// Helper function to get emoji for item
function getEmojiForItem(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('rice')) return '🌾';
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('tomato')) return '🍅';
  if (lower.includes('onion')) return '🧅';
  if (lower.includes('potato')) return '🥔';
  if (lower.includes('carrot')) return '🥕';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('bread')) return '🍞';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('chicken')) return '🍗';
  if (lower.includes('fish')) return '🐟';
  if (lower.includes('oil')) return '🛢️';
  if (lower.includes('sugar')) return '🍬';
  if (lower.includes('salt')) return '🧂';
  return '🥫'; // Default
}

export function HomeTab() {
  const router = useRouter();
  const haptic = useHapticFeedback();
  const kitchenId = useCurrentKitchen();
  const { items, lowStockItems, expiringItems, stats, loading } = useInventory();
  
  const { data: remindersData } = useQuery(GET_UPCOMING_REMINDERS, {
    variables: { kitchenId: kitchenId || '', days: 7 },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { data: expenseData, loading: expenseLoading } = useQuery(GET_EXPENSE_STATS, {
    variables: { kitchenId: kitchenId || '', period: 'month' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { data: shoppingData, loading: shoppingLoading } = useQuery(GET_SHOPPING_LISTS, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const reminders = remindersData?.upcomingReminders || [];
  const alertItems = [...lowStockItems, ...expiringItems];
  const expenseStats = expenseData?.expenseStats || { totalAmount: 0, change: 0 };
  const shoppingLists = shoppingData?.shoppingLists || [];
  
  const pendingShoppingItems = shoppingLists.reduce((total: number, list: { items?: { isPurchased: boolean }[] }) => {
    return total + (list.items?.filter((item) => !item.isPurchased).length || 0);
  }, 0);

  const totalShoppingValue = shoppingLists.reduce((total: number, list: { items?: { price?: number; quantity?: number }[] }) => {
    return total + (list.items?.reduce((listTotal: number, item) => {
      return listTotal + (item.price || 0) * (item.quantity || 1);
    }, 0) || 0);
  }, 0);

  // Show skeleton while loading initial data
  if (loading && !items.length) {
    return <DashboardSkeleton />;
  }


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
    >
      {/* Welcome Banner */}
      <div className="w-full overflow-hidden relative rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-600 dark:from-purple-600 dark:via-pink-600 dark:to-blue-700" />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000" />
        </div>
        
        <div className="relative p-5 sm:p-7 md:p-8">
          <div className="flex items-center justify-between gap-4 sm:gap-5">
            <div className="flex-1 min-w-0">
              <h1 className="text-mobile-2xl sm:text-4xl md:text-5xl font-bold text-white mb-2 sm:mb-3 mobile-text-shadow">
                Welcome Back! 👋
              </h1>
              <p className="text-mobile-base sm:text-lg md:text-xl text-purple-100 leading-relaxed mobile-text-shadow">
                Your kitchen is running smoothly. Here's what's happening today.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                size="default"
                onClick={() => {
                  haptic.light()
                  router.push('/dashboard/inventory/scan')
                }}
                className="bg-white/30 backdrop-blur-sm border-white/40 text-white hover:bg-white/40 shadow-xl hover:shadow-2xl h-12 sm:h-14 px-4 sm:px-6"
              >
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                <span className="text-mobile-sm sm:text-base font-semibold">Scan</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            icon={<Package className="w-6 h-6 sm:w-7 sm:h-7" />}
            title="Total Items"
            value={loading ? "..." : stats.total.toString()}
            trend="+2 today"
            color="indigo"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            icon={<AlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />}
            title="Low Stock"
            value={loading ? "..." : stats.lowStock.toString()}
            trend="Needs attention"
            color="amber"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            icon={<ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />}
            title="Shopping"
            value={shoppingLoading ? "..." : `₹${(totalShoppingValue || 0).toFixed(0)}`}
            trend={shoppingLoading ? "Loading..." : `${pendingShoppingItems} items pending`}
            color="emerald"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <StatCard
            icon={<TrendingUp className="w-6 h-6 sm:w-7 sm:h-7" />}
            title="This Month"
            value={expenseLoading ? "..." : `₹${(expenseStats.totalAmount || 0).toFixed(0)}`}
            trend={expenseLoading ? "Loading..." : `${(expenseStats.change || 0) > 0 ? '+' : ''}${(expenseStats.change || 0)}% vs last month`}
            color="purple"
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-mobile-lg sm:text-xl font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <QuickActionCard
            icon={<Camera className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Scan Item"
            description="Add to inventory"
            gradient="from-emerald-500 to-green-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/inventory/scan");
            }}
          />
          <QuickActionCard
            icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Shopping"
            description="Manage lists"
            gradient="from-blue-500 to-indigo-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/shopping");
            }}
          />
          <QuickActionCard
            icon={<ChefHat className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="AI Recipes"
            description="Get suggestions"
            gradient="from-orange-500 to-red-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/recipes/generate");
            }}
          />
          <QuickActionCard
            icon={<Receipt className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Add Expense"
            description="Track spending"
            gradient="from-purple-500 to-pink-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/expenses/add");
            }}
          />
          <QuickActionCard
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Analytics"
            description="Usage insights"
            gradient="from-blue-500 to-cyan-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/analytics");
            }}
          />
          <QuickActionCard
            icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Usage Logs"
            description="Track consumption"
            gradient="from-indigo-500 to-purple-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/logs");
            }}
          />
          <QuickActionCard
            icon={<Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Festival Planner"
            description="Diwali · Holi · Eid"
            gradient="from-pink-500 to-purple-600"
            onClick={() => {
              haptic.medium();
              router.push("/dashboard/festival");
            }}
          />
          <QuickActionCard
            icon={<TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />}
            title="Price Compare"
            description="Best deals nearby"
            gradient="from-green-500 to-emerald-600"
            onClick={() => {
              haptic.light();
              router.push("/dashboard/prices");
            }}
          />
        </div>
      </div>

      {/* Alerts & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Needs Attention */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm md:text-base lg:text-lg mobile-text-sm">
                <div className="p-1 sm:p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md sm:rounded-lg">
                  <AlertCircle className="w-3 h-3 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-semibold">Needs Attention</span>
              </CardTitle>
              {lowStockItems.length > 0 && (
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-0 text-xs mobile-text-xs px-1.5 py-0.5">
                  {lowStockItems.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1.5 sm:space-y-3">
            {alertItems.slice(0, 4).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AlertCard item={item} />
              </motion.div>
            ))}
            {alertItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-sm mobile-text-sm font-medium mb-1">All items well stocked!</p>
                <p className="text-xs mobile-text-xs text-muted-foreground">No action needed right now</p>
              </div>
            )}
            {alertItems.length > 4 && (
              <Button variant="ghost" className="w-full mt-2 text-sm mobile-text-sm group">
                View all {alertItems.length} items
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Reminders */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-1.5 text-sm md:text-base lg:text-lg mobile-text-sm">
                <div className="p-1 sm:p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md sm:rounded-lg">
                  <Bell className="w-3 h-3 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-semibold">Upcoming Reminders</span>
              </CardTitle>
              {reminders.length > 0 && (
                <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-0 text-xs mobile-text-xs px-1.5 py-0.5">
                  {reminders.length}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                haptic.medium();
                // TODO: Call smart reminders generation API
                router.push("/dashboard/reminders");
              }}
              className="w-full mt-2 sm:mt-3 h-10 sm:h-11 text-xs sm:text-sm border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 shadow-lg"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Generate Smart Reminders
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            {reminders.map((reminder: {
              id: string;
              type: string;
              title: string;
              description?: string;
              scheduledAt: string;
              isRecurring: boolean;
              isCompleted: boolean;
              createdAt: string;
            }, index: number) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ReminderCard reminder={reminder} />
              </motion.div>
            ))}
            {reminders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center shadow-lg">
                  <Bell className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-base font-semibold mb-2 text-foreground">No reminders set</p>
                <p className="text-sm text-muted-foreground max-w-xs">Create reminders to stay organized and never miss important tasks</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

function StatCard({ 
  icon, 
  title, 
  value, 
  trend, 
  color 
}: { 
  icon: React.ReactNode
  title: string
  value: string
  trend: string
  color: 'indigo' | 'amber' | 'emerald' | 'purple'
}) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-500/30',
    amber: 'from-amber-500 to-orange-600 shadow-amber-500/30',
    emerald: 'from-emerald-500 to-green-600 shadow-emerald-500/30',
    purple: 'from-purple-500 to-pink-600 shadow-purple-500/30',
  } as const

  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
      <CardContent className="p-4 sm:p-5 md:p-6">
        <div className={`inline-flex p-2 sm:p-3 md:p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-md mb-3 sm:mb-4`}>
          <div className="text-white">{icon}</div>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <p className="text-mobile-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 truncate font-medium">{title}</p>
          <p className="text-mobile-lg sm:text-xl md:text-2xl font-bold truncate text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-mobile-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 truncate leading-relaxed">{trend}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickActionCard({ 
  icon, 
  title,
  description,
  gradient,
  onClick 
}: { 
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
  onClick?: () => void
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-2.5 sm:p-5 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all text-left haptic-light shadow-lg backdrop-blur-xl"
    >
      <div className={`inline-flex p-1.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br ${gradient} shadow-lg mb-2 sm:mb-3`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="font-semibold text-xs md:text-sm lg:text-base mobile-text-xs mb-0.5 truncate leading-tight text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs mobile-text-xs text-gray-600 dark:text-gray-400 truncate leading-tight">{description}</p>
    </motion.button>
  )
}

interface AlertItem {
  id: string;
  name: string;
  category: string;
  totalQuantity: number;
  threshold?: number;
  status: string;
  location?: string;
  imageUrl?: string;
  defaultUnit?: string;
  nextExpiry?: string;
  batches?: Array<{
    id: string;
    quantity: number;
    unit: string;
    expiryDate?: string;
  }>;
}

function AlertCard({ item }: { item: AlertItem }) {
  const statusConfig = {
    LOW: {
      bg: 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
      label: 'Low Stock'
    },
    EXPIRING: {
      bg: 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
      label: 'Expiring Soon'
    },
    EXPIRED: {
      bg: 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      badge: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
      label: 'Expired'
    },
  } as const

  const status = item.status || 'LOW'
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.LOW

  return (
    <motion.div 
      className={`flex items-center justify-between p-2 sm:p-4 rounded-lg sm:rounded-xl border ${config.bg} ${config.border} transition-all cursor-pointer haptic-light`}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-1.5 sm:gap-3 flex-1 min-w-0">
        <div className="text-lg sm:text-3xl shrink-0 group-hover:scale-110 transition-transform">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} width={24} height={24} className="w-6 h-6 sm:w-8 sm:h-8 rounded" />
          ) : (
            <span className="text-base md:text-xl lg:text-2xl mobile-text-base">{getEmojiForItem(item.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs md:text-sm mobile-text-xs truncate text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="text-xs mobile-text-xs text-gray-600 dark:text-gray-400">{config.label}</p>
        </div>
      </div>
      <Badge className={`${config.badge} border-0 shrink-0 ml-1.5 sm:ml-2 font-semibold text-xs mobile-text-xs px-1.5 py-0.5`}>
        {item.totalQuantity} {item.defaultUnit || 'units'}
      </Badge>
    </motion.div>
  )
}

function ReminderCard({ reminder }: { 
  reminder: {
    id: string;
    type: string;
    title: string;
    description?: string;
    scheduledAt: string;
    isRecurring: boolean;
    isCompleted: boolean;
    createdAt: string;
  }
}) {
  return (
    <motion.div 
      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 hover:bg-indigo-100 dark:hover:bg-indigo-950/30 transition-all cursor-pointer haptic-light"
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shrink-0 shadow-lg shadow-indigo-500/30">
        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-xs md:text-sm mobile-text-xs truncate">{reminder.title}</p>
        <p className="text-xs mobile-text-xs text-muted-foreground truncate">
          {new Date(reminder.scheduledAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  )
}
