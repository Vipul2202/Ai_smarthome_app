"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  ShoppingCart, 
  Users, 
  Clock,
  Sparkles,
  Heart,
  Gift,
  Flame,
  Moon,
  Sun
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useShoppingLists } from '@/hooks/use-shopping'

interface FestivalTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradient: string
  season: 'spring' | 'summer' | 'monsoon' | 'winter' | 'all'
  popularity: number
  estimatedCost: number
  servings: number
  prepTime: string
  items: {
    category: string
    items: {
      name: string
      quantity: number
      unit: string
      essential: boolean
    }[]
  }[]
}

const festivalTemplates: FestivalTemplate[] = [
  {
    id: 'diwali',
    name: 'Diwali Celebration',
    description: 'Complete shopping list for the festival of lights',
    icon: Flame,
    color: 'text-orange-600',
    gradient: 'from-orange-500 to-red-600',
    season: 'winter',
    popularity: 95,
    estimatedCost: 3500,
    servings: 20,
    prepTime: '3-4 days',
    items: [
      {
        category: 'Sweets & Desserts',
        items: [
          { name: 'Ghee', quantity: 1, unit: 'kg', essential: true },
          { name: 'Sugar', quantity: 2, unit: 'kg', essential: true },
          { name: 'Khoya/Mawa', quantity: 500, unit: 'g', essential: true },
          { name: 'Cashews', quantity: 250, unit: 'g', essential: true },
          { name: 'Almonds', quantity: 250, unit: 'g', essential: true },
          { name: 'Cardamom', quantity: 50, unit: 'g', essential: true },
          { name: 'Silver Foil (Varak)', quantity: 1, unit: 'pack', essential: false },
        ]
      },
      {
        category: 'Puja Items',
        items: [
          { name: 'Diya/Oil Lamps', quantity: 20, unit: 'pieces', essential: true },
          { name: 'Mustard Oil', quantity: 500, unit: 'ml', essential: true },
          { name: 'Incense Sticks', quantity: 2, unit: 'packs', essential: true },
          { name: 'Flowers (Marigold)', quantity: 2, unit: 'kg', essential: true },
          { name: 'Rangoli Colors', quantity: 1, unit: 'set', essential: false },
        ]
      },
      {
        category: 'Snacks & Savories',
        items: [
          { name: 'Besan (Gram Flour)', quantity: 1, unit: 'kg', essential: true },
          { name: 'Rice Flour', quantity: 500, unit: 'g', essential: true },
          { name: 'Peanuts', quantity: 500, unit: 'g', essential: true },
          { name: 'Curry Leaves', quantity: 100, unit: 'g', essential: true },
        ]
      }
    ]
  },
  {
    id: 'holi',
    name: 'Holi Festival',
    description: 'Colors, sweets, and traditional Holi treats',
    icon: Sun,
    color: 'text-pink-600',
    gradient: 'from-pink-500 to-purple-600',
    season: 'spring',
    popularity: 88,
    estimatedCost: 2000,
    servings: 15,
    prepTime: '2 days',
    items: [
      {
        category: 'Colors & Fun',
        items: [
          { name: 'Organic Colors', quantity: 1, unit: 'set', essential: true },
          { name: 'Water Balloons', quantity: 100, unit: 'pieces', essential: false },
          { name: 'Pichkari (Water Gun)', quantity: 5, unit: 'pieces', essential: false },
        ]
      },
      {
        category: 'Traditional Sweets',
        items: [
          { name: 'Gujiya Flour', quantity: 1, unit: 'kg', essential: true },
          { name: 'Coconut (Grated)', quantity: 500, unit: 'g', essential: true },
          { name: 'Jaggery', quantity: 500, unit: 'g', essential: true },
          { name: 'Milk', quantity: 2, unit: 'liters', essential: true },
        ]
      },
      {
        category: 'Drinks',
        items: [
          { name: 'Thandai Mix', quantity: 200, unit: 'g', essential: true },
          { name: 'Bhang (if legal)', quantity: 50, unit: 'g', essential: false },
          { name: 'Rose Syrup', quantity: 500, unit: 'ml', essential: true },
        ]
      }
    ]
  },
  {
    id: 'eid',
    name: 'Eid Celebration',
    description: 'Special ingredients for Eid feast and sweets',
    icon: Moon,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-600',
    season: 'all',
    popularity: 85,
    estimatedCost: 4000,
    servings: 25,
    prepTime: '2-3 days',
    items: [
      {
        category: 'Biryani & Main Course',
        items: [
          { name: 'Basmati Rice', quantity: 2, unit: 'kg', essential: true },
          { name: 'Mutton/Chicken', quantity: 2, unit: 'kg', essential: true },
          { name: 'Saffron', quantity: 2, unit: 'g', essential: true },
          { name: 'Fried Onions', quantity: 500, unit: 'g', essential: true },
          { name: 'Yogurt', quantity: 1, unit: 'kg', essential: true },
        ]
      },
      {
        category: 'Sweets & Desserts',
        items: [
          { name: 'Dates', quantity: 1, unit: 'kg', essential: true },
          { name: 'Vermicelli', quantity: 500, unit: 'g', essential: true },
          { name: 'Condensed Milk', quantity: 2, unit: 'cans', essential: true },
          { name: 'Pistachios', quantity: 200, unit: 'g', essential: true },
        ]
      }
    ]
  },
  {
    id: 'christmas',
    name: 'Christmas Feast',
    description: 'Everything for a perfect Christmas dinner',
    icon: Gift,
    color: 'text-red-600',
    gradient: 'from-red-500 to-green-600',
    season: 'winter',
    popularity: 80,
    estimatedCost: 5000,
    servings: 12,
    prepTime: '1 day',
    items: [
      {
        category: 'Cake & Desserts',
        items: [
          { name: 'All Purpose Flour', quantity: 1, unit: 'kg', essential: true },
          { name: 'Butter', quantity: 500, unit: 'g', essential: true },
          { name: 'Eggs', quantity: 12, unit: 'pieces', essential: true },
          { name: 'Vanilla Essence', quantity: 100, unit: 'ml', essential: true },
          { name: 'Chocolate Chips', quantity: 200, unit: 'g', essential: false },
        ]
      },
      {
        category: 'Main Course',
        items: [
          { name: 'Chicken (Whole)', quantity: 2, unit: 'kg', essential: true },
          { name: 'Potatoes', quantity: 2, unit: 'kg', essential: true },
          { name: 'Carrots', quantity: 500, unit: 'g', essential: true },
          { name: 'Wine (Cooking)', quantity: 1, unit: 'bottle', essential: false },
        ]
      }
    ]
  },
  {
    id: 'birthday',
    name: 'Birthday Party',
    description: 'Complete party planning essentials',
    icon: Heart,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-600',
    season: 'all',
    popularity: 92,
    estimatedCost: 2500,
    servings: 15,
    prepTime: '1 day',
    items: [
      {
        category: 'Cake & Sweets',
        items: [
          { name: 'Cake Mix', quantity: 2, unit: 'boxes', essential: true },
          { name: 'Frosting', quantity: 2, unit: 'tubs', essential: true },
          { name: 'Candles', quantity: 1, unit: 'pack', essential: true },
          { name: 'Sprinkles', quantity: 3, unit: 'bottles', essential: false },
        ]
      },
      {
        category: 'Snacks & Drinks',
        items: [
          { name: 'Chips', quantity: 5, unit: 'packs', essential: true },
          { name: 'Soft Drinks', quantity: 6, unit: 'bottles', essential: true },
          { name: 'Juice', quantity: 3, unit: 'cartons', essential: true },
          { name: 'Ice Cream', quantity: 2, unit: 'tubs', essential: true },
        ]
      }
    ]
  }
]

export default function FestivalTemplatesPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const { createList } = useShoppingLists()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeason, setSelectedSeason] = useState<string>('all')
  const [creatingList, setCreatingList] = useState<string | null>(null)

  const filteredTemplates = festivalTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSeason = selectedSeason === 'all' || template.season === selectedSeason
    return matchesSearch && matchesSeason
  })

  const handleCreateList = async (template: FestivalTemplate) => {
    setCreatingList(template.id)
    haptic.medium()

    try {
      // Create shopping list from template
      const listData = {
        type: 'FESTIVAL',
        title: `${template.name} Shopping`,
        description: `Auto-generated list for ${template.name} - ${template.description}`,
        forDate: new Date().toISOString(),
      }

      const result = await createList(listData)
      
      if (result.data?.createShoppingList) {
        // Navigate to the shopping list creation page with template data
        router.push(`/dashboard/shopping/create?festivalId=${template.id}&listId=${result.data.createShoppingList.id}`)
      }

      haptic.success()
    } catch (error) {
      console.error('Failed to create festival list:', error)
      haptic.error()
    } finally {
      setCreatingList(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            haptic.light()
            router.back()
          }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            Festival Templates
          </h1>
          <p className="text-muted-foreground">Pre-built shopping lists for special occasions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search festivals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'spring', 'summer', 'monsoon', 'winter'].map(season => (
            <Button
              key={season}
              variant={selectedSeason === season ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                haptic.light()
                setSelectedSeason(season)
              }}
              className="capitalize"
            >
              {season}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template, index) => {
          const Icon = template.icon
          const totalItems = template.items.reduce((sum, category) => sum + category.items.length, 0)
          const essentialItems = template.items.reduce(
            (sum, category) => sum + category.items.filter(item => item.essential).length, 
            0
          )

          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="card-premium hover:shadow-2xl transition-all duration-300 group cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${template.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{template.popularity}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold">₹{template.estimatedCost}</p>
                      <p className="text-xs text-muted-foreground">Est. Cost</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-muted/50">
                      <p className="text-2xl font-bold">{totalItems}</p>
                      <p className="text-xs text-muted-foreground">Items</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{template.servings} servings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{template.prepTime}</span>
                    </div>
                  </div>

                  {/* Categories Preview */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Categories:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.items.slice(0, 3).map((category, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {category.category}
                        </Badge>
                      ))}
                      {template.items.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.items.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleCreateList(template)}
                    disabled={creatingList === template.id}
                    className={`w-full bg-gradient-to-r ${template.gradient} hover:opacity-90 transition-opacity`}
                  >
                    {creatingList === template.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Use Template
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </motion.div>
  )
}