"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  Zap, 
  Package, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHapticFeedback } from '@/lib/haptics'

interface BarcodeResult {
  code: string
  format: string
  product?: {
    name: string
    brand: string
    category: string
    image?: string
    nutrition?: any
  }
}

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onResult: (result: BarcodeResult) => void
}

export function BarcodeScanner({ isOpen, onClose, onResult }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const haptic = useHapticFeedback()
  
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanResult, setScanResult] = useState<BarcodeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize camera
  useEffect(() => {
    if (isOpen && !stream) {
      startCamera()
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
      setIsScanning(true)
    } catch (err) {
      console.error('Camera access failed:', err)
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsProcessing(true)
    haptic.medium()

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to blob for API call
      canvas.toBlob(async (blob) => {
        if (!blob) return

        try {
          const formData = new FormData()
          formData.append('file', blob, 'barcode-scan.jpg')

          // Call barcode scanning API
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '')}/scan/barcode`, {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('Barcode scanning failed')
          }

          const result = await response.json()
          
          if (result.success && result.barcode) {
            // Look up product information
            const productInfo = await lookupProduct(result.barcode)
            
            const scanResult: BarcodeResult = {
              code: result.barcode,
              format: result.format || 'Unknown',
              product: productInfo || undefined
            }
            
            setScanResult(scanResult)
            haptic.success()
          } else {
            throw new Error('No barcode detected in image')
          }
        } catch (error) {
          console.error('Barcode processing failed:', error)
          setError('Could not detect barcode. Try again with better lighting.')
          haptic.error()
        } finally {
          setIsProcessing(false)
        }
      }, 'image/jpeg', 0.9)
    } catch (error) {
      console.error('Capture failed:', error)
      setError('Failed to capture image')
      setIsProcessing(false)
      haptic.error()
    }
  }

  const lookupProduct = async (barcode: string) => {
    try {
      // Try multiple product databases
      const databases = [
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`
      ]

      for (const url of databases) {
        try {
          const response = await fetch(url)
          const data = await response.json()
          
          if (url.includes('openfoodfacts')) {
            if (data.status === 1 && data.product) {
              return {
                name: data.product.product_name || 'Unknown Product',
                brand: data.product.brands || 'Unknown Brand',
                category: data.product.categories || 'Food',
                image: data.product.image_url,
                nutrition: data.product.nutriments
              }
            }
          } else if (url.includes('upcitemdb')) {
            if (data.code === 'OK' && data.items?.length > 0) {
              const item = data.items[0]
              return {
                name: item.title || 'Unknown Product',
                brand: item.brand || 'Unknown Brand',
                category: item.category || 'Product',
                image: item.images?.[0]
              }
            }
          }
        } catch (err) {
          console.log(`Database ${url} failed:`, err)
          continue
        }
      }
      
      // Fallback to basic info
      return {
        name: `Product ${barcode}`,
        brand: 'Unknown Brand',
        category: 'Product'
      }
    } catch (error) {
      console.error('Product lookup failed:', error)
      return null
    }
  }

  const handleUseResult = () => {
    if (scanResult) {
      onResult(scanResult)
      handleClose()
    }
  }

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsScanning(false)
    setScanResult(null)
    setError(null)
    setIsProcessing(false)
    onClose()
  }

  const handleRetry = () => {
    setScanResult(null)
    setError(null)
    setIsProcessing(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            className="fixed inset-4 z-50 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="w-full max-w-md bg-background/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-3 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Barcode Scanner</h3>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Scan product barcode</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="rounded-full h-6 w-6 sm:h-8 sm:w-8"
                  >
                    <X className="w-3 h-3 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                {/* Camera View */}
                {isScanning && !scanResult && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      
                      {/* Scanning Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-28 sm:w-48 sm:h-32 border-2 border-white/50 rounded-lg relative">
                          <div className="absolute top-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-l-2 border-blue-500 rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-t-2 border-r-2 border-blue-500 rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-l-2 border-blue-500 rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-6 sm:h-6 border-b-2 border-r-2 border-blue-500 rounded-br-lg" />
                          
                          {/* Scanning Line */}
                          <motion.div
                            className="absolute left-0 right-0 h-0.5 bg-blue-500 shadow-lg shadow-blue-500/50"
                            animate={{ y: [0, 100, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          />
                        </div>
                      </div>
                      
                      {/* Processing Overlay */}
                      {isProcessing && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-center text-white">
                            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-2" />
                            <p className="text-[10px] sm:text-sm">Processing barcode...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-2 sm:space-y-3">
                      <p className="text-[10px] sm:text-sm text-muted-foreground">
                        Position the barcode within the frame
                      </p>
                      
                      <Button
                        onClick={captureAndScan}
                        disabled={isProcessing}
                        className="w-full h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-[10px] sm:text-sm"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Scan Barcode
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Scan Result */}
                {scanResult && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-green-700 dark:text-green-300 text-sm sm:text-base">Barcode Detected!</h4>
                    </div>

                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-sm text-muted-foreground">Barcode:</span>
                        <Badge variant="secondary" className="text-[9px] sm:text-xs">{scanResult.code}</Badge>
                      </div>
                      
                      {scanResult.product && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">Product:</span>
                            <span className="text-[10px] sm:text-sm font-medium">{scanResult.product.name}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">Brand:</span>
                            <span className="text-[10px] sm:text-sm">{scanResult.product.brand}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] sm:text-sm text-muted-foreground">Category:</span>
                            <span className="text-[10px] sm:text-sm">{scanResult.product.category}</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={handleRetry}
                        className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                      >
                        Scan Again
                      </Button>
                      <Button
                        onClick={handleUseResult}
                        className="flex-1 h-8 sm:h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-[10px] sm:text-sm"
                      >
                        Use Product
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                        <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 text-sm sm:text-base">Scanning Failed</h4>
                      <p className="text-[10px] sm:text-sm text-muted-foreground">{error}</p>
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setError(null)
                          startCamera()
                        }}
                        className="flex-1 h-8 sm:h-10 text-[10px] sm:text-sm"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}

                {/* Hidden canvas for image capture */}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}