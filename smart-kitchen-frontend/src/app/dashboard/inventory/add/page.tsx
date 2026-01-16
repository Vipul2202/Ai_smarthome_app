"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Hash, 
  Save,
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useSearchParams } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'
import { useInventory } from '@/hooks/use-inventory'
import { BarcodeScanner } from '@/components/barcode/BarcodeScanner'
import { VoiceInput } from '@/components/voice/VoiceInput'

interface ItemForm {
  name: string
  quantity: number
  unit: string
  category: string
  location: 'PANTRY' | 'FRIDGE' | 'FREEZER' | 'CABINET'
  expiryDate: string
  notes: string
  threshold: number
}

const categories = [
  'Vegetables', 'Fruits', 'Dairy', 'Meat & Fish', 'Grains & Cereals',
  'Spices & Condiments', 'Beverages', 'Snacks', 'Frozen', 'Other'
]

const locations: ('FRIDGE' | 'FREEZER' | 'PANTRY' | 'CABINET')[] = ['FRIDGE', 'FREEZER', 'PANTRY', 'CABINET']

const units = ['pcs', 'kg', 'g', 'L', 'ml', 'cups', 'tbsp', 'tsp', 'packets', 'bottles']

export default function AddInventoryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const haptic = useHapticFeedback()
  const { addItem, addBatch } = useInventory()
  
  const [loading, setLoading] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [form, setForm] = useState<ItemForm>({
    name: '',
    quantity: 1,
    unit: 'pcs',
    category: 'Other',
    location: 'PANTRY' as const,
    expiryDate: '',
    notes: '',
    threshold: 1
  })

  const isScanned = searchParams.get('scanned') === 'true'

  useEffect(() => {
    if (isScanned) {
      // Get real scanned data from localStorage
      const scannedData = localStorage.getItem('scannedItemData')
      if (scannedData) {
        try {
          const data = JSON.parse(scannedData)
          setForm(prev => ({
            ...prev,
            name: data.name || 'Scanned Item',
            quantity: data.quantity || 1,
            unit: data.unit || 'pcs',
            category: data.category || 'Other',
            location: 'PANTRY', // Default location in enum format
            expiryDate: data.expiryDate || ''
          }))
          // Clear the data after using it
          localStorage.removeItem('scannedItemData')
        } catch (error) {
          console.error('Failed to parse scanned data:', error)
          // Fallback to default data
          setForm(prev => ({
            ...prev,
            name: 'Scanned Item',
            quantity: 1,
            unit: 'pcs',
            category: 'Other',
            location: 'PANTRY'
          }))
        }
      } else {
        // Fallback if no data found
        setForm(prev => ({
          ...prev,
          name: 'Scanned Item',
          quantity: 1,
          unit: 'pcs',
          category: 'Other',
          location: 'PANTRY'
        }))
      }
    }
  }, [isScanned])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return

    setLoading(true)
    haptic.medium()

    try {
      console.log('Form data before submission:', form)
      
      // Ensure location is a valid enum value
      const validLocation = ['PANTRY', 'FRIDGE', 'FREEZER', 'CABINET'].includes(form.location) 
        ? form.location 
        : 'PANTRY'
      
      console.log('Using location:', validLocation)
      
      // First create the inventory item
      const itemData = {
        name: form.name.trim(),
        category: form.category,
        defaultUnit: form.unit,
        location: validLocation,
        threshold: form.threshold || 1,
        tags: [],
      }
      
      console.log('Item data to send:', itemData)
      
      const itemResult = await addItem(itemData)
      
      console.log('Item creation result:', itemResult)

      // Then create a batch for the item if we have quantity/expiry info
      if (itemResult.data?.createInventoryItem?.id && (form.quantity > 0 || form.expiryDate)) {
        const batchData = {
          quantity: form.quantity,
          unit: form.unit,
          expiryDate: form.expiryDate || undefined,
          purchaseDate: new Date().toISOString(),
          purchasePrice: 0
        }
        
        console.log('Batch data to send:', batchData)
        
        await addBatch(itemResult.data.createInventoryItem.id, batchData)
      }

      haptic.success()
      router.push('/dashboard/inventory')
    } catch (error) {
      console.error('Failed to add item:', error)
      haptic.error()
    } finally {
      setLoading(false)
    }
  }

  const handleScanMore = () => {
    haptic.light()
    router.push('/dashboard/inventory/scan')
  }

  const handleBarcodeResult = (result: any) => {
    haptic.success()
    if (result.product) {
      setForm(prev => ({
        ...prev,
        name: result.product.name || prev.name,
        category: result.product.category === 'Food' ? 'Other' : result.product.category || prev.category,
        notes: `Barcode: ${result.code}${result.product.brand ? ` | Brand: ${result.product.brand}` : ''}`
      }))
    }
  }

  const handleVoiceCommand = (command: any) => {
    haptic.success()
    if (command.action === 'add_to_inventory' && command.item) {
      setForm(prev => ({
        ...prev,
        name: command.item,
        quantity: command.quantity || prev.quantity,
        unit: command.unit || prev.unit
      }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing sm:max-w-2xl sm:mx-auto"
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
            <Package className="w-8 h-8 text-emerald-500" />
            Add Item
          </h1>
          <p className="text-muted-foreground">
            {isScanned ? 'Review scanned item details' : 'Add new item to your inventory'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              haptic.light()
              setShowBarcodeScanner(true)
            }}
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Hash className="w-4 h-4 mr-2" />
            Barcode
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              haptic.light()
              setShowVoiceInput(true)
            }}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Voice
          </Button>
        </div>
      </div>

      {/* Scanned Alert */}
      {isScanned && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
                AI Scan Complete!
              </h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                We've detected the item details. Please review and adjust if needed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleScanMore}
                className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              >
                <Camera className="w-4 h-4 mr-2" />
                Scan More
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowBarcodeScanner(true)}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Hash className="w-4 h-4 mr-2" />
                Barcode
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Item Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Tomatoes, Milk, Rice"
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="unit">Unit</Label>
                <Select value={form.unit} onValueChange={(value) => setForm(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(value) => setForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Storage Location</Label>
                <Select value={form.location} onValueChange={(value: 'PANTRY' | 'FRIDGE' | 'FREEZER' | 'CABINET') => setForm(prev => ({ ...prev, location: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location === 'FRIDGE' ? '🧊 Fridge' :
                         location === 'FREEZER' ? '❄️ Freezer' :
                         location === 'PANTRY' ? '📦 Pantry' : 
                         location === 'CABINET' ? '🗄️ Cabinet' : location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Optional Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="expiryDate" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Expiry Date (Optional)
                </Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="threshold" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Low Stock Alert (when quantity falls below)
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min="0"
                  value={form.threshold}
                  onChange={(e) => setForm(prev => ({ ...prev, threshold: parseInt(e.target.value) || 1 }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about this item..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  haptic.light()
                  router.back()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.name.trim()}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Item
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Barcode Scanner */}
      <BarcodeScanner
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onResult={handleBarcodeResult}
      />

      {/* Voice Input */}
      <VoiceInput
        isOpen={showVoiceInput}
        onClose={() => setShowVoiceInput(false)}
        onCommand={handleVoiceCommand}
      />
    </motion.div>
  )
}