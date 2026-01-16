"use client"

import { motion } from "framer-motion"
import {
  Plus,
  Camera,
  ShoppingCart,
  ChefHat,
  TrendingDown,
  TrendingUp,
  DollarSign,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useExpenses } from "@/hooks/use-expenses"
import { useState, useEffect } from "react"
import React from "react"
import { useHapticFeedback } from "@/lib/haptics"
import { useRouter } from "next/navigation"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const periods = ["This Week", "This Month", "This Year"] as const
type Period = (typeof periods)[number]

export function ExpensesTab() {
  const router = useRouter();
  const haptic = useHapticFeedback();
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("This Month")
  const [openPeriod, setOpenPeriod] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const { expenses, stats, priceTrends, loading, error } = useExpenses()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Process price trends data for the chart
  const processedPriceData = React.useMemo(() => {
    if (!mounted || !priceTrends || Object.keys(priceTrends).length === 0) {
      // Return empty array if not mounted or no data
      return [];
    }

    // Get all unique dates from all categories
    const allDates = new Set<string>();
    Object.values(priceTrends).forEach((categoryData: any) => {
      if (Array.isArray(categoryData)) {
        categoryData.forEach((item: any) => allDates.add(item.date));
      }
    });

    // Sort dates and create chart data
    const sortedDates = Array.from(allDates).sort();
    
    return sortedDates.map(date => {
      const dataPoint: any = { 
        day: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      
      // Add price data for each category
      Object.keys(priceTrends).forEach(category => {
        const categoryData = priceTrends[category];
        if (Array.isArray(categoryData)) {
          const dayData = categoryData.find((item: any) => item.date === date);
          if (dayData) {
            dataPoint[category] = Math.round(dayData.avgPrice);
          }
        }
      });
      
      return dataPoint;
    });
  }, [priceTrends, mounted]);

  // Calculate price change percentages
  const priceChanges = React.useMemo(() => {
    if (!mounted || !priceTrends) return {};
    
    const changes: Record<string, number> = {};
    
    Object.keys(priceTrends).forEach(category => {
      const categoryData = priceTrends[category];
      if (Array.isArray(categoryData) && categoryData.length >= 2) {
        const firstPrice = categoryData[0].avgPrice;
        const lastPrice = categoryData[categoryData.length - 1].avgPrice;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        changes[category] = Math.round(change);
      }
    });
    
    return changes;
  }, [priceTrends, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto mb-2" />
          <p className="text-[10px] sm:text-sm text-muted-foreground">Failed to load expenses</p>
        </div>
      </div>
    )
  }

  const totalExpenses = stats?.total || 0
  const rationExpenses = stats?.ration || 0
  const foodOrderExpenses = stats?.foodOrder || 0
  const avgDailySpend = stats?.avgDaily || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-xl shadow-sm">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-mobile-xl sm:text-2xl font-bold">Expense Tracker</h2>
            </div>
            <p className="text-mobile-sm sm:text-base text-muted-foreground">
              Track your kitchen spending & vendor prices
            </p>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-4 w-full">
          {/* Custom period dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => setOpenPeriod((p) => !p)}
              className="inline-flex items-center justify-between gap-2 h-12 sm:h-14 px-4 sm:px-5 rounded-xl
                         border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 text-mobile-base sm:text-lg text-foreground w-full sm:min-w-[10rem]
                         hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-200 shadow-lg shadow-slate-900/5 dark:shadow-black/20 hover:shadow-xl font-medium backdrop-blur-xl"
            >
              <span className="truncate">{selectedPeriod}</span>
              <span className="inline-flex items-center justify-center">
                <svg
                  className={`w-5 h-5 transition-transform ${openPeriod ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            {openPeriod && (
              <div
                className="absolute right-0 mt-2 w-full sm:w-48 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95
                           shadow-xl shadow-slate-900/10 dark:shadow-black/30 z-20 overflow-hidden text-mobile-base sm:text-lg backdrop-blur-xl"
              >
                {periods.map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => {
                      setSelectedPeriod(period)
                      setOpenPeriod(false)
                    }}
                    className={`w-full px-4 sm:px-5 py-3 sm:py-4 text-left transition-all duration-200 font-medium ${
                      selectedPeriod === period
                        ? "bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
                        : "text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Expense button */}
          <Button 
            className="flex-1 sm:flex-none h-12 sm:h-14 px-5 sm:px-6 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/30 text-mobile-base sm:text-lg font-semibold hover:shadow-xl transition-all duration-200"
            onClick={() => {
              haptic.medium();
              router.push("/dashboard/expenses/add");
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="card-premium hover-lift">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">Total Spent</p>
            <p className="text-mobile-xl sm:text-2xl font-bold">₹{totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="card-premium hover-lift">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">Ration</p>
            <p className="text-mobile-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
              ₹{rationExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium hover-lift">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">Food Orders</p>
            <p className="text-mobile-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
              ₹{foodOrderExpenses.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="card-premium hover-lift">
          <CardContent className="p-3 sm:p-4 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <p className="text-mobile-xs sm:text-sm text-muted-foreground mb-1 font-medium">Avg Daily</p>
            <p className="text-mobile-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₹{avgDailySpend.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-5">
          {/* Bill OCR Scanner */}
          <div 
            className="w-full overflow-hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-2xl shadow-xl hover:shadow-emerald-500/40 transition-all cursor-pointer group"
            onClick={() => {
              haptic.medium();
              router.push("/dashboard/expenses/add");
            }}
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 text-white text-center group-hover:scale-[1.02] transition-transform">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-xl">
                  <Camera className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-mobile-base sm:text-lg mb-1 sm:mb-2">Scan Receipt</h3>
                  <p className="text-emerald-100 text-mobile-sm sm:text-base">
                    AI reads bill → auto-adds items & prices
                  </p>
                </div>
                <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-mobile-xs sm:text-sm px-3 py-1">
                  OCR Magic ✨
                </Badge>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="w-full overflow-hidden relative bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20 blur-2xl" />
            <div className="relative p-4 sm:p-5 text-white">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <p className="text-purple-200 text-mobile-sm sm:text-base font-medium">{selectedPeriod}</p>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-mobile-xs sm:text-sm">
                    <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    -12% vs last
                  </Badge>
                </div>
                <p className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg">
                  ₹{totalExpenses.toLocaleString()}
                </p>
                <div className="text-mobile-sm sm:text-base text-purple-200 space-y-1 sm:space-y-2">
                  <div>Ration: ₹{rationExpenses.toLocaleString()}</div>
                  <div>Food Orders: ₹{foodOrderExpenses.toLocaleString()}</div>
                </div>
              </div>
          </div>

          {/* Budget Alert */}
          <Card className="border-l-4 border-amber-500 card-premium">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 dark:bg-amber-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-mobile-base sm:text-lg mb-1 sm:mb-2">Budget Alert</h4>
                  <p className="text-mobile-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                    You&apos;re 15% over monthly budget
                  </p>
                  <div className="flex gap-2 sm:gap-3">
                    <Button size="sm" variant="outline" className="h-9 sm:h-10 text-mobile-sm sm:text-base px-3 sm:px-4">
                      Adjust Budget
                    </Button>
                    <Button size="sm" variant="destructive" className="h-9 sm:h-10 text-mobile-sm sm:text-base px-3 sm:px-4">
                      Cut Spending
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vendor Comparison */}
          <Card className="card-premium">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-mobile-base sm:text-lg font-bold flex items-center gap-2 sm:gap-3">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                Vendor Prices
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2 sm:space-y-3">
              <VendorComparison vendor="DMart" price={245} isCheapest />
              <VendorComparison vendor="Local Store" price={280} />
              <VendorComparison vendor="BigBasket" price={265} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base">Recent Transactions</h3>
            <Badge variant="outline" className="text-[9px] sm:text-xs">
              4 vendors tracked
            </Badge>
          </div>

          <div className="space-y-4 sm:space-y-5 max-h-[600px] overflow-y-auto">
            {expenses && expenses.length > 0 ? (
              expenses.map((expense: Expense, index: number) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ExpenseCard expense={expense} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-6 sm:py-8">
                <DollarSign className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-[10px] sm:text-sm text-muted-foreground">No expenses recorded yet</p>
                <Button 
                  className="mt-2" 
                  size="sm"
                  onClick={() => {
                    haptic.medium();
                    router.push("/dashboard/expenses/add");
                  }}
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add First Expense
                </Button>
              </div>
            )}
          </div>

          {/* Price Trend Chart */}
          <Card className="card-premium">
            <CardContent className="p-3 sm:p-4">
              <h4 className="font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
                Price Trends (Last 30 days)
              </h4>
              <div className="h-40 sm:h-48">
                {processedPriceData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedPriceData}>
                      <defs>
                        <linearGradient id="colorMilk" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorOil" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: any, name?: string) => [`₹${value}`, name || '']}
                      />
                      {priceTrends && Object.keys(priceTrends).map((category, index) => {
                        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                        const gradients = ['colorMilk', 'colorRice', 'colorWheat', 'colorOil', 'colorMilk'];
                        return (
                          <Area
                            key={category}
                            type="monotone"
                            dataKey={category}
                            stroke={colors[index % colors.length]}
                            strokeWidth={2}
                            fill={`url(#${gradients[index % gradients.length]})`}
                            name={category.charAt(0).toUpperCase() + category.slice(1)}
                          />
                        );
                      })}
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-gradient-to-r from-muted/50 to-muted rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <TrendingDown className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-40" />
                      <p className="text-xs sm:text-sm">No price data available</p>
                      <p className="text-[10px] sm:text-xs">Add expenses with item details to see trends</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-3 sm:mt-4 text-xs sm:text-sm flex-wrap gap-2">
                {priceTrends && Object.keys(priceChanges).map((category, index) => {
                  const change = priceChanges[category];
                  const colors = ['blue-500', 'emerald-500', 'amber-500', 'red-500', 'purple-500'];
                  const isPositive = change > 0;
                  
                  return (
                    <div key={category} className="flex items-center gap-1 sm:gap-2">
                      <div className={`w-3 h-3 bg-${colors[index % colors.length]} rounded-full`}></div>
                      <span className="text-muted-foreground capitalize">
                        {category}: {isPositive ? '+' : ''}{change}%
                      </span>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                  );
                })}
                {(!priceTrends || Object.keys(priceChanges).length === 0) && (
                  <span className="text-muted-foreground text-xs">No price changes to display</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

interface Expense {
  id: string
  amount: number
  type: string
  category?: string
  vendor?: string
  date: string
  description?: string
}

function ExpenseCard({ expense }: { expense: Expense }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const isRation = expense.type === "GROCERY" || expense.category === "GROCERY"
  
  // Format the date to a user-friendly format
  const formatDate = (dateString: string) => {
    if (!mounted) return dateString; // Return raw string during SSR
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString;
      
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return "Today"
      } else if (diffDays === 2) {
        return "Yesterday"
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`
      } else {
        return date.toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        })
      }
    } catch (error) {
      return dateString
    }
  }
  
  return (
    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
      <Card className="card-premium hover:shadow-premium-lg transition-all cursor-pointer group">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div
                className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0 shadow-md transition-all group-hover:scale-105 ${
                  isRation
                    ? "bg-emerald-100 dark:bg-emerald-950/30"
                    : "bg-orange-100 dark:bg-orange-950/30"
                }`}
              >
                {isRation ? (
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[10px] sm:text-sm truncate">
                  {expense.vendor || expense.type}
                </p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">{formatDate(expense.date)}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm sm:text-xl font-bold text-foreground">₹{expense.amount}</p>
              <Badge variant="secondary" className="text-[8px] sm:text-[10px] mt-0.5 sm:mt-1">
                {expense.type}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function VendorComparison({
  vendor,
  price,
  isCheapest = false,
}: {
  vendor: string
  price: number
  isCheapest?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-2 sm:p-3 rounded-xl hover:bg-muted/50 transition-all group cursor-pointer border border-transparent hover:border-border/50">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-muted to-muted/50 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-sm">
          🏪
        </div>
        <span className="font-semibold text-mobile-sm sm:text-base">{vendor}</span>
      </div>
      <div className="text-right">
        <p className="font-bold text-mobile-base sm:text-lg">₹{price}</p>
        {isCheapest ? (
          <Badge className="bg-emerald-100 text-emerald-700 text-mobile-xs sm:text-sm mt-1 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5">
            Cheapest 🥇
          </Badge>
        ) : (
          <span className="text-mobile-xs sm:text-sm text-muted-foreground">Avg price</span>
        )}
      </div>
    </div>
  )
}
