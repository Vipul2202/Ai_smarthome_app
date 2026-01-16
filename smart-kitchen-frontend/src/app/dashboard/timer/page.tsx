"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft,
  Timer,
  Play,
  Pause,
  Square,
  Plus,
  Trash2,
  Clock,
  ChefHat,
  Coffee,
  Utensils,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useHapticFeedback } from '@/lib/haptics'

interface KitchenTimer {
  id: string
  name: string
  duration: number // in seconds
  remaining: number // in seconds
  isRunning: boolean
  isCompleted: boolean
  type: 'cooking' | 'baking' | 'steaming' | 'boiling' | 'custom'
  color: string
  icon: React.ComponentType<{ className?: string }>
}

const timerPresets = [
  { name: 'Boil Eggs', duration: 360, type: 'boiling' as const, icon: '🥚' },
  { name: 'Steam Rice', duration: 900, type: 'steaming' as const, icon: '🍚' },
  { name: 'Brew Tea', duration: 180, type: 'custom' as const, icon: '🍵' },
  { name: 'Bake Cookies', duration: 720, type: 'baking' as const, icon: '🍪' },
  { name: 'Marinate Chicken', duration: 1800, type: 'custom' as const, icon: '🍗' },
  { name: 'Proof Dough', duration: 2700, type: 'baking' as const, icon: '🍞' }
]

const timerTypes = [
  { id: 'cooking', label: 'Cooking', icon: ChefHat, color: 'bg-orange-500' },
  { id: 'baking', label: 'Baking', icon: Coffee, color: 'bg-amber-500' },
  { id: 'steaming', label: 'Steaming', icon: Utensils, color: 'bg-blue-500' },
  { id: 'boiling', label: 'Boiling', icon: Clock, color: 'bg-red-500' },
  { id: 'custom', label: 'Custom', icon: Timer, color: 'bg-purple-500' }
]

export default function KitchenTimerPage() {
  const router = useRouter()
  const haptic = useHapticFeedback()
  const [timers, setTimers] = useState<KitchenTimer[]>([])
  const [showAddTimer, setShowAddTimer] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer form state
  const [newTimer, setNewTimer] = useState({
    name: '',
    hours: 0,
    minutes: 5,
    seconds: 0,
    type: 'cooking' as const
  })

  useEffect(() => {
    // Initialize audio
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/sounds/timer-complete.mp3')
    }

    // Start interval for running timers
    intervalRef.current = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (!timer.isRunning || timer.remaining <= 0) return timer

          const newRemaining = timer.remaining - 1

          if (newRemaining <= 0) {
            // Timer completed
            if (soundEnabled && audioRef.current) {
              audioRef.current.play().catch(console.error)
            }
            haptic.success()
            
            return {
              ...timer,
              remaining: 0,
              isRunning: false,
              isCompleted: true
            }
          }

          return {
            ...timer,
            remaining: newRemaining
          }
        })
      )
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [soundEnabled, haptic])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const addTimer = () => {
    const totalSeconds = (newTimer.hours * 3600) + (newTimer.minutes * 60) + newTimer.seconds
    
    if (totalSeconds <= 0) return

    const timerType = timerTypes.find(t => t.id === newTimer.type)!
    
    const timer: KitchenTimer = {
      id: Date.now().toString(),
      name: newTimer.name || `${timerType.label} Timer`,
      duration: totalSeconds,
      remaining: totalSeconds,
      isRunning: false,
      isCompleted: false,
      type: newTimer.type,
      color: timerType.color,
      icon: timerType.icon
    }

    setTimers(prev => [...prev, timer])
    setShowAddTimer(false)
    setNewTimer({ name: '', hours: 0, minutes: 5, seconds: 0, type: 'cooking' })
    haptic.medium()
  }

  const addPresetTimer = (preset: typeof timerPresets[0]) => {
    const timerType = timerTypes.find(t => t.id === preset.type)!
    
    const timer: KitchenTimer = {
      id: Date.now().toString(),
      name: preset.name,
      duration: preset.duration,
      remaining: preset.duration,
      isRunning: false,
      isCompleted: false,
      type: preset.type,
      color: timerType.color,
      icon: timerType.icon
    }

    setTimers(prev => [...prev, timer])
    haptic.medium()
  }

  const toggleTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isRunning: !timer.isRunning, isCompleted: false }
          : timer
      )
    )
    haptic.light()
  }

  const stopTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isRunning: false, remaining: timer.duration, isCompleted: false }
          : timer
      )
    )
    haptic.light()
  }

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id))
    haptic.light()
  }

  const getProgress = (timer: KitchenTimer) => {
    return ((timer.duration - timer.remaining) / timer.duration) * 100
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="section-spacing bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950/30"
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
            <Timer className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            Kitchen Timers
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground">Multiple cooking timers for perfect timing</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            haptic.light()
            setSoundEnabled(!soundEnabled)
          }}
          className="mobile-btn-sm"
        >
          {soundEnabled ? (
            <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />
          ) : (
            <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />
          )}
        </Button>
        <Button
          size="sm"
          className="mobile-btn-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          onClick={() => {
            haptic.medium()
            setShowAddTimer(true)
          }}
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
          Add Timer
        </Button>
      </div>

      {/* Quick Presets */}
      <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
        <CardHeader className="card-header-padding">
          <CardTitle className="text-sm sm:text-lg">Quick Presets</CardTitle>
        </CardHeader>
        <CardContent className="card-content-padding">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {timerPresets.map((preset, index) => (
              <motion.div
                key={preset.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full h-auto p-2 sm:p-3 flex flex-col items-center gap-1 sm:gap-2"
                  onClick={() => addPresetTimer(preset)}
                >
                  <span className="text-lg sm:text-xl">{preset.icon}</span>
                  <span className="text-[9px] sm:text-xs font-medium">{preset.name}</span>
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                    {formatTime(preset.duration)}
                  </span>
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Timers */}
      <AnimatePresence>
        {timers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="subsection-spacing"
          >
            {timers.map((timer, index) => {
              const Icon = timer.icon
              const progress = getProgress(timer)
              
              return (
                <motion.div
                  key={timer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl ${timer.isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}>
                    <CardContent className="card-content-padding">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${timer.color} flex items-center justify-center text-white shadow-lg`}>
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-xs sm:text-sm truncate">{timer.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-lg sm:text-2xl font-mono font-bold ${
                              timer.isCompleted ? 'text-green-600' : 
                              timer.remaining <= 60 ? 'text-red-600' : 'text-foreground'
                            }`}>
                              {formatTime(timer.remaining)}
                            </span>
                            {timer.isCompleted && (
                              <Badge className="bg-green-500 text-white text-[8px] sm:text-[9px]">
                                Complete!
                              </Badge>
                            )}
                            {timer.isRunning && (
                              <Badge className="bg-blue-500 text-white text-[8px] sm:text-[9px] animate-pulse">
                                Running
                              </Badge>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="w-full bg-muted rounded-full h-1 sm:h-1.5 mt-2">
                            <motion.div
                              className={`h-full rounded-full ${
                                timer.isCompleted ? 'bg-green-500' : 
                                timer.remaining <= 60 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTimer(timer.id)}
                            className="mobile-btn-sm"
                            disabled={timer.isCompleted}
                          >
                            {timer.isRunning ? (
                              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => stopTimer(timer.id)}
                            className="mobile-btn-sm"
                          >
                            <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteTimer(timer.id)}
                            className="mobile-btn-sm text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Timer Form */}
      <AnimatePresence>
        {showAddTimer && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
              <CardHeader className="card-header-padding">
                <CardTitle className="text-sm sm:text-lg">Add Custom Timer</CardTitle>
              </CardHeader>
              <CardContent className="card-content-padding">
                <div className="subsection-spacing">
                  <div>
                    <Label htmlFor="timer-name" className="text-[10px] sm:text-sm">Timer Name (Optional)</Label>
                    <Input
                      id="timer-name"
                      value={newTimer.name}
                      onChange={(e) => setNewTimer(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Pasta Cooking"
                      className="mt-1 mobile-input"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] sm:text-sm">Timer Type</Label>
                    <Select 
                      value={newTimer.type} 
                      onValueChange={(value: any) => setNewTimer(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger className="mt-1 mobile-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timerTypes.map(type => {
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

                  <div>
                    <Label className="text-[10px] sm:text-sm">Duration</Label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-1">
                      <div>
                        <Label htmlFor="hours" className="text-[9px] sm:text-xs text-muted-foreground">Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          min="0"
                          max="23"
                          value={newTimer.hours}
                          onChange={(e) => setNewTimer(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                          className="mobile-input text-center"
                        />
                      </div>
                      <div>
                        <Label htmlFor="minutes" className="text-[9px] sm:text-xs text-muted-foreground">Minutes</Label>
                        <Input
                          id="minutes"
                          type="number"
                          min="0"
                          max="59"
                          value={newTimer.minutes}
                          onChange={(e) => setNewTimer(prev => ({ ...prev, minutes: parseInt(e.target.value) || 0 }))}
                          className="mobile-input text-center"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seconds" className="text-[9px] sm:text-xs text-muted-foreground">Seconds</Label>
                        <Input
                          id="seconds"
                          type="number"
                          min="0"
                          max="59"
                          value={newTimer.seconds}
                          onChange={(e) => setNewTimer(prev => ({ ...prev, seconds: parseInt(e.target.value) || 0 }))}
                          className="mobile-input text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        haptic.light()
                        setShowAddTimer(false)
                      }}
                      className="flex-1 mobile-btn"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={addTimer}
                      className="flex-1 mobile-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      disabled={(newTimer.hours + newTimer.minutes + newTimer.seconds) <= 0}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Add Timer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {timers.length === 0 && !showAddTimer && (
        <Card className="bg-white dark:bg-slate-900 border border-gray-200/40 dark:border-slate-700/40 shadow-xl">
          <CardContent className="card-content-padding text-center">
            <Timer className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">No Active Timers</h3>
            <p className="text-[10px] sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              Add a timer to keep track of your cooking times
            </p>
            <Button
              onClick={() => {
                haptic.medium()
                setShowAddTimer(true)
              }}
              className="mobile-btn bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Add Your First Timer
            </Button>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}