import { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_NUTRITION_ENTRIES,
  GET_NUTRITION_GOALS,
  GET_DAILY_NUTRITION_SUMMARY,
  GET_NUTRITION_TRENDS
} from '@/lib/graphql/queries';
import {
  CREATE_NUTRITION_ENTRY_MUTATION,
  UPDATE_NUTRITION_ENTRY_MUTATION,
  DELETE_NUTRITION_ENTRY_MUTATION,
  UPDATE_NUTRITION_GOALS_MUTATION,
  LOG_WATER_INTAKE_MUTATION,
  QUICK_LOG_FOOD_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export interface NutritionEntry {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionGoals {
  id: string;
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyFiber?: number;
  dailyWater?: number;
  weightGoal?: number;
  activityLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  water: number;
  entries: NutritionEntry[];
  waterIntakes: Array<{
    id: string;
    amount: number;
    time: string;
    createdAt: string;
  }>;
}

export interface CreateNutritionEntryInput {
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foodName: string;
  quantity: number;
  unit: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  notes?: string;
}

export interface UpdateNutritionGoalsInput {
  dailyCalories?: number;
  dailyProtein?: number;
  dailyCarbs?: number;
  dailyFat?: number;
  dailyFiber?: number;
  dailyWater?: number;
  weightGoal?: number;
  activityLevel?: string;
}

export function useNutrition() {
  const apolloClient = useApolloClient();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Queries
  const { 
    data: nutritionEntries, 
    loading: entriesLoading, 
    error: entriesError,
    refetch: refetchEntries
  } = useQuery(GET_NUTRITION_ENTRIES, {
    variables: {
      date: selectedDate.toISOString().split('T')[0]
    },
    errorPolicy: 'all'
  });

  const { 
    data: nutritionGoalsData, 
    loading: goalsLoading, 
    error: goalsError,
    refetch: refetchGoals
  } = useQuery(GET_NUTRITION_GOALS, {
    errorPolicy: 'all'
  });

  const { 
    data: dailySummaryData, 
    loading: summaryLoading, 
    error: summaryError,
    refetch: refetchSummary
  } = useQuery(GET_DAILY_NUTRITION_SUMMARY, {
    variables: {
      date: selectedDate.toISOString()
    },
    errorPolicy: 'all'
  });

  const { 
    data: trendsData, 
    loading: trendsLoading, 
    error: trendsError 
  } = useQuery(GET_NUTRITION_TRENDS, {
    variables: { days: 30 },
    errorPolicy: 'all'
  });

  // Mutations
  const [createNutritionEntry] = useMutation(CREATE_NUTRITION_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Nutrition entry added successfully');
      refetchEntries();
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to add nutrition entry: ${error.message}`);
    }
  });

  const [updateNutritionEntry] = useMutation(UPDATE_NUTRITION_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Nutrition entry updated successfully');
      refetchEntries();
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to update nutrition entry: ${error.message}`);
    }
  });

  const [deleteNutritionEntry] = useMutation(DELETE_NUTRITION_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Nutrition entry deleted successfully');
      refetchEntries();
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to delete nutrition entry: ${error.message}`);
    }
  });

  const [updateNutritionGoals] = useMutation(UPDATE_NUTRITION_GOALS_MUTATION, {
    onCompleted: () => {
      toast.success('Nutrition goals updated successfully');
      refetchGoals();
    },
    onError: (error) => {
      toast.error(`Failed to update nutrition goals: ${error.message}`);
    }
  });

  const [logWaterIntake] = useMutation(LOG_WATER_INTAKE_MUTATION, {
    onCompleted: () => {
      toast.success('Water intake logged successfully');
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to log water intake: ${error.message}`);
    }
  });

  const [quickLogFood] = useMutation(QUICK_LOG_FOOD_MUTATION, {
    onCompleted: () => {
      toast.success('Food logged successfully');
      refetchEntries();
      refetchSummary();
    },
    onError: (error) => {
      toast.error(`Failed to log food: ${error.message}`);
    }
  });

  // Helper functions
  const addNutritionEntry = async (input: CreateNutritionEntryInput) => {
    try {
      // Convert date string to proper DateTime format
      const processedInput = { ...input };
      
      // If date is provided as date-only string, convert to DateTime
      if (processedInput.date && typeof processedInput.date === 'string') {
        // If it's just a date (YYYY-MM-DD), add time to make it a valid DateTime
        if (processedInput.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          processedInput.date = new Date(processedInput.date + 'T12:00:00.000Z').toISOString();
        }
      }
      
      await createNutritionEntry({
        variables: { input: processedInput }
      });
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
    }
  };

  const editNutritionEntry = async (id: string, input: Partial<CreateNutritionEntryInput>) => {
    try {
      await updateNutritionEntry({
        variables: { id, input }
      });
    } catch (error) {
      console.error('Error updating nutrition entry:', error);
    }
  };

  const removeNutritionEntry = async (id: string) => {
    try {
      await deleteNutritionEntry({
        variables: { id }
      });
    } catch (error) {
      console.error('Error deleting nutrition entry:', error);
    }
  };

  const updateGoals = async (input: UpdateNutritionGoalsInput) => {
    try {
      await updateNutritionGoals({
        variables: { input }
      });
    } catch (error) {
      console.error('Error updating nutrition goals:', error);
    }
  };

  const addWaterIntake = async (amount: number, time?: Date) => {
    try {
      await logWaterIntake({
        variables: { 
          amount, 
          time: time?.toISOString() || new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error logging water intake:', error);
    }
  };

  const quickAddFood = async (foodName: string, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK', date?: Date) => {
    try {
      await quickLogFood({
        variables: { 
          foodName, 
          mealType, 
          date: (date || selectedDate).toISOString()
        }
      });
    } catch (error) {
      console.error('Error quick logging food:', error);
    }
  };

  // Calculate progress percentages
  const calculateProgress = (current: number, goal: number) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressData = () => {
    const summary = dailySummaryData?.dailyNutritionSummary;
    const goals = nutritionGoalsData?.nutritionGoals;

    if (!summary || !goals) return null;

    return {
      calories: {
        current: summary.calories || 0,
        goal: goals.dailyCalories || 2000,
        progress: calculateProgress(summary.calories || 0, goals.dailyCalories || 2000)
      },
      protein: {
        current: summary.protein || 0,
        goal: goals.dailyProtein || 150,
        progress: calculateProgress(summary.protein || 0, goals.dailyProtein || 150)
      },
      carbs: {
        current: summary.carbs || 0,
        goal: goals.dailyCarbs || 250,
        progress: calculateProgress(summary.carbs || 0, goals.dailyCarbs || 250)
      },
      fat: {
        current: summary.fat || 0,
        goal: goals.dailyFat || 65,
        progress: calculateProgress(summary.fat || 0, goals.dailyFat || 65)
      },
      fiber: {
        current: summary.fiber || 0,
        goal: goals.dailyFiber || 25,
        progress: calculateProgress(summary.fiber || 0, goals.dailyFiber || 25)
      },
      water: {
        current: summary.water || 0,
        goal: goals.dailyWater || 2000,
        progress: calculateProgress(summary.water || 0, goals.dailyWater || 2000)
      }
    };
  };

  return {
    // Data
    entries: nutritionEntries?.nutritionEntries || [],
    goals: nutritionGoalsData?.nutritionGoals,
    dailySummary: dailySummaryData?.dailyNutritionSummary,
    trends: trendsData?.nutritionTrends || [],
    progressData: getProgressData(),
    
    // Loading states
    loading: entriesLoading || goalsLoading || summaryLoading,
    entriesLoading,
    goalsLoading,
    summaryLoading,
    trendsLoading,
    
    // Error states
    error: entriesError || goalsError || summaryError || trendsError,
    entriesError,
    goalsError,
    summaryError,
    trendsError,
    
    // Date management
    selectedDate,
    setSelectedDate,
    
    // Actions
    addNutritionEntry,
    editNutritionEntry,
    removeNutritionEntry,
    updateGoals,
    addWaterIntake,
    quickAddFood,
    
    // Refetch functions
    refetchEntries,
    refetchGoals,
    refetchSummary
  };
}