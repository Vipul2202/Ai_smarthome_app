import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_TIMERS,
  GET_ACTIVE_TIMERS,
  GET_TIMER,
  GET_TIMER_PRESETS
} from '@/lib/graphql/queries';
import {
  CREATE_TIMER_MUTATION,
  UPDATE_TIMER_MUTATION,
  DELETE_TIMER_MUTATION,
  START_TIMER_MUTATION,
  PAUSE_TIMER_MUTATION,
  STOP_TIMER_MUTATION,
  RESET_TIMER_MUTATION,
  CREATE_TIMER_FROM_PRESET_MUTATION,
  BULK_STOP_TIMERS_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export interface KitchenTimer {
  id: string;
  name: string;
  duration: number; // in seconds
  category: 'COOKING' | 'BAKING' | 'STEAMING' | 'BOILING' | 'MARINATING' | 'RESTING' | 'CUSTOM';
  isActive: boolean;
  startedAt?: string;
  pausedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimerPreset {
  name: string;
  duration: number;
  category: 'COOKING' | 'BAKING' | 'STEAMING' | 'BOILING' | 'MARINATING' | 'RESTING' | 'CUSTOM';
}

export interface CreateTimerInput {
  name: string;
  duration: number;
  category: 'COOKING' | 'BAKING' | 'STEAMING' | 'BOILING' | 'MARINATING' | 'RESTING' | 'CUSTOM';
  notes?: string;
}

export interface UpdateTimerInput {
  name?: string;
  duration?: number;
  category?: 'COOKING' | 'BAKING' | 'STEAMING' | 'BOILING' | 'MARINATING' | 'RESTING' | 'CUSTOM';
  notes?: string;
}

export interface TimerState {
  id: string;
  name: string;
  duration: number;
  category: string;
  isActive: boolean;
  isPaused: boolean;
  timeRemaining: number;
  progress: number;
  startedAt?: Date;
  pausedAt?: Date;
  completedAt?: Date;
}

export function useTimer() {
  const apolloClient = useApolloClient();
  const [localTimers, setLocalTimers] = useState<Map<string, TimerState>>(new Map());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Queries
  const { 
    data: timersData, 
    loading: timersLoading, 
    error: timersError,
    refetch: refetchTimers
  } = useQuery(GET_TIMERS, {
    variables: selectedCategory ? { isActive: undefined } : {},
    errorPolicy: 'all'
  });

  const { 
    data: activeTimersData, 
    loading: activeLoading, 
    error: activeError,
    refetch: refetchActiveTimers
  } = useQuery(GET_ACTIVE_TIMERS, {
    errorPolicy: 'all',
    pollInterval: 1000 // Poll every second for active timers
  });

  const { 
    data: presetsData, 
    loading: presetsLoading, 
    error: presetsError 
  } = useQuery(GET_TIMER_PRESETS, {
    errorPolicy: 'all'
  });

  // Mutations
  const [createTimer] = useMutation(CREATE_TIMER_MUTATION, {
    onCompleted: () => {
      toast.success('Timer created successfully');
      refetchTimers();
    },
    onError: (error) => {
      toast.error(`Failed to create timer: ${error.message}`);
    }
  });

  const [updateTimer] = useMutation(UPDATE_TIMER_MUTATION, {
    onCompleted: () => {
      toast.success('Timer updated successfully');
      refetchTimers();
    },
    onError: (error) => {
      toast.error(`Failed to update timer: ${error.message}`);
    }
  });

  const [deleteTimer] = useMutation(DELETE_TIMER_MUTATION, {
    onCompleted: () => {
      toast.success('Timer deleted successfully');
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to delete timer: ${error.message}`);
    }
  });

  const [startTimer] = useMutation(START_TIMER_MUTATION, {
    onCompleted: () => {
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to start timer: ${error.message}`);
    }
  });

  const [pauseTimer] = useMutation(PAUSE_TIMER_MUTATION, {
    onCompleted: () => {
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to pause timer: ${error.message}`);
    }
  });

  const [stopTimer] = useMutation(STOP_TIMER_MUTATION, {
    onCompleted: () => {
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to stop timer: ${error.message}`);
    }
  });

  const [resetTimer] = useMutation(RESET_TIMER_MUTATION, {
    onCompleted: () => {
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to reset timer: ${error.message}`);
    }
  });

  const [createFromPreset] = useMutation(CREATE_TIMER_FROM_PRESET_MUTATION, {
    onCompleted: () => {
      toast.success('Timer created from preset');
      refetchTimers();
    },
    onError: (error) => {
      toast.error(`Failed to create timer from preset: ${error.message}`);
    }
  });

  const [bulkStopTimers] = useMutation(BULK_STOP_TIMERS_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Stopped ${data.bulkStopTimers} timers`);
      refetchTimers();
      refetchActiveTimers();
    },
    onError: (error) => {
      toast.error(`Failed to stop timers: ${error.message}`);
    }
  });

  // Timer state management
  const updateLocalTimer = useCallback((timer: KitchenTimer) => {
    const now = new Date();
    let timeRemaining = timer.duration;
    let progress = 0;
    let isPaused = false;

    if (timer.isActive && timer.startedAt) {
      const startTime = new Date(timer.startedAt);
      let elapsedTime = 0;

      if (timer.pausedAt) {
        // Timer is paused
        elapsedTime = new Date(timer.pausedAt).getTime() - startTime.getTime();
        isPaused = true;
      } else {
        // Timer is running
        elapsedTime = now.getTime() - startTime.getTime();
      }

      const elapsedSeconds = Math.floor(elapsedTime / 1000);
      timeRemaining = Math.max(0, timer.duration - elapsedSeconds);
      progress = timer.duration > 0 ? ((timer.duration - timeRemaining) / timer.duration) * 100 : 0;

      // Check if timer completed
      if (timeRemaining === 0 && !timer.completedAt) {
        // Timer completed, show notification
        toast.success(`Timer "${timer.name}" completed!`, {
          duration: 5000,
        });
        
        // Play notification sound if available
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Timer Completed: ${timer.name}`, {
            body: `Your ${timer.category.toLowerCase()} timer has finished.`,
            icon: '/favicon.ico'
          });
        }
      }
    }

    const timerState: TimerState = {
      id: timer.id,
      name: timer.name,
      duration: timer.duration,
      category: timer.category,
      isActive: timer.isActive,
      isPaused,
      timeRemaining,
      progress,
      startedAt: timer.startedAt ? new Date(timer.startedAt) : undefined,
      pausedAt: timer.pausedAt ? new Date(timer.pausedAt) : undefined,
      completedAt: timer.completedAt ? new Date(timer.completedAt) : undefined
    };

    setLocalTimers(prev => new Map(prev.set(timer.id, timerState)));
  }, []);

  // Update local timer states
  useEffect(() => {
    const allTimers = [...(timersData?.timers || []), ...(activeTimersData?.activeTimers || [])];
    const uniqueTimers = allTimers.filter((timer, index, self) => 
      index === self.findIndex(t => t.id === timer.id)
    );

    uniqueTimers.forEach(updateLocalTimer);
  }, [timersData, activeTimersData, updateLocalTimer]);

  // Update active timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const activeTimers = Array.from(localTimers.values()).filter(timer => 
        timer.isActive && !timer.isPaused && timer.timeRemaining > 0
      );

      activeTimers.forEach(timer => {
        const dbTimer = timersData?.timers?.find((t: KitchenTimer) => t.id === timer.id) ||
                       activeTimersData?.activeTimers?.find((t: KitchenTimer) => t.id === timer.id);
        if (dbTimer) {
          updateLocalTimer(dbTimer);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [localTimers, timersData, activeTimersData, updateLocalTimer]);

  // Helper functions
  const addTimer = async (input: CreateTimerInput) => {
    try {
      await createTimer({
        variables: { input }
      });
    } catch (error) {
      console.error('Error creating timer:', error);
    }
  };

  const editTimer = async (id: string, input: UpdateTimerInput) => {
    try {
      await updateTimer({
        variables: { id, input }
      });
    } catch (error) {
      console.error('Error updating timer:', error);
    }
  };

  const removeTimer = async (id: string) => {
    try {
      await deleteTimer({
        variables: { id }
      });
      setLocalTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    } catch (error) {
      console.error('Error deleting timer:', error);
    }
  };

  const startTimerById = async (id: string) => {
    try {
      await startTimer({
        variables: { id }
      });
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const pauseTimerById = async (id: string) => {
    try {
      await pauseTimer({
        variables: { id }
      });
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  };

  const stopTimerById = async (id: string) => {
    try {
      await stopTimer({
        variables: { id }
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  const resetTimerById = async (id: string) => {
    try {
      await resetTimer({
        variables: { id }
      });
    } catch (error) {
      console.error('Error resetting timer:', error);
    }
  };

  const createTimerFromPreset = async (presetName: string, customName?: string) => {
    try {
      await createFromPreset({
        variables: { presetName, customName }
      });
    } catch (error) {
      console.error('Error creating timer from preset:', error);
    }
  };

  const stopAllActiveTimers = async () => {
    const activeTimerIds = Array.from(localTimers.values())
      .filter(timer => timer.isActive)
      .map(timer => timer.id);

    if (activeTimerIds.length === 0) {
      toast.info('No active timers to stop');
      return;
    }

    try {
      await bulkStopTimers({
        variables: { timerIds: activeTimerIds }
      });
    } catch (error) {
      console.error('Error stopping all timers:', error);
    }
  };

  // Format time helper
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get timer statistics
  const getTimerStats = () => {
    const allTimers = Array.from(localTimers.values());
    const activeCount = allTimers.filter(timer => timer.isActive).length;
    const completedToday = timersData?.timers?.filter((timer: KitchenTimer) => {
      if (!timer.completedAt) return false;
      const today = new Date();
      const completed = new Date(timer.completedAt);
      return completed.toDateString() === today.toDateString();
    }).length || 0;

    return {
      total: allTimers.length,
      active: activeCount,
      completedToday
    };
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled for timer alerts');
      }
    }
  };

  return {
    // Data
    timers: Array.from(localTimers.values()),
    activeTimers: Array.from(localTimers.values()).filter(timer => timer.isActive),
    presets: presetsData?.timerPresets || [],
    timerStats: getTimerStats(),
    
    // Loading states
    loading: timersLoading || activeLoading || presetsLoading,
    timersLoading,
    activeLoading,
    presetsLoading,
    
    // Error states
    error: timersError || activeError || presetsError,
    timersError,
    activeError,
    presetsError,
    
    // Filters
    selectedCategory,
    setSelectedCategory,
    
    // Actions
    addTimer,
    editTimer,
    removeTimer,
    startTimerById,
    pauseTimerById,
    stopTimerById,
    resetTimerById,
    createTimerFromPreset,
    stopAllActiveTimers,
    
    // Utilities
    formatTime,
    requestNotificationPermission,
    
    // Refetch functions
    refetchTimers,
    refetchActiveTimers
  };
}