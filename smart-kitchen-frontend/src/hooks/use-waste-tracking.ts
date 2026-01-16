import { useState, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { 
  GET_WASTE_ENTRIES,
  GET_WASTE_GOALS,
  GET_WASTE_STATS,
  GET_WASTE_TRENDS
} from '@/lib/graphql/queries';
import {
  CREATE_WASTE_ENTRY_MUTATION,
  UPDATE_WASTE_ENTRY_MUTATION,
  DELETE_WASTE_ENTRY_MUTATION,
  UPDATE_WASTE_GOALS_MUTATION,
  BULK_CREATE_WASTE_ENTRIES_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';

export interface WasteEntry {
  id: string;
  date: string;
  itemName: string;
  category?: string;
  quantity: number;
  unit: string;
  reason: 'EXPIRED' | 'SPOILED' | 'OVERCOOKED' | 'LEFTOVER' | 'ACCIDENTAL' | 'DISLIKED' | 'OTHER';
  cost?: number;
  preventable: boolean;
  notes?: string;
  kitchenId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WasteGoals {
  id: string;
  monthlyWasteKg?: number;
  monthlyCostSave?: number;
  co2SaveKg?: number;
  waterSaveLiters?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WasteStats {
  period: string;
  startDate: string;
  endDate: string;
  totalEntries: number;
  totalWasteKg: number;
  totalCost: number;
  preventableWasteKg: number;
  preventablePercentage: number;
  co2Impact: number;
  waterImpact: number;
  categoryBreakdown: any[];
  reasonBreakdown: any[];
}

export interface CreateWasteEntryInput {
  date: string;
  itemName: string;
  category?: string;
  quantity: number;
  unit: string;
  reason: 'EXPIRED' | 'SPOILED' | 'OVERCOOKED' | 'LEFTOVER' | 'ACCIDENTAL' | 'DISLIKED' | 'OTHER';
  cost?: number;
  preventable?: boolean;
  notes?: string;
  kitchenId?: string;
}

export interface UpdateWasteGoalsInput {
  monthlyWasteKg?: number;
  monthlyCostSave?: number;
  co2SaveKg?: number;
  waterSaveLiters?: number;
}

export function useWasteTracking(kitchenId?: string) {
  const apolloClient = useApolloClient();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });

  // Queries
  const { 
    data: wasteEntriesData, 
    loading: entriesLoading, 
    error: entriesError,
    refetch: refetchEntries
  } = useQuery(GET_WASTE_ENTRIES, {
    variables: {
      startDate: dateRange.start.toISOString(),
      endDate: dateRange.end.toISOString(),
      ...(selectedCategory && { category: selectedCategory })
    },
    errorPolicy: 'all'
  });

  const { 
    data: wasteGoalsData, 
    loading: goalsLoading, 
    error: goalsError,
    refetch: refetchGoals
  } = useQuery(GET_WASTE_GOALS, {
    errorPolicy: 'all'
  });

  const { 
    data: wasteStatsData, 
    loading: statsLoading, 
    error: statsError,
    refetch: refetchStats
  } = useQuery(GET_WASTE_STATS, {
    variables: { period: selectedPeriod },
    errorPolicy: 'all'
  });

  const { 
    data: wasteTrendsData, 
    loading: trendsLoading, 
    error: trendsError 
  } = useQuery(GET_WASTE_TRENDS, {
    variables: { days: selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 365 },
    errorPolicy: 'all'
  });

  // Mutations
  const [createWasteEntry] = useMutation(CREATE_WASTE_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Waste entry added successfully');
      refetchEntries();
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Failed to add waste entry: ${error.message}`);
    }
  });

  const [updateWasteEntry] = useMutation(UPDATE_WASTE_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Waste entry updated successfully');
      refetchEntries();
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Failed to update waste entry: ${error.message}`);
    }
  });

  const [deleteWasteEntry] = useMutation(DELETE_WASTE_ENTRY_MUTATION, {
    onCompleted: () => {
      toast.success('Waste entry deleted successfully');
      refetchEntries();
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Failed to delete waste entry: ${error.message}`);
    }
  });

  const [updateWasteGoals] = useMutation(UPDATE_WASTE_GOALS_MUTATION, {
    onCompleted: () => {
      toast.success('Waste goals updated successfully');
      refetchGoals();
    },
    onError: (error) => {
      toast.error(`Failed to update waste goals: ${error.message}`);
    }
  });

  const [bulkCreateWasteEntries] = useMutation(BULK_CREATE_WASTE_ENTRIES_MUTATION, {
    onCompleted: (data) => {
      toast.success(`${data.bulkCreateWasteEntries} waste entries added successfully`);
      refetchEntries();
      refetchStats();
    },
    onError: (error) => {
      toast.error(`Failed to add waste entries: ${error.message}`);
    }
  });

  // Helper functions
  const addWasteEntry = async (input: CreateWasteEntryInput) => {
    try {
      // Convert date string to proper DateTime format
      const processedInput = { 
        ...input, 
        kitchenId,
        preventable: input.preventable ?? true
      };
      
      // If date is provided as date-only string, convert to DateTime
      if (processedInput.date && typeof processedInput.date === 'string') {
        // If it's just a date (YYYY-MM-DD), add time to make it a valid DateTime
        if (processedInput.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          processedInput.date = new Date(processedInput.date + 'T12:00:00.000Z').toISOString();
        }
      }
      
      await createWasteEntry({
        variables: { input: processedInput }
      });
    } catch (error) {
      console.error('Error creating waste entry:', error);
    }
  };

  const editWasteEntry = async (id: string, input: Partial<CreateWasteEntryInput>) => {
    try {
      await updateWasteEntry({
        variables: { id, input }
      });
    } catch (error) {
      console.error('Error updating waste entry:', error);
    }
  };

  const removeWasteEntry = async (id: string) => {
    try {
      await deleteWasteEntry({
        variables: { id }
      });
    } catch (error) {
      console.error('Error deleting waste entry:', error);
    }
  };

  const updateGoals = async (input: UpdateWasteGoalsInput) => {
    try {
      await updateWasteGoals({
        variables: { input }
      });
    } catch (error) {
      console.error('Error updating waste goals:', error);
    }
  };

  const addBulkWasteEntries = async (entries: CreateWasteEntryInput[]) => {
    try {
      const entriesWithKitchen = entries.map(entry => ({
        ...entry,
        kitchenId,
        preventable: entry.preventable ?? true
      }));
      
      await bulkCreateWasteEntries({
        variables: { entries: entriesWithKitchen }
      });
    } catch (error) {
      console.error('Error creating bulk waste entries:', error);
    }
  };

  // Calculate waste statistics
  const calculateWasteStats = () => {
    const entries = wasteEntriesData?.wasteEntries || [];
    const goals = wasteGoalsData?.wasteGoals;
    
    const totalWaste = entries.reduce((sum: number, entry: WasteEntry) => sum + entry.quantity, 0);
    const totalCost = entries.reduce((sum: number, entry: WasteEntry) => sum + (entry.cost || 0), 0);
    const preventableWaste = entries
      .filter((entry: WasteEntry) => entry.preventable)
      .reduce((sum: number, entry: WasteEntry) => sum + entry.quantity, 0);
    
    const preventablePercentage = totalWaste > 0 ? (preventableWaste / totalWaste) * 100 : 0;
    
    // Environmental impact calculations (rough estimates)
    const co2Impact = totalWaste * 2.5; // kg CO2 per kg food waste
    const waterImpact = totalWaste * 1000; // liters water per kg food waste

    return {
      totalEntries: entries.length,
      totalWaste,
      totalCost,
      preventableWaste,
      preventablePercentage,
      co2Impact,
      waterImpact,
      goals: goals || null
    };
  };

  // Get category breakdown
  const getCategoryBreakdown = () => {
    const entries = wasteEntriesData?.wasteEntries || [];
    const categoryMap = new Map();
    
    entries.forEach((entry: WasteEntry) => {
      const category = entry.category || 'Other';
      const existing = categoryMap.get(category) || { quantity: 0, cost: 0, count: 0 };
      categoryMap.set(category, {
        quantity: existing.quantity + entry.quantity,
        cost: existing.cost + (entry.cost || 0),
        count: existing.count + 1
      });
    });
    
    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  // Get reason breakdown
  const getReasonBreakdown = () => {
    const entries = wasteEntriesData?.wasteEntries || [];
    const reasonMap = new Map();
    
    entries.forEach((entry: WasteEntry) => {
      const existing = reasonMap.get(entry.reason) || { quantity: 0, cost: 0, count: 0 };
      reasonMap.set(entry.reason, {
        quantity: existing.quantity + entry.quantity,
        cost: existing.cost + (entry.cost || 0),
        count: existing.count + 1
      });
    });
    
    return Array.from(reasonMap.entries()).map(([reason, data]) => ({
      reason,
      ...data
    }));
  };

  // Period navigation
  const changePeriod = (period: 'week' | 'month' | 'year') => {
    setSelectedPeriod(period);
    
    const now = new Date();
    let start: Date;
    
    switch (period) {
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
    }
    
    setDateRange({ start, end: now });
  };

  // Goal progress calculation
  const getGoalProgress = () => {
    const stats = calculateWasteStats();
    const goals = wasteGoalsData?.wasteGoals;
    
    if (!goals) return null;
    
    return {
      wasteReduction: {
        current: stats.totalWaste,
        goal: goals.monthlyWasteKg || 0,
        progress: goals.monthlyWasteKg ? Math.max(0, 100 - (stats.totalWaste / goals.monthlyWasteKg) * 100) : 0
      },
      costSaving: {
        current: stats.totalCost,
        goal: goals.monthlyCostSave || 0,
        progress: goals.monthlyCostSave ? Math.max(0, 100 - (stats.totalCost / goals.monthlyCostSave) * 100) : 0
      },
      co2Reduction: {
        current: stats.co2Impact,
        goal: goals.co2SaveKg || 0,
        progress: goals.co2SaveKg ? Math.max(0, 100 - (stats.co2Impact / goals.co2SaveKg) * 100) : 0
      },
      waterSaving: {
        current: stats.waterImpact,
        goal: goals.waterSaveLiters || 0,
        progress: goals.waterSaveLiters ? Math.max(0, 100 - (stats.waterImpact / goals.waterSaveLiters) * 100) : 0
      }
    };
  };

  return {
    // Data
    wasteEntries: wasteEntriesData?.wasteEntries || [],
    wasteGoals: wasteGoalsData?.wasteGoals,
    wasteStats: wasteStatsData?.wasteStats,
    wasteTrends: wasteTrendsData?.wasteTrends || [],
    calculatedStats: calculateWasteStats(),
    categoryBreakdown: getCategoryBreakdown(),
    reasonBreakdown: getReasonBreakdown(),
    goalProgress: getGoalProgress(),
    
    // Loading states
    loading: entriesLoading || goalsLoading || statsLoading,
    entriesLoading,
    goalsLoading,
    statsLoading,
    trendsLoading,
    
    // Error states
    error: entriesError || goalsError || statsError || trendsError,
    entriesError,
    goalsError,
    statsError,
    trendsError,
    
    // Filters
    selectedPeriod,
    setSelectedPeriod,
    selectedCategory,
    setSelectedCategory,
    dateRange,
    setDateRange,
    
    // Actions
    addWasteEntry,
    editWasteEntry,
    removeWasteEntry,
    updateGoals,
    addBulkWasteEntries,
    changePeriod,
    
    // Refetch functions
    refetchEntries,
    refetchGoals,
    refetchStats
  };
}