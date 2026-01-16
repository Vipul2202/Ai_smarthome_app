'use client';

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_EXPENSES, 
  GET_EXPENSE_STATS,
  GET_PRICE_TRENDS
} from '@/lib/graphql/queries';
import { 
  CREATE_EXPENSE_MUTATION, 
  UPDATE_EXPENSE_MUTATION, 
  DELETE_EXPENSE_MUTATION 
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useExpenses(limit = 50) {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_EXPENSES, {
    variables: { kitchenId: kitchenId || '', limit },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { 
    data: statsData, 
    loading: statsLoading 
  } = useQuery(GET_EXPENSE_STATS, {
    variables: { kitchenId: kitchenId || '', period: 'month' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { 
    data: trendsData, 
    loading: trendsLoading 
  } = useQuery(GET_PRICE_TRENDS, {
    variables: { kitchenId: kitchenId || '', days: 30 },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [createExpense] = useMutation(CREATE_EXPENSE_MUTATION, {
    refetchQueries: [GET_EXPENSES, GET_EXPENSE_STATS, GET_PRICE_TRENDS],
  });

  const [updateExpense] = useMutation(UPDATE_EXPENSE_MUTATION, {
    refetchQueries: [GET_EXPENSES, GET_EXPENSE_STATS, GET_PRICE_TRENDS],
  });

  const [deleteExpense] = useMutation(DELETE_EXPENSE_MUTATION, {
    refetchQueries: [GET_EXPENSES, GET_EXPENSE_STATS, GET_PRICE_TRENDS],
  });

  const expenses = data?.expenses || [];
  const stats = statsData?.expenseStats || {};
  const priceTrends = trendsData?.priceTrends || {};

  // Helper functions
  const addExpense = async (expenseData: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    // Only include fields that are supported by the backend schema
    const processedData = {
      kitchenId,
      type: expenseData.type,
      amount: expenseData.amount,
      vendor: expenseData.vendor,
      date: expenseData.date,
      billImageUrl: expenseData.billImageUrl,
      items: expenseData.items,
      notes: expenseData.description || expenseData.notes, // Map description to notes
      category: expenseData.category,
    };

    // If date is provided as date-only string, convert to DateTime
    if (processedData.date && typeof processedData.date === 'string') {
      // If it's just a date (YYYY-MM-DD), add time to make it a valid DateTime
      if (processedData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.date = new Date(processedData.date + 'T12:00:00.000Z').toISOString();
      }
    }
    
    return createExpense({
      variables: {
        input: processedData,
      },
    });
  };

  const editExpense = async (id: string, expenseData: any) => {
    return updateExpense({
      variables: {
        id,
        ...expenseData,
      },
    });
  };

  const removeExpense = async (id: string) => {
    return deleteExpense({
      variables: { id },
    });
  };

  // Calculate stats from expenses if API stats not available
  const calculatedStats = {
    total: expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0),
    ration: expenses
      .filter((e: any) => e.type === 'GROCERY')
      .reduce((sum: number, e: any) => sum + e.amount, 0),
    foodOrder: expenses
      .filter((e: any) => e.type === 'FOOD_ORDER')
      .reduce((sum: number, e: any) => sum + e.amount, 0),
    avgDaily: expenses.length > 0 ? 
      expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) / 30 : 0,
  };

  return {
    // Data
    expenses,
    stats: Object.keys(stats).length > 0 ? stats : calculatedStats,
    priceTrends,
    
    // Loading states
    loading: loading || statsLoading || trendsLoading,
    error,
    
    // Actions
    addExpense,
    editExpense,
    removeExpense,
    refetch,
  };
}