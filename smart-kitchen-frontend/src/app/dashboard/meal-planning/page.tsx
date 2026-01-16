"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar,
  Plus,
  ChefHat,
  Clock,
  Users,
  Utensils,
  ArrowLeft,
  Sparkles,
  ShoppingCart,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

interface MealPlan {
  id: string
  date: string
  meals: {
    breakfast?: Recipe
    lunch?: Recipe
    dinner?: Recipe
    snacks?: Recipe[]
  }
  totalCalories: number
  totalCost: number
}

interface Recipe {
  id: string
  name: string
  image: string
  cookTime: number
  servings: number
  calories: number
  cost: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tags: string[]
}

const mockMealPlans: MealPlan[] = [
  {
    id: '1',
    date: '2024-01-20',
    meals: {
      breakfast: {
        id: 'r1',
        name: 'Masala Oats',
        image: '🥣',
        cookTime: 15,
        servings: 2,
        calories: 320,
        cost: 45,
        difficulty: 'Easy',
        tags: ['Healthy', 'Quick']
      },
      lunch: {
        id: 'r2', 
        name: 'Dal Rice',
        image: '🍛',
        cookTime: 30,
        servings: 4,
        calories: 450,
        cost: 80,
        difficulty: 'Easy',
        tags: ['Comfort Food']
      },
      dinner: {
        id: 'r3',
        name: 'Chicken Curry',
        image: '🍗',
        cookTime: 45,
        servings: 4,
        calories: 520,
        cost: 180,
        difficulty: 'Medium',
        tags: ['Protein Rich']
      }
    },
    totalCalories: 1290,
    totalCost: 305
  }
]

const suggestedRecipes: Recipe[] = [
  {
    id: 'sr1',
    name: 'Vegetable Stir Fry',
    image: '🥗',
    cookTime: 20,
    servings: 3,
    calories: 280,
    cost: 60,
    difficulty: 'Easy',
    tags: ['Healthy', 'Vegetarian']
  },
  {
    id: 'sr2',
    name: 'Paneer Butter Masala',
    image: '🧈',
    cookTime: 35,
    servings: 4,
    calories: 420,
    cost: 120,
    difficulty: 'Medium',
    tags: ['Vegetarian', 'Rich']
  }
]

export default function MealPlanningPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const currentDate = new Date()
  
  const getWeekDates = (weekOffset: number) => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1 + (weekOffset * 7))
    
    return weekDays.map((day, index) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + index)
      return {
        day,
        date: date.toISOString().split('T')[0],
        dayNum: date.getDate(),
        isToday: date.toDateString() === currentDate.toDateString()
      }
    })
  }

  const weekDates = getWeekDates(selectedWeek)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30"
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
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            Meal Planning
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Plan your weekly meals and generate shopping lists</p>
        </div>
        <Button
          size="sm"
          className="mobile-btn-sm bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
          onClick={() => {
            haptic.medium()
            // Generate meal plan logic
          }}
        >
          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Auto Plan
        </Button>
      </div>

      {/* Week Navigation */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardContent className="card-content-padding">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                haptic.light()
                setSelectedWeek(selectedWeek - 1)
              }}
              className="mobile-btn-sm"
            >
              ← Previous
            </Button>
            <h3 className="font-semibold text-sm sm:text-base">
              Week of {weekDates[0].dayNum} - {weekDates[6].dayNum}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                haptic.light()
                setSelectedWeek(selectedWeek + 1)
              }}
              className="mobile-btn-sm"
            >
              Next →
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {weekDates.map((dayData) => (
              <motion.div
                key={dayData.date}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all ${
                    dayData.isToday
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                      : selectedDay === dayData.date
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => {
                    haptic.selection()
                    setSelectedDay(dayData.date)
                  }}
                >
                  <CardContent className="p-2 sm:p-3 text-center">
                    <p className="text-[9px] sm:text-xs text-muted-foreground">{dayData.day}</p>
                    <p className="text-sm sm:text-lg font-bold">{dayData.dayNum}</p>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full mx-auto" />
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-orange-500 rounded-full mx-auto" />
                      <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-500 rounded-full mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Today's Meal Plan */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
              <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />
              Today's Meals
            </span>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 text-[9px] sm:text-xs">
              1,290 cal
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Breakfast */}
            <MealCard
              meal="Breakfast"
              recipe={mockMealPlans[0].meals.breakfast}
              icon="🌅"
              color="bg-yellow-500"
            />
            
            {/* Lunch */}
            <MealCard
              meal="Lunch"
              recipe={mockMealPlans[0].meals.lunch}
              icon="☀️"
              color="bg-orange-500"
            />
            
            {/* Dinner */}
            <MealCard
              meal="Dinner"
              recipe={mockMealPlans[0].meals.dinner}
              icon="🌙"
              color="bg-purple-500"
            />
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 mobile-btn"
              onClick={() => {
                haptic.medium()
                router.push('/dashboard/shopping/create?from=meal-plan')
              }}
            >
              <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Generate Shopping List
            </Button>
            <Button
              variant="outline"
              className="flex-1 mobile-btn"
              onClick={() => {
                haptic.medium()
                // View nutrition details
              }}
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Nutrition Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recipe Suggestions */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            Suggested Recipes
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {suggestedRecipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-all">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">{recipe.image}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs sm:text-sm truncate">{recipe.name}</h4>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1">
                          <span className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {recipe.cookTime}m
                          </span>
                          <span className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            {recipe.servings}
                          </span>
                          <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mobile-btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          haptic.medium()
                          // Add to meal plan
                        }}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function MealCard({ 
  meal, 
  recipe, 
  icon, 
  color 
}: { 
  meal: string
  recipe?: Recipe
  icon: string
  color: string 
}) {
  const haptic = useHapticFeedback()

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg ${color} flex items-center justify-center text-white text-xs sm:text-sm`}>
            {icon}
          </div>
          <h4 className="font-semibold text-xs sm:text-sm">{meal}</h4>
        </div>

        {recipe ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg sm:text-xl">{recipe.image}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[10px] sm:text-sm truncate">{recipe.name}</p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">{recipe.calories} cal</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{recipe.cookTime}m</span>
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 ml-1" />
              <span>{recipe.servings}</span>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full mobile-btn-sm border-dashed"
            onClick={() => {
              haptic.light()
              // Add meal logic
            }}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            Add {meal}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}