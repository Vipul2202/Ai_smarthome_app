"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Trash2,
  TrendingDown,
  TrendingUp,
  Target,
  Calendar,
  Plus,
  AlertTriangle,
  Leaf,
  DollarSign,
  BarChart3,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

interface WasteEntry {
  id: string
  itemName: string
  category: string
  quantity: number
  unit: string
  reason: string
  cost: number
  date: string
  preventable: boolean
}

interface WasteStats {
  totalWaste: number
  totalCost: number
  preventableWaste: number
  preventableCost: number
  wasteReduction: number
  topWasteCategories: { category: string; amount: number; cost: number }[]
}

const wasteCategories = [
  'Vegetables & Fruits',
  'Dairy & Eggs', 
  'Meat & Fish',
  'Grains & Cereals',
  'Leftovers',
  'Bread & Bakery',
  'Condiments & Sauces',
  'Other'
]

const wasteReasons = [
  'Expired/Spoiled',
  'Overcooked',
  'Burnt',
  'Too Much Prepared',
  'Forgot About It',
  'Poor Storage',
  'Didn\'t Like Taste',
  'Other'
]

const mockWasteEntries: WasteEntry[] = [
  {
    id: '1',
    itemName: 'Tomatoes',
    category: 'Vegetables & Fruits',
    quantity: 500,
    unit: 'g',
    reason: 'Expired/Spoiled',
    cost: 40,
    date: '2024-01-18',
    preventable: true
  },
  {
    id: '2',
    itemName: 'Leftover Rice',
    category: 'Leftovers',
    quantity: 200,
    unit: 'g',
    reason: 'Too Much Prepared',
    cost: 15,
    date: '2024-01-17',
    preventable: true
  },
  {
    id: '3',
    itemName: 'Milk',
    category: 'Dairy & Eggs',
    quantity: 250,
    unit: 'ml',
    reason: 'Expired/Spoiled',
    cost: 25,
    date: '2024-01-16',
    preventable: true
  }
]

const mockStats: WasteStats = {
  totalWaste: 2.5, // kg
  totalCost: 450,
  preventableWaste: 2.1, // kg
  preventableCost: 380,
  wasteReduction: -15, // percentage change
  topWasteCategories: [
    { category: 'Vegetables & Fruits', amount: 1.2, cost: 180 },
    { category: 'Leftovers', amount: 0.8, cost: 120 },
    { category: 'Dairy & Eggs', amount: 0.5, cost: 150 }
  ]
}

export default function WasteTrackingPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [showAddWaste, setShowAddWaste] = useState(false)
  
  const [newWaste, setNewWaste] = useState({
    itemName: '',
    category: 'Vegetables & Fruits',
    quantity: '',
    unit: 'g',
    reason: 'Expired/Spoiled',
    cost: '',
    preventable: true,
    notes: ''
  })

  const wasteGoal = 1.5 // kg per month
  const wasteProgress = (mockStats.totalWaste / wasteGoal) * 100

  const addWasteEntry = () => {
    if (!newWaste.itemName || !newWaste.quantity) return

    // In real app, this would call an API
    console.log('Adding waste entry:', newWaste)
    
    setShowAddWaste(false)
    setNewWaste({
      itemName: '',
      category: 'Vegetables & Fruits',
      quantity: '',
      unit: 'g',
      reason: 'Expired/Spoiled',
      cost: '',
      preventable: true,
      notes: ''
    })
    haptic.success()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/30"
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
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            Waste Tracking
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Monitor and reduce food waste for sustainability</p>
        </div>
        <Button
          size="sm"
          className="mobile-btn-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
          onClick={() => {
            haptic.medium()
            setShowAddWaste(true)
          }}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Log Waste
        </Button>
      </div>

      {/* Period Selector */}
      <div className="flex gap-1 sm:gap-2 bg-muted/50 rounded-xl p-1">
        {(['week', 'month', 'year'] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'default' : 'ghost'}
            size="sm"
            className="flex-1 mobile-btn-sm"
            onClick={() => {
              haptic.selection()
              setSelectedPeriod(period)
            }}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </Button>
        ))}
      </div>

      {/* Waste Goal Progress */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Monthly Waste Goal
            </span>
            <Badge className={`text-[9px] sm:text-xs ${
              wasteProgress > 100 ? 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' :
              wasteProgress > 80 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400' :
              'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400'
            }`}>
              {wasteProgress.toFixed(0)}% of goal
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm font-medium">{mockStats.totalWaste}kg / {wasteGoal}kg</span>
            <span className="text-xs sm:text-sm text-muted-foreground">
              {wasteProgress > 100 ? `${(wasteProgress - 100).toFixed(0)}% over` : `${(100 - wasteProgress).toFixed(0)}% remaining`}
            </span>
          </div>
          <Progress 
            value={Math.min(wasteProgress, 100)} 
            className="h-2 sm:h-3 mb-3 sm:mb-4"
          />
          
          {wasteProgress > 100 ? (
            <div className="flex items-center gap-2 p-2 sm:p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <p className="text-xs sm:text-sm text-red-700 dark:text-red-400">
                You've exceeded your waste goal. Consider meal planning and better storage.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <p className="text-xs sm:text-sm text-green-700 dark:text-green-400">
                Great job! You're on track to meet your waste reduction goal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Waste Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-md transition-all">
          <CardContent className="card-content-padding text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-2">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">Total Waste</p>
            <p className="text-sm sm:text-lg font-bold">{mockStats.totalWaste}kg</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {mockStats.wasteReduction < 0 ? (
                <TrendingDown className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingUp className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-[8px] sm:text-[10px] ${
                mockStats.wasteReduction < 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {Math.abs(mockStats.wasteReduction)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-md transition-all">
          <CardContent className="card-content-padding text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-100 dark:bg-yellow-950/30 flex items-center justify-center mx-auto mb-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">Cost Impact</p>
            <p className="text-sm sm:text-lg font-bold">₹{mockStats.totalCost}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">wasted value</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-md transition-all">
          <CardContent className="card-content-padding text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">Preventable</p>
            <p className="text-sm sm:text-lg font-bold">{mockStats.preventableWaste}kg</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">
              {((mockStats.preventableWaste / mockStats.totalWaste) * 100).toFixed(0)}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover:shadow-md transition-all">
          <CardContent className="card-content-padding text-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-2">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">Saved Money</p>
            <p className="text-sm sm:text-lg font-bold">₹{mockStats.preventableCost}</p>
            <p className="text-[8px] sm:text-[10px] text-muted-foreground">potential savings</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Waste Categories */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            Top Waste Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="subsection-spacing">
            {mockStats.topWasteCategories.map((category, index) => {
              const percentage = (category.amount / mockStats.totalWaste) * 100
              
              return (
                <div key={category.category} className="flex items-center gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs sm:text-sm font-medium truncate">{category.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">{category.amount}kg</span>
                        <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                          ₹{category.cost}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={percentage} className="h-1.5 sm:h-2" />
                    <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-1">
                      {percentage.toFixed(1)}% of total waste
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Waste Entries */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Recent Entries
            </span>
            <Badge variant="outline" className="text-[9px] sm:text-xs">
              {mockWasteEntries.length} this month
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="subsection-spacing">
            {mockWasteEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-md transition-all">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1">
                          <h4 className="font-semibold text-xs sm:text-sm truncate">{entry.itemName}</h4>
                          <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                            {entry.category}
                          </Badge>
                          {entry.preventable && (
                            <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 text-[8px] sm:text-[9px]">
                              Preventable
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-xs text-muted-foreground">
                          <span>{entry.quantity}{entry.unit}</span>
                          <span>₹{entry.cost}</span>
                          <span>{entry.reason}</span>
                          <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Waste Entry Form */}
      {showAddWaste && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardHeader className="card-header-padding">
              <CardTitle className="text-sm sm:text-lg">Log Food Waste</CardTitle>
            </CardHeader>
            <CardContent className="card-content-padding">
              <div className="subsection-spacing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="item-name" className="text-[10px] sm:text-sm">Item Name *</Label>
                    <Input
                      id="item-name"
                      value={newWaste.itemName}
                      onChange={(e) => setNewWaste(prev => ({ ...prev, itemName: e.target.value }))}
                      placeholder="e.g., Tomatoes, Leftover Rice"
                      className="mt-1 mobile-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-[10px] sm:text-sm">Category</Label>
                    <Select 
                      value={newWaste.category} 
                      onValueChange={(value) => setNewWaste(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="mt-1 mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteCategories.map(category => (
                          <SelectItem key={category} value={category} className="text-[10px] sm:text-sm">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="quantity" className="text-[10px] sm:text-sm">Quantity *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="quantity"
                        type="number"
                        value={newWaste.quantity}
                        onChange={(e) => setNewWaste(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Amount"
                        className="flex-1 mobile-input"
                      />
                      <Select 
                        value={newWaste.unit} 
                        onValueChange={(value) => setNewWaste(prev => ({ ...prev, unit: value }))}
                      >
                        <SelectTrigger className="w-20 sm:w-24 mobile-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="ml">ml</SelectItem>
                          <SelectItem value="L">L</SelectItem>
                          <SelectItem value="pcs">pcs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cost" className="text-[10px] sm:text-sm">Estimated Cost (₹)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newWaste.cost}
                      onChange={(e) => setNewWaste(prev => ({ ...prev, cost: e.target.value }))}
                      placeholder="0"
                      className="mt-1 mobile-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="reason" className="text-[10px] sm:text-sm">Reason for Waste</Label>
                    <Select 
                      value={newWaste.reason} 
                      onValueChange={(value) => setNewWaste(prev => ({ ...prev, reason: value }))}
                    >
                      <SelectTrigger className="mt-1 mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteReasons.map(reason => (
                          <SelectItem key={reason} value={reason} className="text-[10px] sm:text-sm">
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label htmlFor="notes" className="text-[10px] sm:text-sm">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={newWaste.notes}
                      onChange={(e) => setNewWaste(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional details about the waste..."
                      className="mt-1 text-[10px] sm:text-sm"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="preventable"
                    checked={newWaste.preventable}
                    onChange={(e) => setNewWaste(prev => ({ ...prev, preventable: e.target.checked }))}
                    className="w-4 h-4 text-orange-600 rounded"
                  />
                  <Label htmlFor="preventable" className="text-[10px] sm:text-sm">
                    This waste was preventable
                  </Label>
                </div>

                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      haptic.light()
                      setShowAddWaste(false)
                    }}
                    className="flex-1 mobile-btn"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addWasteEntry}
                    className="flex-1 mobile-btn bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                    disabled={!newWaste.itemName || !newWaste.quantity}
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Log Waste
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Waste Reduction Tips */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Waste Reduction Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { icon: '📅', tip: 'Plan meals weekly to buy only what you need' },
              { icon: '🥶', tip: 'Store produce properly to extend freshness' },
              { icon: '🍽️', tip: 'Use smaller plates to reduce portion sizes' },
              { icon: '♻️', tip: 'Repurpose leftovers into new meals' },
              { icon: '📦', tip: 'Check expiry dates and use FIFO method' },
              { icon: '🥗', tip: 'Turn overripe fruits into smoothies or jams' }
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-lg">
                <span className="text-lg sm:text-xl">{item.icon}</span>
                <p className="text-[10px] sm:text-sm text-muted-foreground">{item.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}