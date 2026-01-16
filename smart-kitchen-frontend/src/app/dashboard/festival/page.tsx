"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Calendar, 
  ShoppingCart, 
  ChefHat, 
  Users, 
  Gift,
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

interface Festival {
  id: string
  name: string
  date: string
  emoji: string
  color: string
  description: string
  traditions: string[]
  popularDishes: string[]
  shoppingList: string[]
  isUpcoming: boolean
  daysLeft?: number
}

const festivals: Festival[] = [
  {
    id: 'diwali',
    name: 'Diwali',
    date: '2024-11-01',
    emoji: '🪔',
    color: 'from-yellow-400 to-orange-500',
    description: 'Festival of Lights - Celebrate with sweets, lights, and family gatherings',
    traditions: ['Light diyas', 'Rangoli making', 'Fireworks', 'Family prayers'],
    popularDishes: ['Gulab Jamun', 'Samosa', 'Kaju Katli', 'Dhokla', 'Laddu'],
    shoppingList: ['Ghee', 'Flour', 'Sugar', 'Dry fruits', 'Oil for frying'],
    isUpcoming: true,
    daysLeft: 15
  },
  {
    id: 'holi',
    name: 'Holi',
    date: '2025-03-14',
    emoji: '🎨',
    color: 'from-pink-400 to-purple-500',
    description: 'Festival of Colors - Celebrate spring with colors, music, and traditional foods',
    traditions: ['Play with colors', 'Water balloons', 'Folk music', 'Dance'],
    popularDishes: ['Gujiya', 'Thandai', 'Puran Poli', 'Dahi Bhalla', 'Malpua'],
    shoppingList: ['Milk', 'Khoya', 'Coconut', 'Jaggery', 'Cardamom'],
    isUpcoming: true,
    daysLeft: 120
  },
  {
    id: 'eid',
    name: 'Eid ul-Fitr',
    date: '2024-04-10',
    emoji: '🌙',
    color: 'from-green-400 to-emerald-500',
    description: 'Festival of Breaking Fast - Celebrate with special meals and community',
    traditions: ['Morning prayers', 'Charity', 'Family feast', 'Gift giving'],
    popularDishes: ['Biryani', 'Kebabs', 'Sheer Khurma', 'Haleem', 'Dates'],
    shoppingList: ['Basmati rice', 'Mutton', 'Dates', 'Vermicelli', 'Rose water'],
    isUpcoming: false
  },
  {
    id: 'christmas',
    name: 'Christmas',
    date: '2024-12-25',
    emoji: '🎄',
    color: 'from-red-400 to-green-500',
    description: 'Christmas Day - Celebrate with family, gifts, and festive meals',
    traditions: ['Christmas tree', 'Gift exchange', 'Carol singing', 'Family dinner'],
    popularDishes: ['Plum Cake', 'Roast Turkey', 'Wine', 'Cookies', 'Hot Chocolate'],
    shoppingList: ['Flour', 'Butter', 'Eggs', 'Dry fruits', 'Chocolate'],
    isUpcoming: true,
    daysLeft: 45
  },
  {
    id: 'navratri',
    name: 'Navratri',
    date: '2024-10-03',
    emoji: '💃',
    color: 'from-purple-400 to-pink-500',
    description: 'Nine Nights Festival - Celebrate with dance, fasting, and devotion',
    traditions: ['Garba dance', 'Fasting', 'Goddess worship', 'Traditional dress'],
    popularDishes: ['Sabudana Khichdi', 'Kuttu Roti', 'Fruit Salad', 'Lassi', 'Dry fruits'],
    shoppingList: ['Sabudana', 'Kuttu flour', 'Sendha namak', 'Fruits', 'Milk'],
    isUpcoming: false
  },
  {
    id: 'karva-chauth',
    name: 'Karva Chauth',
    date: '2024-11-01',
    emoji: '🌕',
    color: 'from-orange-400 to-red-500',
    description: 'Festival of married women - Fast for husband\'s long life',
    traditions: ['Day-long fast', 'Moon worship', 'Mehendi', 'Traditional dress'],
    popularDishes: ['Sargi', 'Kheer', 'Mathri', 'Fruits', 'Sweets'],
    shoppingList: ['Rice', 'Milk', 'Sugar', 'Almonds', 'Coconut'],
    isUpcoming: true,
    daysLeft: 15
  }
]

export default function FestivalPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null)

  const upcomingFestivals = festivals.filter(f => f.isUpcoming).sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
  const pastFestivals = festivals.filter(f => !f.isUpcoming)

  const handleFestivalSelect = (festival: Festival) => {
    haptic.light()
    setSelectedFestival(festival)
  }

  const handleCreateShoppingList = (festival: Festival) => {
    haptic.medium()
    // Navigate to shopping list creation with pre-filled items
    router.push(`/dashboard/shopping/create?festival=${festival.id}`)
  }

  const handleGetRecipes = (festival: Festival) => {
    haptic.light()
    // Navigate to recipes with festival filter
    router.push(`/dashboard/recipes?festival=${festival.id}`)
  }

  if (selectedFestival) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30 p-6 rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic.light()
              setSelectedFestival(null)
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-4xl">{selectedFestival.emoji}</div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{selectedFestival.name}</h1>
              <p className="text-muted-foreground">{selectedFestival.description}</p>
            </div>
          </div>
        </div>

        {/* Festival Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Card */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Festival Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Date</span>
                </div>
                <span>{new Date(selectedFestival.date).toLocaleDateString()}</span>
              </div>
              
              {selectedFestival.isUpcoming && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium">Days Left</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {selectedFestival.daysLeft} days
                  </Badge>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Traditions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedFestival.traditions.map((tradition, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full" />
                      {tradition}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Dishes */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Popular Dishes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {selectedFestival.popularDishes.map((dish, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl hover:shadow-md transition-all cursor-pointer"
                    onClick={() => haptic.light()}
                  >
                    <span className="font-medium">{dish}</span>
                    <Heart className="w-4 h-4 text-red-500" />
                  </motion.div>
                ))}
              </div>
              
              <Button
                onClick={() => handleGetRecipes(selectedFestival)}
                className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Get Recipes
              </Button>
            </CardContent>
          </Card>

          {/* Shopping List */}
          <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Essential Shopping List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                {selectedFestival.shoppingList.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl text-center hover:shadow-md transition-all cursor-pointer"
                    onClick={() => haptic.light()}
                  >
                    <div className="text-2xl mb-1">🛒</div>
                    <span className="text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
              
              <Button
                onClick={() => handleCreateShoppingList(selectedFestival)}
                className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Create Shopping List
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/30 p-6 rounded-xl"
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
          className="h-7 w-7 sm:h-10 sm:w-10"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-2 sm:gap-3">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            Festival Planner
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Plan your festival celebrations with ease</p>
        </div>
      </div>

      {/* Upcoming Festivals */}
      <div>
        <h2 className="text-sm sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
          Upcoming Festivals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {upcomingFestivals.map((festival, index) => (
            <motion.div
              key={festival.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover-lift cursor-pointer"
                onClick={() => handleFestivalSelect(festival)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="text-2xl sm:text-3xl">{festival.emoji}</div>
                      <div>
                        <h3 className="font-bold text-[10px] sm:text-base">{festival.name}</h3>
                        <p className="text-[9px] sm:text-sm text-muted-foreground">
                          {new Date(festival.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`bg-gradient-to-r ${festival.color} text-white border-0 text-[8px] sm:text-xs px-1.5 py-0.5`}>
                      {festival.daysLeft} days
                    </Badge>
                  </div>
                  
                  <p className="text-[9px] sm:text-sm text-muted-foreground mb-3 sm:mb-4 line-clamp-2">
                    {festival.description}
                  </p>
                  
                  <div className="flex gap-1.5 sm:gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 sm:h-8 text-[9px] sm:text-xs">
                      <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Plan
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-7 sm:h-8 text-[9px] sm:text-xs">
                      <ShoppingCart className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      Shop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Past Festivals */}
      <div>
        <h2 className="text-sm sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
          <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          Past Festivals
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {pastFestivals.map((festival, index) => (
            <motion.div
              key={festival.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl hover-lift cursor-pointer opacity-75 hover:opacity-100"
                onClick={() => handleFestivalSelect(festival)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="text-xl sm:text-2xl">{festival.emoji}</div>
                    <div>
                      <h3 className="font-semibold text-[9px] sm:text-sm">{festival.name}</h3>
                      <p className="text-[8px] sm:text-xs text-muted-foreground">
                        {new Date(festival.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full text-[8px] sm:text-xs h-6 sm:h-8">
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}