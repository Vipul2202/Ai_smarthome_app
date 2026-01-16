import { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_MEAL_PLANS,
  GET_WEEKLY_MEAL_PLAN,
  GET_MEAL_PLAN_TEMPLATES
} from '@/lib/graphql/queries';
import {
  CREATE_MEAL_PLAN_MUTATION,
  UPDATE_MEAL_PLAN_MUTATION,
  DELETE_MEAL_PLAN_MUTATION,
  GENERATE_MEAL_PLAN_FROM_TEMPLATE_MUTATION,
  GENERATE_SHOPPING_LIST_FROM_MEAL_PLAN_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export interface MealPlan {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipeId?: string;
  recipeName?: string;
  servings?: number;
  calories?: number;
  prepTime?: number;
  notes?: string;
  isCompleted: boolean;
  kitchenId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  meals: any[];
  duration?: number;
  isPublic: boolean;
  createdAt: string;
}

export interface CreateMealPlanInput {
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipeId?: string;
  recipeName?: string;
  servings?: number;
  calories?: number;
  prepTime?: number;
  notes?: string;
  kitchenId?: string;
}

export interface UpdateMealPlanInput {
  date?: string;
  mealType?: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipeId?: string;
  recipeName?: string;
  servings?: number;
  calories?: number;
  prepTime?: number;
  notes?: string;
  isCompleted?: boolean;
}

export function useMealPlanning(kitchenId?: string) {
  const apolloClient = useApolloClient();
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Calculate week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(selectedWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  // Queries
  const { 
    data: mealPlansData, 
    loading: mealPlansLoading, 
    error: mealPlansError,
    refetch: refetchMealPlans
  } = useQuery(GET_MEAL_PLANS, {
    variables: {
      startDate: weekStart.toISOString(),
      endDate: weekEnd.toISOString()
    },
    errorPolicy: 'all'
  });

  const { 
    data: weeklyMealPlanData, 
    loading: weeklyLoading, 
    error: weeklyError,
    refetch: refetchWeeklyPlan
  } = useQuery(GET_WEEKLY_MEAL_PLAN, {
    variables: {
      weekStart: weekStart.toISOString()
    },
    errorPolicy: 'all'
  });

  const { 
    data: templatesData, 
    loading: templatesLoading, 
    error: templatesError,
    refetch: refetchTemplates
  } = useQuery(GET_MEAL_PLAN_TEMPLATES, {
    variables: selectedCategory ? { category: selectedCategory } : {},
    errorPolicy: 'all'
  });

  // Mutations
  const [createMealPlan] = useMutation(CREATE_MEAL_PLAN_MUTATION, {
    onCompleted: () => {
      toast.success('Meal plan created successfully');
      refetchMealPlans();
      refetchWeeklyPlan();
    },
    onError: (error) => {
      toast.error(`Failed to create meal plan: ${error.message}`);
    }
  });

  const [updateMealPlan] = useMutation(UPDATE_MEAL_PLAN_MUTATION, {
    onCompleted: () => {
      toast.success('Meal plan updated successfully');
      refetchMealPlans();
      refetchWeeklyPlan();
    },
    onError: (error) => {
      toast.error(`Failed to update meal plan: ${error.message}`);
    }
  });

  const [deleteMealPlan] = useMutation(DELETE_MEAL_PLAN_MUTATION, {
    onCompleted: () => {
      toast.success('Meal plan deleted successfully');
      refetchMealPlans();
      refetchWeeklyPlan();
    },
    onError: (error) => {
      toast.error(`Failed to delete meal plan: ${error.message}`);
    }
  });

  const [generateFromTemplate] = useMutation(GENERATE_MEAL_PLAN_FROM_TEMPLATE_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Generated ${data.generateMealPlanFromTemplate.length} meal plans from template`);
      refetchMealPlans();
      refetchWeeklyPlan();
    },
    onError: (error) => {
      toast.error(`Failed to generate meal plan from template: ${error.message}`);
    }
  });

  const [generateShoppingList] = useMutation(GENERATE_SHOPPING_LIST_FROM_MEAL_PLAN_MUTATION, {
    onCompleted: (data) => {
      toast.success(`Shopping list generated with ${data.generateShoppingListFromMealPlan.items.length} items`);
    },
    onError: (error) => {
      toast.error(`Failed to generate shopping list: ${error.message}`);
    }
  });

  // Helper functions
  const addMealPlan = async (input: CreateMealPlanInput) => {
    try {
      // Convert date string to proper DateTime format
      const processedInput = { ...input, kitchenId };
      
      // If date is provided as date-only string, convert to DateTime
      if (processedInput.date && typeof processedInput.date === 'string') {
        // If it's just a date (YYYY-MM-DD), add time to make it a valid DateTime
        if (processedInput.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          processedInput.date = new Date(processedInput.date + 'T12:00:00.000Z').toISOString();
        }
      }
      
      await createMealPlan({
        variables: { input: processedInput }
      });
    } catch (error) {
      console.error('Error creating meal plan:', error);
    }
  };

  const editMealPlan = async (id: string, input: UpdateMealPlanInput) => {
    try {
      await updateMealPlan({
        variables: { id, input }
      });
    } catch (error) {
      console.error('Error updating meal plan:', error);
    }
  };

  const removeMealPlan = async (id: string) => {
    try {
      await deleteMealPlan({
        variables: { id }
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
    }
  };

  const generateMealPlanFromTemplate = async (templateId: string, startDate: Date) => {
    try {
      await generateFromTemplate({
        variables: { 
          templateId, 
          startDate: startDate.toISOString()
        }
      });
    } catch (error) {
      console.error('Error generating meal plan from template:', error);
    }
  };

  const generateShoppingListFromMealPlan = async (startDate: Date, endDate: Date) => {
    if (!kitchenId) {
      toast.error('Kitchen ID is required to generate shopping list');
      return;
    }

    try {
      await generateShoppingList({
        variables: { 
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          kitchenId
        }
      });
    } catch (error) {
      console.error('Error generating shopping list from meal plan:', error);
    }
  };

  const toggleMealCompletion = async (id: string, isCompleted: boolean) => {
    try {
      await updateMealPlan({
        variables: { 
          id, 
          input: { isCompleted }
        }
      });
    } catch (error) {
      console.error('Error toggling meal completion:', error);
    }
  };

  // Organize meals by day and type
  const organizeMealsByWeek = (meals: MealPlan[]) => {
    const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
    
    const organized: { [key: string]: { [key: string]: MealPlan[] } } = {};
    
    weekDays.forEach(day => {
      organized[day] = {};
      mealTypes.forEach(type => {
        organized[day][type] = [];
      });
    });

    meals.forEach(meal => {
      const mealDate = new Date(meal.date);
      const dayIndex = (mealDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
      const dayName = weekDays[dayIndex];
      
      if (organized[dayName] && organized[dayName][meal.mealType]) {
        organized[dayName][meal.mealType].push(meal);
      }
    });

    return organized;
  };

  // Get meal statistics
  const getMealStats = () => {
    const meals = mealPlansData?.mealPlans || [];
    const totalMeals = meals.length;
    const completedMeals = meals.filter((meal: MealPlan) => meal.isCompleted).length;
    const totalCalories = meals.reduce((sum: number, meal: MealPlan) => sum + (meal.calories || 0), 0);
    const avgPrepTime = meals.length > 0 
      ? meals.reduce((sum: number, meal: MealPlan) => sum + (meal.prepTime || 0), 0) / meals.length 
      : 0;

    return {
      totalMeals,
      completedMeals,
      completionRate: totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0,
      totalCalories,
      avgPrepTime: Math.round(avgPrepTime)
    };
  };

  // Navigation helpers
  const goToPreviousWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setSelectedWeek(newWeek);
  };

  const goToNextWeek = () => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setSelectedWeek(newWeek);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  return {
    // Data
    mealPlans: mealPlansData?.mealPlans || [],
    weeklyMealPlan: weeklyMealPlanData?.weeklyMealPlan || [],
    templates: templatesData?.mealPlanTemplates || [],
    organizedMeals: organizeMealsByWeek(mealPlansData?.mealPlans || []),
    mealStats: getMealStats(),
    
    // Loading states
    loading: mealPlansLoading || weeklyLoading || templatesLoading,
    mealPlansLoading,
    weeklyLoading,
    templatesLoading,
    
    // Error states
    error: mealPlansError || weeklyError || templatesError,
    mealPlansError,
    weeklyError,
    templatesError,
    
    // Date management
    selectedWeek,
    setSelectedWeek,
    weekStart,
    weekEnd,
    
    // Category management
    selectedCategory,
    setSelectedCategory,
    
    // Actions
    addMealPlan,
    editMealPlan,
    removeMealPlan,
    toggleMealCompletion,
    generateMealPlanFromTemplate,
    generateShoppingListFromMealPlan,
    
    // Navigation
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    
    // Refetch functions
    refetchMealPlans,
    refetchWeeklyPlan,
    refetchTemplates
  };
}