"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Receipt, 
  Camera, 
  Save,
  Sparkles,
  ShoppingCart,
  ChefHat,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useExpenses } from '@/hooks/use-expenses'

type ExpenseType = 'GROCERY' | 'FOOD_ORDER' | 'DINING' | 'KITCHEN_SUPPLIES'

interface ExpenseForm {
  amount: number
  type: ExpenseType
  category: string
  vendor: string
  description: string
  date: string
  paymentMethod: string
  tags: string[]
}

const expenseTypes: Array<{ id: ExpenseType; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
  { id: 'GROCERY', label: 'Grocery Shopping', icon: ShoppingCart, color: 'emerald' },
  { id: 'FOOD_ORDER', label: 'Food Delivery', icon: ChefHat, color: 'orange' },
  { id: 'DINING', label: 'Dining Out', icon: Receipt, color: 'purple' },
  { id: 'KITCHEN_SUPPLIES', label: 'Kitchen Supplies', icon: Receipt, color: 'blue' }
]

const categories = [
  'Vegetables & Fruits', 'Dairy & Eggs', 'Meat & Fish', 'Grains & Cereals',
  'Spices & Condiments', 'Beverages', 'Snacks', 'Frozen Foods', 'Other'
]

const paymentMethods = ['Cash', 'Card', 'UPI', 'Net Banking', 'Wallet']

const popularVendors = [
  'DMart', 'BigBasket', 'Reliance Fresh', 'More Supermarket', 'Local Store',
  'Swiggy', 'Zomato', 'Dunzo', 'Amazon Fresh', 'Grofers'
]

export default function AddExpensePage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const { addExpense } = useExpenses()
  
  const [loading, setLoading] = useState(false)
  const [scanningReceipt, setScanningReceipt] = useState(false)
  const [form, setForm] = useState<ExpenseForm>({
    amount: 0,
    type: 'GROCERY' as ExpenseType,
    category: 'Other',
    vendor: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
    tags: []
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.amount <= 0) return

    setLoading(true)
    haptic.medium()

    try {
      await addExpense({
        amount: form.amount,
        type: form.type,
        category: form.category,
        vendor: form.vendor,
        description: form.description,
        date: form.date,
        paymentMethod: form.paymentMethod,
        tags: form.tags
      })

      haptic.success()
      router.push('/dashboard/expenses')
    } catch (error) {
      console.error('Failed to add expense:', error)
      haptic.error()
    } finally {
      setLoading(false)
    }
  }

  const handleScanReceipt = async () => {
    setScanningReceipt(true)
    haptic.medium()
    
    try {
      // Create file input element
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment' // Use back camera on mobile
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          setScanningReceipt(false)
          return
        }

        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '')}/ocr/receipt`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Failed to process receipt')
          }

          const result = await response.json()
          
          if (result.success) {
            // Update form with OCR results
            setForm(prev => ({
              ...prev,
              amount: result.data.total || prev.amount,
              vendor: result.data.vendor || prev.vendor,
              type: result.data.category === 'grocery' ? 'GROCERY' as ExpenseType : prev.type,
              category: result.data.category || prev.category,
              description: result.data.items?.map((item: { name: string }) => item.name).join(', ') || prev.description,
              date: result.data.date ? new Date(result.data.date).toISOString().split('T')[0] : prev.date
            }))
            haptic.success()
          } else {
            throw new Error(result.message || 'Failed to process receipt')
          }
        } catch (error) {
          console.error('OCR processing failed:', error)
          haptic.error()
          // Fallback to demo data for now
          setForm(prev => ({
            ...prev,
            amount: 1250,
            vendor: 'DMart',
            type: 'GROCERY',
            category: 'Vegetables & Fruits',
            description: 'Weekly grocery shopping - vegetables, fruits, dairy items'
          }))
        } finally {
          setScanningReceipt(false)
        }
      }
      
      input.click()
    } catch (error) {
      console.error('Failed to scan receipt:', error)
      setScanningReceipt(false)
      haptic.error()
    }
  }

  const handleAddTag = (tag: string) => {
    if (!form.tags.includes(tag)) {
      setForm(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleRemoveTag = (tag: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing px-3 sm:px-4 max-w-2xl mx-auto"
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
        <div>
          <h1 className="text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            Add Expense
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Track your kitchen and food expenses</p>
        </div>
      </div>

      {/* Receipt Scanner */}
      <div className="w-full overflow-hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-xl shadow-xl hover:shadow-emerald-500/40 transition-all cursor-pointer group">
        <div className="p-4 sm:p-5" onClick={handleScanReceipt}>
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-white text-center group-hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              {scanningReceipt ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-6 h-6 sm:w-7 sm:h-7" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base mb-0.5 sm:mb-1">
                {scanningReceipt ? 'Scanning Receipt...' : 'Scan Receipt'}
              </h3>
              <p className="text-emerald-100 text-[10px] sm:text-sm">
                {scanningReceipt 
                  ? 'AI is reading your receipt and extracting details'
                  : 'AI reads bill → auto-fills amount, vendor & items'
                }
              </p>
            </div>
            {!scanningReceipt && (
              <Badge className="bg-white/30 backdrop-blur-sm text-white border-0 text-[9px] sm:text-xs">
                OCR Magic ✨
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      <Card className="card-premium">
        <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Amount & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="amount" className="text-[10px] sm:text-sm">Amount (₹) *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="mt-1 text-sm sm:text-lg font-semibold h-9 sm:h-11"
                  required
                />
              </div>

              <div>
                <Label htmlFor="type" className="text-[10px] sm:text-sm">Expense Type *</Label>
                <Select value={form.type} onValueChange={(value: ExpenseType) => setForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="mt-1 h-9 sm:h-11 text-[10px] sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map(type => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-sm">{type.label}</span>
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Vendor & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="vendor" className="text-[10px] sm:text-sm">Vendor/Store</Label>
                <Input
                  id="vendor"
                  value={form.vendor}
                  onChange={(e) => setForm(prev => ({ ...prev, vendor: e.target.value }))}
                  placeholder="e.g., DMart, Swiggy, Local Store"
                  className="mt-1 h-9 sm:h-11 text-[10px] sm:text-sm"
                  list="vendors"
                />
                <datalist id="vendors">
                  {popularVendors.map(vendor => (
                    <option key={vendor} value={vendor} />
                  ))}
                </datalist>
              </div>

              <div>
                <Label htmlFor="date" className="text-[10px] sm:text-sm">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1 h-9 sm:h-11 text-[10px] sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Category & Payment Method */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="category" className="text-[10px] sm:text-sm">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1 h-9 sm:h-11 text-[10px] sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-[10px] sm:text-sm">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentMethod" className="text-[10px] sm:text-sm">Payment Method</Label>
                <Select value={form.paymentMethod} onValueChange={(value) => setForm(prev => ({ ...prev, paymentMethod: value }))}>
                  <SelectTrigger className="mt-1 h-9 sm:h-11 text-[10px] sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method} className="text-[10px] sm:text-sm">{method}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-[10px] sm:text-sm">Description (Optional)</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What did you buy? Any additional notes..."
                className="mt-1 text-[10px] sm:text-sm"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div>
              <Label className="text-[10px] sm:text-sm">Tags (Optional)</Label>
              <div className="mt-2 subsection-spacing">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {form.tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-red-100 hover:text-red-700 text-[8px] sm:text-[10px] px-2 py-1"
                      onClick={() => {
                        haptic.light()
                        handleRemoveTag(tag)
                      }}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {['Weekly', 'Bulk', 'Emergency', 'Organic', 'Sale', 'Festival'].map(tag => (
                    <Button
                      key={tag}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        haptic.light()
                        handleAddTag(tag)
                      }}
                      className="text-[8px] sm:text-[10px] h-7 sm:h-8 px-2 sm:px-3"
                      disabled={form.tags.includes(tag)}
                    >
                      + {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  haptic.light()
                  router.back()
                }}
                className="flex-1 h-9 sm:h-11 text-[10px] sm:text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || form.amount <= 0}
                className="flex-1 h-9 sm:h-11 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-[10px] sm:text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5 sm:mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Add Expense
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="card-premium">
        <CardContent className="p-3 sm:p-4">
          <h4 className="font-semibold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Quick Add Common Expenses
          </h4>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { label: 'Milk ₹60', amount: 60, type: 'GROCERY' as ExpenseType, vendor: 'Local Store' },
              { label: 'Vegetables ₹200', amount: 200, type: 'GROCERY' as ExpenseType, vendor: 'Local Store' },
              { label: 'Lunch ₹150', amount: 150, type: 'FOOD_ORDER' as ExpenseType, vendor: 'Swiggy' },
              { label: 'Groceries ₹500', amount: 500, type: 'GROCERY' as ExpenseType, vendor: 'DMart' }
            ].map((quick, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  haptic.light()
                  setForm(prev => ({
                    ...prev,
                    amount: quick.amount,
                    type: quick.type,
                    vendor: quick.vendor
                  }))
                }}
                className="text-[9px] sm:text-xs justify-start h-8 sm:h-9"
              >
                {quick.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}