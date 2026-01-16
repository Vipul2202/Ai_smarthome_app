"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Loader2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHapticFeedback } from '@/lib/haptics'
import { VoiceCommandProcessor, type VoiceCommand } from '@/lib/voice-commands'



interface VoiceInputProps {
  isOpen: boolean
  onClose: () => void
  onCommand: (command: VoiceCommand) => void
}

export function VoiceInput({ isOpen, onClose, onCommand }: VoiceInputProps) {
  const haptic = useHapticFeedback()
  const recognitionRef = useRef<any>(null)
  
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<VoiceCommand | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
        haptic.light()
      }
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        setTranscript(finalTranscript || interimTranscript)
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript)
        }
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setError(`Speech recognition failed: ${event.error}`)
        setIsListening(false)
        haptic.error()
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setResult(null)
      setError(null)
      recognitionRef.current.start()
    } else {
      setError('Speech recognition not supported in this browser')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const processVoiceCommand = async (text: string) => {
    setIsProcessing(true)
    haptic.medium()
    
    try {
      // Parse voice command using AI
      const command = await parseVoiceCommand(text)
      setResult(command)
      haptic.success()
    } catch (error) {
      console.error('Voice command processing failed:', error)
      setError('Could not understand the command. Please try again.')
      haptic.error()
    } finally {
      setIsProcessing(false)
    }
  }

  const parseVoiceCommand = async (text: string): Promise<VoiceCommand> => {
    return VoiceCommandProcessor.parseCommand(text)
  }



  const handleUseCommand = () => {
    if (result) {
      onCommand(result)
      handleClose()
    }
  }

  const handleClose = () => {
    stopListening()
    setTranscript('')
    setResult(null)
    setError(null)
    setIsProcessing(false)
    onClose()
  }

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'add_to_shopping': return 'Add to Shopping List'
      case 'add_to_inventory': return 'Add to Inventory'
      case 'log_usage': return 'Log Usage'
      case 'create_reminder': return 'Create Reminder'
      case 'check_stock': return 'Check Stock'
      default: return 'Unknown Command'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'add_to_shopping': return 'bg-blue-500'
      case 'add_to_inventory': return 'bg-green-500'
      case 'log_usage': return 'bg-orange-500'
      case 'create_reminder': return 'bg-purple-500'
      case 'check_stock': return 'bg-indigo-500'
      default: return 'bg-gray-500'
    }
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
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">Voice Assistant</h3>
                      <p className="text-[9px] sm:text-xs text-muted-foreground">Speak your command</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="rounded-full h-7 w-7 sm:h-9 sm:w-9"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>

                {/* Voice Input Interface */}
                {!result && !error && (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Microphone Button */}
                    <div className="text-center">
                      <motion.button
                        className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all ${
                          isListening 
                            ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-lg shadow-red-500/40' 
                            : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/40'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                        onClick={isListening ? stopListening : startListening}
                      >
                        {isListening ? (
                          <MicOff className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        ) : (
                          <Mic className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        )}
                      </motion.button>
                      
                      <p className="text-[10px] sm:text-sm font-medium mb-1">
                        {isListening ? 'Listening...' : 'Tap to speak'}
                      </p>
                      <p className="text-[9px] sm:text-xs text-muted-foreground">
                        {isListening ? 'Say your command now' : 'Try: "Add milk to shopping list"'}
                      </p>
                    </div>

                    {/* Live Transcript */}
                    {transcript && (
                      <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
                          <Volume2 className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                          <span className="text-[10px] sm:text-sm font-medium">You said:</span>
                        </div>
                        <p className="text-[10px] sm:text-sm italic">"{transcript}"</p>
                        
                        {isProcessing && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 text-blue-600">
                            <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                            <span className="text-[9px] sm:text-sm">Processing command...</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Example Commands */}
                    <div className="space-y-1.5 sm:space-y-2">
                      <p className="text-[10px] sm:text-sm font-medium">Example commands:</p>
                      <div className="space-y-0.5 sm:space-y-1 text-[9px] sm:text-xs text-muted-foreground">
                        <p>• "Add 2 liters of milk to shopping list"</p>
                        <p>• "Add rice to inventory"</p>
                        <p>• "I used 1 cup of flour"</p>
                        <p>• "Remind me to buy eggs"</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Command Result */}
                {result && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-green-700 dark:text-green-300">Command Understood!</h4>
                    </div>

                    <div className="space-y-3 p-4 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Action:</span>
                        <Badge className={`${getActionColor(result.action)} text-white border-0`}>
                          {getActionDescription(result.action)}
                        </Badge>
                      </div>
                      
                      {result.item && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Item:</span>
                          <span className="text-sm font-medium">{result.item}</span>
                        </div>
                      )}
                      
                      {result.quantity && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Quantity:</span>
                          <span className="text-sm">{result.quantity} {result.unit}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Confidence:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{Math.round(result.confidence * 100)}%</span>
                          <Badge 
                            variant={VoiceCommandProcessor.getConfidenceLevel(result.confidence) === 'high' ? 'default' : 
                                   VoiceCommandProcessor.getConfidenceLevel(result.confidence) === 'medium' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {VoiceCommandProcessor.getConfidenceLevel(result.confidence)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions for low confidence */}
                    {result.confidence < 0.7 && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <h5 className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">Suggestions:</h5>
                        <div className="space-y-1">
                          {VoiceCommandProcessor.getSuggestions(result).map((suggestion, index) => (
                            <p key={index} className="text-xs text-amber-600 dark:text-amber-400">
                              {suggestion}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setResult(null)}
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                      <Button
                        onClick={handleUseCommand}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        Execute Command
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                      </div>
                      <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Voice Recognition Failed</h4>
                      <p className="text-sm text-muted-foreground">{error}</p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          setError(null)
                          startListening()
                        }}
                        className="flex-1"
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}