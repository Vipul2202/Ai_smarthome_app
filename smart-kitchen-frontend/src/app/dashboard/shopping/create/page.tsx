"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Save,
  Sparkles,
  Calendar,
  Users,
  Trash2,
  Edit3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRouter, useSearchParams } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useShoppingLists } from '@/hooks/use-shopping'

interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  price?: number
  notes?: string
}

interface ListForm {
  title: string
  description: string
  items: ShoppingItem[]
}

// Festival templates
const festivalTemplates: Record<string, { name: string; items: Omit<ShoppingItem, 'id'>[] }> = {
  diwali: {
    name: 'Diwali Shopping',
    items: [
      { name: 'Ghee', quantity: 1, unit: 'L', price: 600 },
      { name: 'Dry Fruits', quantity: 500, unit: 'g', price: 800 },
      { name: 'Sugar', quantity: 5, unit: 'kg', price: 250 },
      { name: 'Oil', quantity: 5, unit: 'L', price: 700 },
      { name: 'Flour', quantity: 10, unit: 'kg', price: 450 },
      { name: 'Cardamom', quantity: 50, unit: 'g', price: 200 },
      { name: 'Rose Water', quantity: 1, unit: 'bottle', price: 80 }
    ]
  },
  holi: {
    name: 'Holi Special',
    items: [
      { name: 'Thandai Mix', quantity: 500, unit: 'g', price: 260 },
      { name: 'Gujiya', quantity: 2, unit: 'kg', price: 450 },
      { name: 'Colors', quantity: 5, unit: 'packs', price: 320 },
      { name: 'Milk', quantity: 2, unit: 'L', price: 120 },
      { name: 'Khoya', quantity: 500, unit: 'g', price: 300 }
    ]
  },
  eid: {
    name: 'Eid Essentials',
    items: [
      { name: 'Dates', quantity: 1, unit: 'kg', price: 420 },
      { name: 'Mutton', quantity: 3, unit: 'kg', price: 1600 },
      { name: 'Basmati Rice', quantity: 10, unit: 'kg', price: 820 },
      { name: 'Vermicelli', quantity: 500, unit: 'g', price: 90 },
      { name: 'Rose Water', quantity: 1, unit: 'bottle', price: 80 }
    ]
  },
  christmas: {
    name: 'Christmas Grocery',
    items: [
      { name: 'Cake Mix', quantity: 2, unit: 'packs', price: 320 },
      { name: 'Chocolate', quantity: 1, unit: 'kg', price: 500 },
      { name: 'Fruits', quantity: 3, unit: 'kg', price: 250 },
      { name: 'Wine', quantity: 2, unit: 'bottles', price: 1300 },
      { name: 'Butter', quantity: 500, unit: 'g', price: 200 }
    ]
  }
}

export default function CreateShoppingListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const haptic = useHapticFeedback()
  const { createList } = useShoppingLists()
  
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<ListForm>({
    title: '',
    description: '',
    items: []
  })
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pcs', price: 0 })

  const festivalId = searchParams.get('festival')

  useEffect(() => {
    if (festivalId && festivalTemplates[festivalId]) {
      const template = festivalTemplates[festivalId]
      setForm({
        title: template.name,
        description: `Shopping list for ${template.name} celebration`,
        items: template.items.map((item, index) => ({
          ...item,
          id: `item-${index}`
        }))
      })
    }
  }, [festivalId])

  const handleAddItem = () => {
    if (!newItem.name.trim()) return
    
    haptic.light()
    const item: ShoppingItem = {
      id: `item-${Date.now()}`,
      name: newItem.name,
      quantity: newItem.quantity,
      unit: newItem.unit,
      price: newItem.price || undefined
    }
    
    setForm(prev => ({
      ...prev,
      items: [...prev.items, item]
    }))
    
    setNewItem({ name: '', quantity: 1, unit: 'pcs', price: 0 })
  }

  const handleRemoveItem = (id: string) => {
    haptic.light()
    setForm(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const handleUpdateItem = (id: string, updates: Partial<ShoppingItem>) => {
    setForm(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || form.items.length === 0) return

    setLoading(true)
    haptic.medium()

    try {
      await createList({
        title: form.title,
        description: form.description,
        items: form.items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          notes: item.notes
        }))
      })

      haptic.success()
      router.push('/dashboard/shopping')
    } catch (error) {
      console.error('Failed to create shopping list:', error)
      haptic.error()
    } finally {
      setLoading(false)
    }
  }

  const totalCost = form.items.reduce((sum, item) => sum + (item.price || 0), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6 max-w-7xl mx-auto p-3 sm:p-6"
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
          <h1 className="text-lg sm:text-2xl md:text-3xl font-bold flex items-center gap-1.5 sm:gap-2">
            <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500" />
            Create Shopping List
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">
            {festivalId ? 'Festival shopping list with pre-filled items' : 'Create a new shopping list'}
          </p>
        </div>
      </div>

      {/* Festival Alert */}
      {festivalId && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-lg sm:rounded-xl border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg sm:rounded-xl">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-[10px] sm:text-sm">
                Festival Template Loaded!
              </h3>
              <p className="text-[9px] sm:text-sm text-purple-700 dark:text-purple-300">
                We've pre-filled essential items for {festivalTemplates[festivalId]?.name}. Add or remove items as needed.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* List Details */}
          <Card className="card-premium">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                List Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div>
                <Label htmlFor="title" className="text-[9px] sm:text-sm font-medium">List Name *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Weekly Groceries, Diwali Shopping"
                  className="mt-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-[9px] sm:text-sm font-medium">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this shopping list..."
                  className="mt-1 text-[10px] sm:text-sm"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add New Item */}
          <Card className="card-premium">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="sm:col-span-2">
                  <Input
                    value={newItem.name}
                    onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Item name"
                    className="h-8 sm:h-10 text-[10px] sm:text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                    placeholder="Qty"
                    className="h-8 sm:h-10 text-[10px] sm:text-sm"
                  />
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <Input
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Unit"
                    className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                  />
                  <Button 
                    onClick={handleAddItem} 
                    disabled={!newItem.name.trim()}
                    className="h-8 sm:h-10 w-8 sm:w-10 p-0"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card className="card-premium">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Items ({form.items.length})
                </span>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 text-[8px] sm:text-xs px-1.5 py-0.5">
                  ₹{totalCost.toFixed(0)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {form.items.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground">
                  <ShoppingCart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] sm:text-sm">No items added yet</p>
                  <p className="text-[9px] sm:text-xs">Add items using the form above</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {form.items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-muted/50 rounded-lg sm:rounded-xl group hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-1.5 sm:gap-2">
                        <Input
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                          className="font-medium h-7 sm:h-9 text-[9px] sm:text-sm"
                        />
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 1 })}
                          className="h-7 sm:h-9 text-[9px] sm:text-sm"
                        />
                        <Input
                          value={item.unit}
                          onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                          className="h-7 sm:h-9 text-[9px] sm:text-sm"
                        />
                        <Input
                          type="number"
                          min="0"
                          value={item.price || ''}
                          onChange={(e) => handleUpdateItem(item.id, { price: parseFloat(e.target.value) || undefined })}
                          placeholder="Price (₹)"
                          className="h-7 sm:h-9 text-[9px] sm:text-sm"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-7 w-7 sm:h-8 sm:w-8"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Summary */}
          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-lg">List Summary</h3>
                  <p className="text-[9px] sm:text-sm text-muted-foreground">Review before creating</p>
                </div>
                <div className="space-y-1.5 sm:space-y-2 text-[10px] sm:text-sm">
                  <div className="flex justify-between">
                    <span>Total Items:</span>
                    <span className="font-semibold">{form.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Cost:</span>
                    <span className="font-semibold text-emerald-600">₹{totalCost.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-premium">
            <CardContent className="p-4 sm:p-6 space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-[10px] sm:text-sm">Quick Add</h4>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {['Milk', 'Bread', 'Eggs', 'Rice', 'Oil', 'Sugar'].map(item => (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      haptic.light()
                      setNewItem(prev => ({ ...prev, name: item }))
                    }}
                    className="text-[8px] sm:text-xs h-6 sm:h-8 px-2 sm:px-3"
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={loading || !form.title.trim() || form.items.length === 0}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-8 sm:h-10 text-[10px] sm:text-sm"
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 sm:mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Create List
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {
                haptic.light()
                router.back()
              }}
              className="w-full h-8 sm:h-10 text-[10px] sm:text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}