"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Store, 
  Search,
  Filter,
  Star,
  MapPin,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Package
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { PricesSkeleton } from '@/components/skeleton-loaders'

interface PriceData {
  id: string
  itemName: string
  category: string
  vendor: string
  price: number
  unit: string
  lastUpdated: string
  rating: number
  distance: number
  inStock: boolean
  priceHistory: { date: string; price: number }[]
}

// Mock price data - in real app, this would come from API
const mockPriceData: PriceData[] = [
  {
    id: '1',
    itemName: 'Basmati Rice',
    category: 'Grains',
    vendor: 'DMart',
    price: 85,
    unit: 'kg',
    lastUpdated: '2024-01-15',
    rating: 4.5,
    distance: 1.2,
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 90 },
      { date: '2024-01-08', price: 88 },
      { date: '2024-01-15', price: 85 }
    ]
  },
  {
    id: '2',
    itemName: 'Basmati Rice',
    category: 'Grains',
    vendor: 'Reliance Fresh',
    price: 92,
    unit: 'kg',
    lastUpdated: '2024-01-14',
    rating: 4.2,
    distance: 0.8,
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 95 },
      { date: '2024-01-08', price: 93 },
      { date: '2024-01-14', price: 92 }
    ]
  },
  {
    id: '3',
    itemName: 'Basmati Rice',
    category: 'Grains',
    vendor: 'BigBasket',
    price: 88,
    unit: 'kg',
    lastUpdated: '2024-01-16',
    rating: 4.7,
    distance: 0.0, // Online
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 92 },
      { date: '2024-01-08', price: 90 },
      { date: '2024-01-16', price: 88 }
    ]
  },
  {
    id: '4',
    itemName: 'Milk',
    category: 'Dairy',
    vendor: 'Local Dairy',
    price: 55,
    unit: 'liter',
    lastUpdated: '2024-01-16',
    rating: 4.8,
    distance: 0.5,
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 52 },
      { date: '2024-01-08', price: 54 },
      { date: '2024-01-16', price: 55 }
    ]
  },
  {
    id: '5',
    itemName: 'Milk',
    category: 'Dairy',
    vendor: 'DMart',
    price: 58,
    unit: 'liter',
    lastUpdated: '2024-01-15',
    rating: 4.3,
    distance: 1.2,
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 56 },
      { date: '2024-01-08', price: 57 },
      { date: '2024-01-15', price: 58 }
    ]
  },
  {
    id: '6',
    itemName: 'Tomatoes',
    category: 'Vegetables',
    vendor: 'Local Market',
    price: 40,
    unit: 'kg',
    lastUpdated: '2024-01-16',
    rating: 4.0,
    distance: 0.3,
    inStock: true,
    priceHistory: [
      { date: '2024-01-01', price: 35 },
      { date: '2024-01-08', price: 38 },
      { date: '2024-01-16', price: 40 }
    ]
  },
  {
    id: '7',
    itemName: 'Tomatoes',
    category: 'Vegetables',
    vendor: 'Reliance Fresh',
    price: 45,
    unit: 'kg',
    lastUpdated: '2024-01-14',
    rating: 4.1,
    distance: 0.8,
    inStock: false,
    priceHistory: [
      { date: '2024-01-01', price: 42 },
      { date: '2024-01-08', price: 44 },
      { date: '2024-01-14', price: 45 }
    ]
  }
]

type SortBy = 'price' | 'rating' | 'distance' | 'updated'

export default function PriceComparisonPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortBy>('price')
  const [showOnlyInStock, setShowOnlyInStock] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // Show skeleton while loading
  if (isLoading) {
    return <PricesSkeleton />
  }

  // Get unique categories and items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mockPriceData.map(item => item.category)))
    return ['all', ...cats]
  }, [])

  const uniqueItems = useMemo(() => {
    return Array.from(new Set(mockPriceData.map(item => item.itemName)))
  }, [])

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = mockPriceData.filter(item => {
      const matchesSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.vendor.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesStock = !showOnlyInStock || item.inStock
      
      return matchesSearch && matchesCategory && matchesStock
    })

    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price
        case 'rating':
          return b.rating - a.rating
        case 'distance':
          return a.distance - b.distance
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [searchQuery, selectedCategory, sortBy, showOnlyInStock])

  // Group by item name for comparison
  const groupedData = useMemo(() => {
    const groups: Record<string, PriceData[]> = {}
    filteredData.forEach(item => {
      if (!groups[item.itemName]) {
        groups[item.itemName] = []
      }
      groups[item.itemName].push(item)
    })
    return groups
  }, [filteredData])

  const getPriceChange = (priceHistory: { date: string; price: number }[]) => {
    if (priceHistory.length < 2) return 0
    const latest = priceHistory[priceHistory.length - 1].price
    const previous = priceHistory[priceHistory.length - 2].price
    return ((latest - previous) / previous) * 100
  }

  const getBestPrice = (items: PriceData[]) => {
    return Math.min(...items.filter(item => item.inStock).map(item => item.price))
  }

  const getWorstPrice = (items: PriceData[]) => {
    return Math.max(...items.filter(item => item.inStock).map(item => item.price))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing page-container page-padding bg-gradient-to-br from-slate-50 via-white to-green-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-green-950/30"
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
        <div className="flex-1">
          <h1 className="text-sm sm:text-2xl md:text-3xl font-bold flex items-center gap-1.5 sm:gap-2">
            <DollarSign className="w-4 h-4 sm:w-8 sm:h-8 text-green-500" />
            Price Comparison
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Compare prices across different vendors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <Input
            placeholder="Search items or vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 sm:h-10 text-[10px] sm:text-sm"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-8 sm:h-10 text-[10px] sm:text-sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category} className="text-[10px] sm:text-sm">
                {category === 'all' ? 'All Categories' : category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
          <SelectTrigger className="h-8 sm:h-10 text-[10px] sm:text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price" className="text-[10px] sm:text-sm">Price (Low to High)</SelectItem>
            <SelectItem value="rating" className="text-[10px] sm:text-sm">Rating (High to Low)</SelectItem>
            <SelectItem value="distance" className="text-[10px] sm:text-sm">Distance (Near to Far)</SelectItem>
            <SelectItem value="updated" className="text-[10px] sm:text-sm">Recently Updated</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showOnlyInStock ? "default" : "outline"}
          onClick={() => {
            haptic.light()
            setShowOnlyInStock(!showOnlyInStock)
          }}
          className="w-full h-8 sm:h-10 text-[10px] sm:text-sm"
        >
          <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          {showOnlyInStock ? 'In Stock Only' : 'Show All'}
        </Button>
      </div>

      {/* Price Comparison Cards */}
      <div className="space-y-6">
        {Object.entries(groupedData).map(([itemName, items]) => {
          const bestPrice = getBestPrice(items)
          const worstPrice = getWorstPrice(items)
          const savings = worstPrice - bestPrice

          return (
            <Card key={itemName} className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                    {itemName}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] sm:text-xs">{items[0].category}</Badge>
                    {savings > 0 && (
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[9px] sm:text-xs">
                        Save ₹{savings.toFixed(0)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item, index) => {
                    const priceChange = getPriceChange(item.priceHistory)
                    const isBestPrice = item.price === bestPrice && item.inStock
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isBestPrice 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'border-muted bg-muted/30'
                        } ${!item.inStock ? 'opacity-60' : ''}`}
                      >
                        {/* Vendor Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{item.vendor}</span>
                          </div>
                          {isBestPrice && (
                            <Badge className="bg-green-500 text-white text-xs">
                              Best Price
                            </Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-3">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold">₹{item.price}</span>
                            <span className="text-sm text-muted-foreground">/{item.unit}</span>
                          </div>
                          
                          {/* Price Change */}
                          {priceChange !== 0 && (
                            <div className={`flex items-center gap-1 text-sm ${
                              priceChange > 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {priceChange > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              <span>{Math.abs(priceChange).toFixed(1)}%</span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              <span>{item.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span>{item.distance === 0 ? 'Online' : `${item.distance}km`}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(item.lastUpdated).toLocaleDateString()}</span>
                            </div>
                            <div className={`flex items-center gap-1 ${
                              item.inStock ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.inStock ? (
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                              ) : (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              <span>{item.inStock ? 'In Stock' : 'Out of Stock'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          size="sm"
                          disabled={!item.inStock}
                          className={`w-full mt-3 ${
                            isBestPrice 
                              ? 'bg-green-500 hover:bg-green-600' 
                              : 'bg-blue-500 hover:bg-blue-600'
                          }`}
                          onClick={() => {
                            haptic.medium()
                            // TODO: Add to shopping list or navigate to vendor
                          }}
                        >
                          {item.inStock ? 'Add to List' : 'Out of Stock'}
                        </Button>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {Object.keys(groupedData).length === 0 && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No prices found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Price Alerts */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            Price Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-700 dark:text-orange-300">Price Increase Alert</h4>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Tomato prices have increased by 14% this week. Consider buying from Local Market.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <TrendingDown className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-700 dark:text-green-300">Great Deal</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Basmati Rice at DMart is 8% cheaper than usual. Stock up now!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}