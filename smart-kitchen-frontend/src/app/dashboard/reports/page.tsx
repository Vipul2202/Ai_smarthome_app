"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  DollarSign,
  Package,
  ShoppingCart,
  Trash2,
  Target,
  Award,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

interface ReportData {
  period: string
  inventory: {
    totalItems: number
    totalValue: number
    lowStockItems: number
    expiringItems: number
    categories: { name: string; count: number; value: number }[]
  }
  expenses: {
    totalSpent: number
    avgDaily: number
    topCategories: { name: string; amount: number; percentage: number }[]
    monthlyTrend: { month: string; amount: number }[]
  }
  waste: {
    totalWaste: number
    wasteValue: number
    preventableWaste: number
    wasteReduction: number
  }
  shopping: {
    listsCreated: number
    itemsPurchased: number
    avgListSize: number
    completionRate: number
  }
  efficiency: {
    inventoryTurnover: number
    wastePercentage: number
    budgetUtilization: number
    planningAccuracy: number
  }
}

// Mock data removed - using real GraphQL queries
// TODO: Implement real report data queries:
// - GET_INVENTORY_STATS
// - GET_EXPENSE_STATS  
// - GET_WASTE_STATS
// - GET_EFFICIENCY_STATS

const reportTypes = [
  { id: 'summary', name: 'Executive Summary', icon: FileText },
  { id: 'inventory', name: 'Inventory Report', icon: Package },
  { id: 'expenses', name: 'Expense Analysis', icon: DollarSign },
  { id: 'waste', name: 'Waste Report', icon: Trash2 },
  { id: 'efficiency', name: 'Efficiency Metrics', icon: Target }
]

export default function ReportsPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  // TODO: Replace with real data hooks
  // const { data: reportData, loading } = useReportData(selectedPeriod)
  
  // Placeholder data structure for development
  const reportData = null // Will be populated with real data
  const [selectedReport, setSelectedReport] = useState('summary')

  const downloadReport = (format: 'pdf' | 'excel' | 'csv') => {
    haptic.medium()
    // In real app, this would generate and download the report
    console.log(`Downloading ${selectedReport} report as ${format}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30"
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
          <h1 className="text-sm sm:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Reports & Analytics
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Comprehensive insights and detailed reports</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-24 sm:w-32 mobile-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="mobile-btn-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            onClick={() => downloadReport('pdf')}
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isSelected = selectedReport === report.id
          
          return (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isSelected ? 'default' : 'outline'}
                className="w-full h-auto p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2"
                onClick={() => {
                  haptic.selection()
                  setSelectedReport(report.id)
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] sm:text-xs font-medium text-center">{report.name}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* No Data Available Message */}
      {!reportData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl max-w-md mx-auto">
            <CardContent className="p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reports Coming Soon</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We're working on implementing comprehensive reporting features. 
                Real-time analytics and insights will be available soon.
              </p>
              <Badge variant="outline" className="text-xs">
                Feature in Development
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Export Options - Always show */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="text-sm sm:text-lg">Export Report</CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => downloadReport('pdf')}
              className="flex-1 mobile-btn"
              disabled={!reportData}
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Download PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('excel')}
              className="flex-1 mobile-btn"
              disabled={!reportData}
            >
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadReport('csv')}
              className="flex-1 mobile-btn"
              disabled={!reportData}
            >
              <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MetricCard({ 
  icon, 
  title, 
  value, 
  change, 
  color 
}: {
  icon: React.ReactNode
  title: string
  value: string
  change: number
  color: string
}) {
  return (
    <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-md transition-all">
      <CardContent className="card-content-padding text-center">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${color} flex items-center justify-center mx-auto mb-2 text-white`}>
          {icon}
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">{title}</p>
        <p className="text-sm sm:text-lg font-bold mb-1">{value}</p>
        <div className="flex items-center justify-center gap-1">
          {change > 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-[8px] sm:text-[10px] ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(change)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressMetric({ 
  label, 
  value, 
  target, 
  color, 
  suffix = '' 
}: {
  label: string
  value: number
  target: number
  color: string
  suffix?: string
}) {
  const percentage = Math.min((value / target) * 100, 100)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs sm:text-sm">{label}</span>
        <span className="text-xs sm:text-sm font-medium">{value.toFixed(1)}{suffix}</span>
      </div>
      <Progress value={percentage} className="h-1.5 sm:h-2" />
      <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-1">
        Target: {target}{suffix}
      </p>
    </div>
  )
}

function AchievementItem({ 
  icon, 
  title, 
  description, 
  achieved 
}: {
  icon: string
  title: string
  description: string
  achieved: boolean
}) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
      achieved ? 'bg-green-50 dark:bg-green-950/20' : 'bg-muted/50'
    }`}>
      <span className="text-lg sm:text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-[9px] sm:text-xs text-muted-foreground">{description}</p>
      </div>
      {achieved && (
        <Badge className="bg-green-500 text-white text-[7px] sm:text-[8px]">
          ✓
        </Badge>
      )}
    </div>
  )
}