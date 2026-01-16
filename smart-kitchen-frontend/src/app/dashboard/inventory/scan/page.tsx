"use client"

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, X, Zap, Sparkles, ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

export default function ScanPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const retakeButtonRef = useRef<HTMLDivElement>(null)
  const useSuggestionButtonRef = useRef<HTMLDivElement>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [scannedImage, setScannedImage] = useState<string | null>(null)
  const [ocrResult, setOcrResult] = useState<any>(null)

  // Add event listeners programmatically
  useEffect(() => {
    const retakeButton = retakeButtonRef.current
    const useSuggestionButton = useSuggestionButtonRef.current

    const handleRetake = () => {
      console.log('🔄 Retake button clicked via event listener!')
      haptic.light()
      setScannedImage(null)
      setOcrResult(null)
    }

    const handleUseSuggestion = () => {
      console.log('✅ Use suggestion clicked via event listener!')
      haptic.success()
      
      try {
        if (ocrResult) {
          localStorage.setItem('scannedItemData', JSON.stringify(ocrResult))
          console.log('📦 Data stored:', ocrResult)
          router.push('/dashboard/inventory/add?scanned=true')
        }
      } catch (error) {
        console.error('❌ Error:', error)
        alert('Error: ' + (error as Error).message)
      }
    }

    if (retakeButton) {
      retakeButton.addEventListener('click', handleRetake)
      retakeButton.addEventListener('touchend', handleRetake)
    }

    if (useSuggestionButton) {
      useSuggestionButton.addEventListener('click', handleUseSuggestion)
      useSuggestionButton.addEventListener('touchend', handleUseSuggestion)
    }

    return () => {
      if (retakeButton) {
        retakeButton.removeEventListener('click', handleRetake)
        retakeButton.removeEventListener('touchend', handleRetake)
      }
      if (useSuggestionButton) {
        useSuggestionButton.removeEventListener('click', handleUseSuggestion)
        useSuggestionButton.removeEventListener('touchend', handleUseSuggestion)
      }
    }
  }, [ocrResult, router])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      haptic.light()
      const reader = new FileReader()
      reader.onload = (e) => {
        setScannedImage(e.target?.result as string)
        processImage(file)
      }
      reader.readAsDataURL(file)
    }
  }

  const processImage = async (file: File) => {
    setIsScanning(true)
    haptic.medium()
    
    try {
      // Call the OCR API
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('http://localhost:4000/ocr/inventory', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        setOcrResult(result.data)
        haptic.success()
      } else {
        console.error('OCR failed:', result.message)
        // Set fallback data
        setOcrResult({
          name: 'Scanned Item',
          category: 'Other',
          quantity: 1,
          unit: 'piece'
        })
        haptic.error()
      }
    } catch (error) {
      console.error('OCR API error:', error)
      // Set fallback data
      setOcrResult({
        name: 'Scanned Item',
        category: 'Other',
        quantity: 1,
        unit: 'piece'
      })
      haptic.error()
    } finally {
      setIsScanning(false)
    }
  }

  const simulateScan = () => {
    setIsScanning(true)
    haptic.medium()
    
    // Simulate AI processing
    setTimeout(() => {
      setIsScanning(false)
      haptic.success()
      // Navigate to add item with scanned data
      router.push('/dashboard/inventory/add?scanned=true')
    }, 3000)
  }

  const handleCameraCapture = () => {
    haptic.light()
    fileInputRef.current?.click()
  }

  const handleUpload = () => {
    haptic.light()
    fileInputRef.current?.click()
  }

  return (
    <>
      {/* Scan Modal Overlay */}
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Scan Items</h1>
              <p className="text-sm text-emerald-100">Best experience on your phone's camera.</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              haptic.light()
              router.back()
            }}
            className="text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
          {!scannedImage ? (
            /* Initial Scan Interface */
            <div className="space-y-6">
              {/* Camera Preview Area */}
              <div className="relative aspect-[4/3] bg-slate-800 rounded-2xl overflow-hidden border-2 border-dashed border-slate-600">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to Scan</h3>
                  <p className="text-slate-300 text-sm mb-6">
                    Take a photo or upload an image of your grocery items, receipts, or product labels
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    <Button
                      onClick={handleCameraCapture}
                      className="h-14 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white flex-col gap-1 shadow-lg"
                    >
                      <Camera className="w-6 h-6" />
                      <span className="text-sm font-semibold">Camera</span>
                    </Button>
                    
                    <Button
                      onClick={handleUpload}
                      variant="outline"
                      className="h-14 flex-col gap-1 border-2 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-semibold">Upload</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">AI Powered</p>
                  <p className="text-slate-400 text-xs">Smart detection</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                  <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-white font-semibold text-sm">Auto Recognition</p>
                  <p className="text-slate-400 text-xs">Name, qty, expiry</p>
                </div>
              </div>
            </div>
          ) : (
            /* Processing/Results Interface */
            <div className="space-y-6">
              {/* Scanned Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={scannedImage}
                  alt="Scanned item"
                  className="w-full h-64 object-cover"
                />
                {isScanning && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
                      <p className="font-bold text-lg mb-2">Analyzing Image...</p>
                      <p className="text-sm text-white/80">AI is identifying items</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Processing Steps */}
              {isScanning && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-100">AI Processing</p>
                      <p className="text-sm text-blue-200">Extracting item information...</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-emerald-500/20 rounded-xl p-3 text-center border border-emerald-500/30">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">1</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-100">Detecting</p>
                    </div>
                    <div className="bg-yellow-500/20 rounded-xl p-3 text-center border border-yellow-500/30">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">2</span>
                      </div>
                      <p className="text-xs font-semibold text-yellow-100">Reading</p>
                    </div>
                    <div className="bg-purple-500/20 rounded-xl p-3 text-center border border-purple-500/30">
                      <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">3</span>
                      </div>
                      <p className="text-xs font-semibold text-purple-100">Organizing</p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Results */}
              {!isScanning && ocrResult && (
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl p-6 border border-emerald-500/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">AI Suggestion</h3>
                      <p className="text-emerald-200 text-sm">Smart item detection complete</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-xl p-4">
                        <p className="text-emerald-300 text-sm mb-1">Name</p>
                        <p className="text-white font-bold text-lg">{ocrResult.name || 'Scanned Item'}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <p className="text-emerald-300 text-sm mb-1">Quantity</p>
                        <p className="text-white font-bold text-lg">{ocrResult.quantity || 1} {ocrResult.unit || 'piece'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/20 rounded-xl p-4">
                        <p className="text-emerald-300 text-sm mb-1">Category</p>
                        <p className="text-white font-bold text-lg">{ocrResult.category || 'Other'}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <p className="text-emerald-300 text-sm mb-1">Expiry Date</p>
                        <p className="text-white font-bold text-lg">{ocrResult.expiryDate || 'Not detected'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions - Event Listener Approach */}
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-[10000]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
          {scannedImage && !isScanning && ocrResult ? (
            <div className="p-4">
              <div className="flex gap-3 max-w-md mx-auto">
                {/* Retake Button */}
                <div 
                  ref={retakeButtonRef}
                  className="flex-1 h-14 bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
                >
                  <X className="w-5 h-5 pointer-events-none" />
                  <span className="pointer-events-none">Retake</span>
                </div>
                
                {/* Use Suggestion Button */}
                <div 
                  ref={useSuggestionButtonRef}
                  className="flex-1 h-14 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer select-none"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none', touchAction: 'manipulation' }}
                >
                  <Plus className="w-5 h-5 pointer-events-none" />
                  <span className="pointer-events-none">Use suggestion</span>
                </div>
              </div>
            </div>
          ) : !scannedImage ? (
            <div className="p-4 text-center">
              <p className="text-slate-400 text-sm mb-3">Supported formats: JPG, PNG, HEIC</p>
              <div 
                className="bg-slate-800 border border-slate-600 text-white hover:bg-slate-700 px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer inline-block select-none"
                onClick={() => {
                  console.log('❌ Cancel clicked!')
                  router.back()
                }}
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                Cancel
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  )
}