"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar,
  AlertTriangle,
  Zap,
  Target,
  Trash2,
  DollarSign,
  Package,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useUsageLogs } from '@/hooks/use-usage-logs'
import { useExpenses } from '@/hooks/use-expenses'
import { useInventory } from '@/hooks/use-inventory'

type TimePeriod = '7d' | '30d' | '90d' | '1y'

const timePeriods = [
  { id: '7d' as TimePeriod, label: 'Last 7 Days', days: 7 },
  { id: '30d' as TimePeriod, label: 'Last 30 Days', days: 30 },
  { id: '90d' as TimePeriod, label: 'Last 3 Months', days: 90 },
  { id: '1y' as TimePeriod, label: 'Last Year', days: 365 },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('30d')
  
  const { logs, getWasteAnalytics, predictRunOut } = useUsageLogs()
  const { expenses, stats: expenseStats } = useExpenses()
  const { items } = useInventory()

  const currentPeriod = timePeriods.find(p => p.id === selectedPeriod)!

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!logs || !expenses || !items) return null

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - currentPeriod.days)

    // Consumption analytics
    const recentLogs = logs.filter((log: any) => new Date(log.date) >= cutoffDate)
    const consumedLogs = recentLogs.filter((log: any) => log.type === 'CONSUMED' || log.type === 'COOKED')
    const wastedLogs = recentLogs.filter((log: any) => log.type === 'WASTED')

    const totalConsumed = consumedLogs.reduce((sum: number, log: any) => sum + log.quantity, 0)
    const totalWasted = wastedLogs.reduce((sum: number, log: any) => sum + log.quantity, 0)
    const wastePercentage = totalConsumed > 0 ? (totalWasted / (totalConsumed + totalWasted)) * 100 : 0

    // Expense analytics
    const recentExpenses = expenses.filter((exp: any) => new Date(exp.date) >= cutoffDate)
    const totalSpent = recentExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0)
    const avgDailySpend = totalSpent / currentPeriod.days

    // Category breakdown
    const categorySpend: Record<string, number> = {}
    recentExpenses.forEach((exp: any) => {
      const category = exp.category || 'Other'
      categorySpend[category] = (categorySpend[category] || 0) + exp.amount
    })

    // Low stock predictions
    const lowStockPredictions = items
      .map((item: any) => {
        const totalQuantity = item.batches?.reduce((sum: number, batch: any) => sum + batch.quantity, 0) || 0
        const prediction = predictRunOut(item.id, totalQuantity)
        return prediction ? { item, ...prediction } : null
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5)

    // Top consumed items
    const itemConsumption: Record<string, { name: string; quantity: number; category: string }> = {}
    consumedLogs.forEach((log: any) => {
      const itemId = log.item?.id
      if (itemId) {
        if (!itemConsumption[itemId]) {
          itemConsumption[itemId] = {
            name: log.item.name,
            quantity: 0,
            category: log.item.category
          }
        }
        itemConsumption[itemId].quantity += log.quantity
      }
    })

    const topConsumed = Object.values(itemConsumption)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      totalConsumed,
      totalWasted,
      wastePercentage,
      totalSpent,
      avgDailySpend,
      categorySpend,
      lowStockPredictions,
      topConsumed,
      logsCount: recentLogs.length,
      expensesCount: recentExpenses.length
    }
  }, [logs, expenses, items, currentPeriod.days, predictRunOut])

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing page-container page-padding"
    >
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            haptic.light()
            router.back()
          }}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Kitchen Analytics
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Insights into your consumption patterns and spending</p>
        </div>
        <Select value={selectedPeriod} onValueChange={(value: TimePeriod) => setSelectedPeriod(value)}>
          <SelectTrigger className="w-32 sm:w-48 h-8 sm:h-10 text-[10px] sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {timePeriods.map(period => (
              <SelectItem key={period.id} value={period.id} className="text-[10px] sm:text-sm">
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-green-500 flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-xl font-bold">{analytics.totalConsumed.toFixed(1)}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">Items Used</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-500 flex items-center justify-center">
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-xl font-bold">{analytics.wastePercentage.toFixed(1)}%</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">Waste Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-500 flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-xl font-bold">₹{analytics.totalSpent.toFixed(0)}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-500 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <p className="text-sm sm:text-xl font-bold">₹{analytics.avgDailySpend.toFixed(0)}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">Daily Avg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Consumed Items */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Most Consumed Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {analytics.topConsumed.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[10px] sm:text-sm">{item.name}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[10px] sm:text-sm">{item.quantity.toFixed(1)}</p>
                    <p className="text-[8px] sm:text-xs text-muted-foreground">units</p>
                  </div>
                </div>
              ))}
              {analytics.topConsumed.length === 0 && (
                <p className="text-center text-muted-foreground py-3 sm:py-4 text-[10px] sm:text-sm">No consumption data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Predictions */}
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              Stock Predictions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {analytics.lowStockPredictions.map((prediction: any, index: number) => {
                const urgency = prediction.daysRemaining <= 3 ? 'urgent' : prediction.daysRemaining <= 7 ? 'warning' : 'normal'
                const color = urgency === 'urgent' ? 'bg-red-500' : urgency === 'warning' ? 'bg-orange-500' : 'bg-green-500'
                
                return (
                  <div key={index} className="flex items-center gap-2 sm:gap-3">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-md sm:rounded-lg ${color} flex items-center justify-center`}>
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[10px] sm:text-sm">{prediction.item.name}</p>
                      <p className="text-[9px] sm:text-xs text-muted-foreground">
                        {prediction.daysRemaining} days remaining
                      </p>
                    </div>
                    <Badge variant={urgency === 'urgent' ? 'destructive' : urgency === 'warning' ? 'secondary' : 'default'} className="text-[8px] sm:text-xs px-1.5 py-0.5">
                      {urgency === 'urgent' ? 'Critical' : urgency === 'warning' ? 'Low' : 'OK'}
                    </Badge>
                  </div>
                )
              })}
              {analytics.lowStockPredictions.length === 0 && (
                <p className="text-center text-muted-foreground py-3 sm:py-4 text-[10px] sm:text-sm">No predictions available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending by Category */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
            Spending by Category
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {Object.entries(analytics.categorySpend)
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => {
                const percentage = (amount / analytics.totalSpent) * 100
                return (
                  <div key={category} className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] sm:text-sm font-medium">{category}</span>
                      <span className="text-[10px] sm:text-sm text-muted-foreground">₹{amount.toFixed(0)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 sm:h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-[8px] sm:text-xs text-muted-foreground">{percentage.toFixed(1)}% of total</p>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-900/5 dark:shadow-black/20">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
            Smart Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {analytics.wastePercentage > 15 && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-50/80 dark:bg-red-900/30 border border-red-200/60 dark:border-red-800/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300 text-[10px] sm:text-sm">High Waste Rate</h4>
                    <p className="text-[9px] sm:text-sm text-red-600 dark:text-red-400">
                      Your waste rate is {analytics.wastePercentage.toFixed(1)}%. Consider meal planning to reduce waste.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.avgDailySpend > 200 && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-orange-50/80 dark:bg-orange-900/30 border border-orange-200/60 dark:border-orange-800/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 text-[10px] sm:text-sm">High Daily Spending</h4>
                    <p className="text-[9px] sm:text-sm text-orange-600 dark:text-orange-400">
                      You're spending ₹{analytics.avgDailySpend.toFixed(0)} per day. Consider bulk buying for savings.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.lowStockPredictions.length > 0 && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 text-[10px] sm:text-sm">Stock Alert</h4>
                    <p className="text-[9px] sm:text-sm text-blue-600 dark:text-blue-400">
                      {analytics.lowStockPredictions.length} items are running low. Plan your next shopping trip.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {analytics.wastePercentage < 5 && analytics.avgDailySpend < 150 && (
              <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-green-50/80 dark:bg-green-900/30 border border-green-200/60 dark:border-green-800/60 shadow-sm backdrop-blur-sm">
                <div className="flex items-start gap-2 sm:gap-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-300 text-[10px] sm:text-sm">Excellent Management</h4>
                    <p className="text-[9px] sm:text-sm text-green-600 dark:text-green-400">
                      Great job! Low waste and controlled spending. Keep it up!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}