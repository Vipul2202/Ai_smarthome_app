"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Calculator,
  ArrowUpDown,
  Copy,
  Check,
  Scale,
  Thermometer,
  Droplets,
  Ruler
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

type ConversionCategory = 'weight' | 'volume' | 'temperature' | 'length'

interface ConversionUnit {
  id: string
  name: string
  symbol: string
  toBase: number // multiplier to convert to base unit
  category: ConversionCategory
}

const conversionUnits: Record<ConversionCategory, ConversionUnit[]> = {
  weight: [
    { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: 0.001, category: 'weight' },
    { id: 'g', name: 'Gram', symbol: 'g', toBase: 1, category: 'weight' },
    { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: 1000, category: 'weight' },
    { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: 28.3495, category: 'weight' },
    { id: 'lb', name: 'Pound', symbol: 'lb', toBase: 453.592, category: 'weight' },
    { id: 'cup_flour', name: 'Cup (Flour)', symbol: 'cup', toBase: 120, category: 'weight' },
    { id: 'cup_sugar', name: 'Cup (Sugar)', symbol: 'cup', toBase: 200, category: 'weight' },
    { id: 'tbsp_butter', name: 'Tbsp (Butter)', symbol: 'tbsp', toBase: 14, category: 'weight' }
  ],
  volume: [
    { id: 'ml', name: 'Milliliter', symbol: 'ml', toBase: 1, category: 'volume' },
    { id: 'l', name: 'Liter', symbol: 'L', toBase: 1000, category: 'volume' },
    { id: 'tsp', name: 'Teaspoon', symbol: 'tsp', toBase: 4.92892, category: 'volume' },
    { id: 'tbsp', name: 'Tablespoon', symbol: 'tbsp', toBase: 14.7868, category: 'volume' },
    { id: 'cup', name: 'Cup', symbol: 'cup', toBase: 236.588, category: 'volume' },
    { id: 'pint', name: 'Pint', symbol: 'pt', toBase: 473.176, category: 'volume' },
    { id: 'quart', name: 'Quart', symbol: 'qt', toBase: 946.353, category: 'volume' },
    { id: 'gallon', name: 'Gallon', symbol: 'gal', toBase: 3785.41, category: 'volume' },
    { id: 'fl_oz', name: 'Fluid Ounce', symbol: 'fl oz', toBase: 29.5735, category: 'volume' }
  ],
  temperature: [
    { id: 'celsius', name: 'Celsius', symbol: '°C', toBase: 1, category: 'temperature' },
    { id: 'fahrenheit', name: 'Fahrenheit', symbol: '°F', toBase: 1, category: 'temperature' },
    { id: 'kelvin', name: 'Kelvin', symbol: 'K', toBase: 1, category: 'temperature' }
  ],
  length: [
    { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: 1, category: 'length' },
    { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: 10, category: 'length' },
    { id: 'm', name: 'Meter', symbol: 'm', toBase: 1000, category: 'length' },
    { id: 'inch', name: 'Inch', symbol: 'in', toBase: 25.4, category: 'length' },
    { id: 'ft', name: 'Foot', symbol: 'ft', toBase: 304.8, category: 'length' }
  ]
}

const categoryIcons = {
  weight: Scale,
  volume: Droplets,
  temperature: Thermometer,
  length: Ruler
}

const categoryColors = {
  weight: 'bg-blue-500',
  volume: 'bg-cyan-500',
  temperature: 'bg-red-500',
  length: 'bg-green-500'
}

const commonConversions = [
  { from: '1 cup flour', to: '120g', category: 'weight' },
  { from: '1 cup sugar', to: '200g', category: 'weight' },
  { from: '1 tbsp', to: '15ml', category: 'volume' },
  { from: '1 cup', to: '240ml', category: 'volume' },
  { from: '350°F', to: '175°C', category: 'temperature' },
  { from: '1 inch', to: '2.54cm', category: 'length' }
]

export default function UnitConverterPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  
  const [selectedCategory, setSelectedCategory] = useState<ConversionCategory>('weight')
  const [fromUnit, setFromUnit] = useState<string>('')
  const [toUnit, setToUnit] = useState<string>('')
  const [fromValue, setFromValue] = useState<string>('1')
  const [toValue, setToValue] = useState<string>('0')
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const currentUnits = conversionUnits[selectedCategory]

  // Set default units when category changes
  React.useEffect(() => {
    if (currentUnits.length >= 2) {
      setFromUnit(currentUnits[0].id)
      setToUnit(currentUnits[1].id)
    }
  }, [selectedCategory, currentUnits])

  // Perform conversion
  React.useEffect(() => {
    if (!fromUnit || !toUnit || !fromValue) {
      setToValue('0')
      return
    }

    const fromUnitData = currentUnits.find(u => u.id === fromUnit)
    const toUnitData = currentUnits.find(u => u.id === toUnit)
    
    if (!fromUnitData || !toUnitData) {
      setToValue('0')
      return
    }

    const inputValue = parseFloat(fromValue)
    if (isNaN(inputValue)) {
      setToValue('0')
      return
    }

    let result: number

    if (selectedCategory === 'temperature') {
      // Special handling for temperature conversions
      result = convertTemperature(inputValue, fromUnit, toUnit)
    } else {
      // Standard conversion through base unit
      const baseValue = inputValue * fromUnitData.toBase
      result = baseValue / toUnitData.toBase
    }

    setToValue(result.toFixed(6).replace(/\.?0+$/, ''))
  }, [fromValue, fromUnit, toUnit, selectedCategory, currentUnits])

  const convertTemperature = (value: number, from: string, to: string): number => {
    if (from === to) return value

    // Convert to Celsius first
    let celsius: number
    switch (from) {
      case 'fahrenheit':
        celsius = (value - 32) * 5/9
        break
      case 'kelvin':
        celsius = value - 273.15
        break
      default:
        celsius = value
    }

    // Convert from Celsius to target
    switch (to) {
      case 'fahrenheit':
        return celsius * 9/5 + 32
      case 'kelvin':
        return celsius + 273.15
      default:
        return celsius
    }
  }

  const swapUnits = () => {
    const tempUnit = fromUnit
    const tempValue = fromValue
    
    setFromUnit(toUnit)
    setToUnit(tempUnit)
    setFromValue(toValue)
    
    haptic.light()
  }

  const copyToClipboard = async (value: string, unit: string) => {
    try {
      const unitData = currentUnits.find(u => u.id === unit)
      const textToCopy = `${value} ${unitData?.symbol || unit}`
      
      await navigator.clipboard.writeText(textToCopy)
      setCopiedValue(textToCopy)
      haptic.success()
      
      setTimeout(() => setCopiedValue(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const CategoryIcon = categoryIcons[selectedCategory]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing"
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
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            Unit Converter
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Convert cooking measurements and units</p>
        </div>
      </div>

      {/* Category Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {(Object.keys(conversionUnits) as ConversionCategory[]).map((category) => {
          const Icon = categoryIcons[category]
          const isSelected = selectedCategory === category
          
          return (
            <motion.div
              key={category}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={isSelected ? 'default' : 'outline'}
                className={`w-full h-auto p-3 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 ${
                  isSelected ? categoryColors[category] : ''
                }`}
                onClick={() => {
                  haptic.selection()
                  setSelectedCategory(category)
                }}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[9px] sm:text-xs font-medium capitalize">{category}</span>
              </Button>
            </motion.div>
          )
        })}
      </div>

      {/* Converter */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-lg">
            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="subsection-spacing">
            {/* From Unit */}
            <div>
              <label className="text-[10px] sm:text-sm font-medium mb-2 block">From</label>
              <div className="flex gap-2 sm:gap-3">
                <Input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value"
                  className="flex-1 mobile-input"
                />
                <Select value={fromUnit} onValueChange={setFromUnit}>
                  <SelectTrigger className="w-32 sm:w-40 mobile-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-sm">{unit.name}</span>
                          <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                            {unit.symbol}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(fromValue, fromUnit)}
                  className="mobile-btn-sm"
                >
                  {copiedValue === `${fromValue} ${currentUnits.find(u => u.id === fromUnit)?.symbol}` ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={swapUnits}
                className="mobile-btn-sm"
              >
                <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>

            {/* To Unit */}
            <div>
              <label className="text-[10px] sm:text-sm font-medium mb-2 block">To</label>
              <div className="flex gap-2 sm:gap-3">
                <Input
                  type="text"
                  value={toValue}
                  readOnly
                  className="flex-1 mobile-input bg-muted/50"
                />
                <Select value={toUnit} onValueChange={setToUnit}>
                  <SelectTrigger className="w-32 sm:w-40 mobile-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentUnits.map(unit => (
                      <SelectItem key={unit.id} value={unit.id}>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] sm:text-sm">{unit.name}</span>
                          <Badge variant="secondary" className="text-[8px] sm:text-[9px]">
                            {unit.symbol}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(toValue, toUnit)}
                  className="mobile-btn-sm"
                >
                  {copiedValue === `${toValue} ${currentUnits.find(u => u.id === toUnit)?.symbol}` ? (
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Result Display */}
            {fromValue && toValue && fromValue !== '0' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-950/30 dark:to-blue-950/30 rounded-xl border border-purple-200/60 dark:border-purple-800/60 shadow-sm backdrop-blur-sm"
              >
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Result</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {fromValue} {currentUnits.find(u => u.id === fromUnit)?.symbol} = {toValue} {currentUnits.find(u => u.id === toUnit)?.symbol}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Common Conversions */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="text-sm sm:text-lg">Common Kitchen Conversions</CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {commonConversions.map((conversion, index) => {
              const Icon = categoryIcons[conversion.category as ConversionCategory]
              
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="cursor-pointer hover:shadow-lg hover:shadow-slate-900/10 dark:hover:shadow-black/30 transition-all bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
                    <CardContent className="p-2 sm:p-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] sm:text-sm font-medium">
                            {conversion.from} = {conversion.to}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(conversion.to, '')}
                          className="mobile-btn-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="text-sm sm:text-lg">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
            <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <p className="text-[9px] sm:text-xs text-muted-foreground">Volume</p>
              <p className="text-xs sm:text-sm font-semibold">3 tsp = 1 tbsp</p>
            </div>
            <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <p className="text-[9px] sm:text-xs text-muted-foreground">Volume</p>
              <p className="text-xs sm:text-sm font-semibold">16 tbsp = 1 cup</p>
            </div>
            <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <p className="text-[9px] sm:text-xs text-muted-foreground">Weight</p>
              <p className="text-xs sm:text-sm font-semibold">16 oz = 1 lb</p>
            </div>
            <div className="p-2 sm:p-3 bg-slate-50/80 dark:bg-slate-800/50 rounded-lg shadow-sm backdrop-blur-sm">
              <p className="text-[9px] sm:text-xs text-muted-foreground">Temperature</p>
              <p className="text-xs sm:text-sm font-semibold">°F = °C × 9/5 + 32</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}