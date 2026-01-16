"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Target,
  TrendingUp,
  Activity,
  Zap,
  Droplets,
  Flame,
  Apple,
  Calendar,
  Plus,
  Award,
  Settings,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useNutrition } from '@/hooks/use-nutrition'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export default function NutritionPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today')
  const [showAddFood, setShowAddFood] = useState(false)
  const [showGoalsDialog, setShowGoalsDialog] = useState(false)
  const [foodForm, setFoodForm] = useState({
    foodName: '',
    mealType: 'BREAKFAST' as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
    quantity: '',
    unit: 'g',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: '',
    notes: ''
  })
  const [goalsForm, setGoalsForm] = useState({
    dailyCalories: '',
    dailyProtein: '',
    dailyCarbs: '',
    dailyFat: '',
    dailyFiber: '',
    dailyWater: '',
    weightGoal: '',
    activityLevel: ''
  })

  const {
    entries,
    goals,
    dailySummary,
    progressData,
    loading,
    error,
    selectedDate,
    setSelectedDate,
    addNutritionEntry,
    updateGoals,
    addWaterIntake,
    quickAddFood,
    removeNutritionEntry
  } = useNutrition()

  // Initialize goals form when goals data is loaded
  useState(() => {
    if (goals) {
      setGoalsForm({
        dailyCalories: goals.dailyCalories?.toString() || '2000',
        dailyProtein: goals.dailyProtein?.toString() || '150',
        dailyCarbs: goals.dailyCarbs?.toString() || '250',
        dailyFat: goals.dailyFat?.toString() || '67',
        dailyFiber: goals.dailyFiber?.toString() || '25',
        dailyWater: goals.dailyWater?.toString() || '2500',
        weightGoal: goals.weightGoal?.toString() || '',
        activityLevel: goals.activityLevel || 'moderate'
      })
    }
  })

  const handleAddFood = async () => {
    if (!foodForm.foodName || !foodForm.quantity) {
      toast.error('Please fill in food name and quantity')
      return
    }

    try {
      await addNutritionEntry({
        date: selectedDate.toISOString().split('T')[0],
        mealType: foodForm.mealType,
        foodName: foodForm.foodName,
        quantity: parseFloat(foodForm.quantity),
        unit: foodForm.unit,
        calories: foodForm.calories ? parseFloat(foodForm.calories) : undefined,
        protein: foodForm.protein ? parseFloat(foodForm.protein) : undefined,
        carbs: foodForm.carbs ? parseFloat(foodForm.carbs) : undefined,
        fat: foodForm.fat ? parseFloat(foodForm.fat) : undefined,
        fiber: foodForm.fiber ? parseFloat(foodForm.fiber) : undefined,
        notes: foodForm.notes || undefined
      })

      setFoodForm({
        foodName: '',
        mealType: 'BREAKFAST',
        quantity: '',
        unit: 'g',
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
        notes: ''
      })
      setShowAddFood(false)
    } catch (error) {
      console.error('Error adding food:', error)
    }
  }

  const handleUpdateGoals = async () => {
    try {
      await updateGoals({
        dailyCalories: goalsForm.dailyCalories ? parseFloat(goalsForm.dailyCalories) : undefined,
        dailyProtein: goalsForm.dailyProtein ? parseFloat(goalsForm.dailyProtein) : undefined,
        dailyCarbs: goalsForm.dailyCarbs ? parseFloat(goalsForm.dailyCarbs) : undefined,
        dailyFat: goalsForm.dailyFat ? parseFloat(goalsForm.dailyFat) : undefined,
        dailyFiber: goalsForm.dailyFiber ? parseFloat(goalsForm.dailyFiber) : undefined,
        dailyWater: goalsForm.dailyWater ? parseFloat(goalsForm.dailyWater) : undefined,
        weightGoal: goalsForm.weightGoal ? parseFloat(goalsForm.weightGoal) : undefined,
        activityLevel: goalsForm.activityLevel || undefined
      })
      setShowGoalsDialog(false)
    } catch (error) {
      console.error('Error updating goals:', error)
    }
  }

  const handleAddWater = async (amount: number) => {
    try {
      await addWaterIntake(amount)
    } catch (error) {
      console.error('Error adding water:', error)
    }
  }

  const handleQuickLogFood = async (foodName: string) => {
    try {
      await quickAddFood(foodName, 'SNACK', selectedDate)
    } catch (error) {
      console.error('Error quick logging food:', error)
    }
  }

  const getProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getMealTypeEntries = (mealType: string) => {
    return entries.filter((entry: any) => entry.mealType === mealType)
  }

  if (loading) {
    return (
      <div className="section-spacing">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="section-spacing">
        <div className="text-center text-red-500">
          Error loading nutrition data: {error.message}
        </div>
      </div>
    )
  }

  const getProgressColor = (current: number, goal: number) => {
    const percentage = (current / goal) * 100
    if (percentage < 50) return 'bg-red-500'
    if (percentage < 80) return 'bg-yellow-500'
    if (percentage <= 100) return 'bg-green-500'
    return 'bg-blue-500'
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
            <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            Nutrition Tracking
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Monitor your daily nutrition and health goals</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            haptic.light()
            setShowGoalsDialog(true)
          }}
          className="h-8 w-8 sm:h-10 sm:w-10"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="mobile-btn-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              onClick={() => haptic.medium()}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Log Food
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Food Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="foodName">Food Name</Label>
                <Input
                  id="foodName"
                  value={foodForm.foodName}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, foodName: e.target.value }))}
                  placeholder="e.g., Grilled Chicken"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mealType">Meal Type</Label>
                  <Select value={foodForm.mealType} onValueChange={(value: any) => setFoodForm(prev => ({ ...prev, mealType: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BREAKFAST">Breakfast</SelectItem>
                      <SelectItem value="LUNCH">Lunch</SelectItem>
                      <SelectItem value="DINNER">Dinner</SelectItem>
                      <SelectItem value="SNACK">Snack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <div className="flex gap-2">
                    <Input
                      id="quantity"
                      type="number"
                      value={foodForm.quantity}
                      onChange={(e) => setFoodForm(prev => ({ ...prev, quantity: e.target.value }))}
                      placeholder="100"
                    />
                    <Select value={foodForm.unit} onValueChange={(value) => setFoodForm(prev => ({ ...prev, unit: value }))}>
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calories">Calories (optional)</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={foodForm.calories}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, calories: e.target.value }))}
                    placeholder="250"
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={foodForm.protein}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, protein: e.target.value }))}
                    placeholder="25"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={foodForm.carbs}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, carbs: e.target.value }))}
                    placeholder="30"
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={foodForm.fat}
                    onChange={(e) => setFoodForm(prev => ({ ...prev, fat: e.target.value }))}
                    placeholder="10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={foodForm.notes}
                  onChange={(e) => setFoodForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddFood(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddFood} className="flex-1">
                  Add Food
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Dialog */}
      <Dialog open={showGoalsDialog} onOpenChange={setShowGoalsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nutrition Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyCalories">Daily Calories</Label>
                <Input
                  id="dailyCalories"
                  type="number"
                  value={goalsForm.dailyCalories}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyCalories: e.target.value }))}
                  placeholder="2000"
                />
              </div>
              <div>
                <Label htmlFor="dailyProtein">Daily Protein (g)</Label>
                <Input
                  id="dailyProtein"
                  type="number"
                  value={goalsForm.dailyProtein}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyProtein: e.target.value }))}
                  placeholder="150"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyCarbs">Daily Carbs (g)</Label>
                <Input
                  id="dailyCarbs"
                  type="number"
                  value={goalsForm.dailyCarbs}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyCarbs: e.target.value }))}
                  placeholder="250"
                />
              </div>
              <div>
                <Label htmlFor="dailyFat">Daily Fat (g)</Label>
                <Input
                  id="dailyFat"
                  type="number"
                  value={goalsForm.dailyFat}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyFat: e.target.value }))}
                  placeholder="67"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dailyFiber">Daily Fiber (g)</Label>
                <Input
                  id="dailyFiber"
                  type="number"
                  value={goalsForm.dailyFiber}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyFiber: e.target.value }))}
                  placeholder="25"
                />
              </div>
              <div>
                <Label htmlFor="dailyWater">Daily Water (ml)</Label>
                <Input
                  id="dailyWater"
                  type="number"
                  value={goalsForm.dailyWater}
                  onChange={(e) => setGoalsForm(prev => ({ ...prev, dailyWater: e.target.value }))}
                  placeholder="2500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="activityLevel">Activity Level</Label>
              <Select value={goalsForm.activityLevel} onValueChange={(value) => setGoalsForm(prev => ({ ...prev, activityLevel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light Activity</SelectItem>
                  <SelectItem value="moderate">Moderate Activity</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowGoalsDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleUpdateGoals} className="flex-1">
                Update Goals
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Period Selector */}
      <div className="flex gap-1 sm:gap-2 bg-muted/50 rounded-xl p-1">
        {(['today', 'week', 'month'] as const).map((period) => (
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

      {/* Daily Summary */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Target className="w-4 h-4 sm:w-5 sm:h-5" />
              Today's Progress
            </span>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 text-[9px] sm:text-xs">
              {progressData?.calories ? Math.round(progressData.calories.progress) : 0}% of goal
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Calories */}
            <NutritionCard
              icon={<Flame className="w-4 h-4 sm:w-5 sm:h-5" />}
              label="Calories"
              current={progressData?.calories?.current || 0}
              goal={progressData?.calories?.goal || 2000}
              unit="kcal"
              color="text-orange-600"
              bgColor="bg-orange-100 dark:bg-orange-950/30"
            />

            {/* Protein */}
            <NutritionCard
              icon={<Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
              label="Protein"
              current={progressData?.protein?.current || 0}
              goal={progressData?.protein?.goal || 150}
              unit="g"
              color="text-red-600"
              bgColor="bg-red-100 dark:bg-red-950/30"
            />

            {/* Carbs */}
            <NutritionCard
              icon={<Activity className="w-4 h-4 sm:w-5 sm:h-5" />}
              label="Carbs"
              current={progressData?.carbs?.current || 0}
              goal={progressData?.carbs?.goal || 250}
              unit="g"
              color="text-blue-600"
              bgColor="bg-blue-100 dark:bg-blue-950/30"
            />

            {/* Fat */}
            <NutritionCard
              icon={<Droplets className="w-4 h-4 sm:w-5 sm:h-5" />}
              label="Fat"
              current={progressData?.fat?.current || 0}
              goal={progressData?.fat?.goal || 65}
              unit="g"
              color="text-yellow-600"
              bgColor="bg-yellow-100 dark:bg-yellow-950/30"
            />
          </div>

          {/* Macronutrient Breakdown */}
          <div className="mt-4 sm:mt-6">
            <h4 className="font-semibold text-xs sm:text-sm mb-2 sm:mb-3">Macronutrient Breakdown</h4>
            <div className="space-y-2 sm:space-y-3">
              <MacroProgress
                label="Protein"
                current={progressData?.protein?.current || 0}
                goal={progressData?.protein?.goal || 150}
                color="bg-red-500"
                percentage={Math.round(((progressData?.protein?.current || 0) * 4 / (dailySummary?.calories || 1)) * 100)}
              />
              <MacroProgress
                label="Carbohydrates"
                current={progressData?.carbs?.current || 0}
                goal={progressData?.carbs?.goal || 250}
                color="bg-blue-500"
                percentage={Math.round(((progressData?.carbs?.current || 0) * 4 / (dailySummary?.calories || 1)) * 100)}
              />
              <MacroProgress
                label="Fat"
                current={progressData?.fat?.current || 0}
                goal={progressData?.fat?.goal || 65}
                color="bg-yellow-500"
                percentage={Math.round(((progressData?.fat?.current || 0) * 9 / (dailySummary?.calories || 1)) * 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Water Intake */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm font-medium">
                  {progressData?.water?.current || 0}ml / {progressData?.water?.goal || 2500}ml
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {Math.round(progressData?.water?.progress || 0)}%
                </span>
              </div>
              <Progress 
                value={progressData?.water?.progress || 0} 
                className="h-2 sm:h-3"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mobile-btn-sm"
              onClick={() => {
                haptic.medium()
                handleAddWater(250)
              }}
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
              250ml
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mt-3 sm:mt-4">
            {[250, 500, 750, 1000].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="mobile-btn-sm text-[9px] sm:text-xs"
                onClick={() => {
                  haptic.light()
                  handleAddWater(amount)
                }}
              >
                +{amount}ml
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              Today's Meals
            </span>
            <Badge variant="outline" className="text-[9px] sm:text-xs">
              {entries.length} entries
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="subsection-spacing">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No meals logged today</p>
                <p className="text-xs">Start by adding your first meal!</p>
              </div>
            ) : (
              entries.map((entry: any, index: number) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-all group">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 sm:gap-3 mb-1">
                            <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                              {entry.mealType}
                            </Badge>
                            <Badge variant="outline" className="text-[8px] sm:text-[9px]">
                              {entry.calories || 0} kcal
                            </Badge>
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm truncate">{entry.foodName}</h4>
                          <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">
                            {entry.quantity} {entry.unit}
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-xs text-muted-foreground">
                            {entry.protein && <span>P: {entry.protein}g</span>}
                            {entry.carbs && <span>C: {entry.carbs}g</span>}
                            {entry.fat && <span>F: {entry.fat}g</span>}
                            {entry.fiber && <span>Fiber: {entry.fiber}g</span>}
                          </div>
                          {entry.notes && (
                            <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-1 italic">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mobile-btn-sm h-8 w-8 p-0"
                            onClick={() => {
                              // Edit entry functionality
                              toast.info('Edit functionality coming soon!')
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mobile-btn-sm h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => {
                              haptic.medium()
                              removeNutritionEntry(entry.id)
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <AchievementBadge
              icon="🔥"
              title="Calorie Goal"
              description="5 days streak"
              achieved={true}
            />
            <AchievementBadge
              icon="💪"
              title="Protein Power"
              description="Hit protein goal"
              achieved={true}
            />
            <AchievementBadge
              icon="💧"
              title="Hydration Hero"
              description="2L water daily"
              achieved={false}
            />
            <AchievementBadge
              icon="🥗"
              title="Fiber Focus"
              description="25g fiber goal"
              achieved={false}
            />
            <AchievementBadge
              icon="⚖️"
              title="Balanced Diet"
              description="Perfect macros"
              achieved={true}
            />
            <AchievementBadge
              icon="📊"
              title="Consistent Logger"
              description="7 days logging"
              achieved={true}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function NutritionCard({ 
  icon, 
  label, 
  current, 
  goal, 
  unit, 
  color, 
  bgColor 
}: {
  icon: React.ReactNode
  label: string
  current: number
  goal: number
  unit: string
  color: string
  bgColor: string
}) {
  const progress = Math.min((current / goal) * 100, 100)
  
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-3 sm:p-4 text-center">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${bgColor} flex items-center justify-center mx-auto mb-2 ${color}`}>
          {icon}
        </div>
        <p className="text-[9px] sm:text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm sm:text-lg font-bold">{current}<span className="text-xs text-muted-foreground">/{goal}{unit}</span></p>
        <Progress value={progress} className="h-1 sm:h-1.5 mt-2" />
        <p className="text-[8px] sm:text-[10px] text-muted-foreground mt-1">{Math.round(progress)}%</p>
      </CardContent>
    </Card>
  )
}

function MacroProgress({ 
  label, 
  current, 
  goal, 
  color, 
  percentage 
}: {
  label: string
  current: number
  goal: number
  color: string
  percentage: number
}) {
  const progress = Math.min((current / goal) * 100, 100)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs sm:text-sm font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm">{current}g / {goal}g</span>
          <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
            {percentage}%
          </Badge>
        </div>
      </div>
      <Progress value={progress} className="h-2 sm:h-2.5" />
    </div>
  )
}

function AchievementBadge({ 
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
    <Card className={`transition-all ${achieved ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'opacity-60'}`}>
      <CardContent className="p-2 sm:p-3 text-center">
        <div className="text-lg sm:text-xl mb-1">{icon}</div>
        <p className="text-[9px] sm:text-xs font-semibold">{title}</p>
        <p className="text-[8px] sm:text-[10px] text-muted-foreground">{description}</p>
        {achieved && (
          <Badge className="mt-1 text-[7px] sm:text-[8px] bg-yellow-500 text-white">
            Achieved!
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}