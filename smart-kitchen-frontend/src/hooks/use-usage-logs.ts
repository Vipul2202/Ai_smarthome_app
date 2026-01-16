'use client';

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_USAGE_LOGS 
} from '@/lib/graphql/queries';
import { 
  CREATE_USAGE_LOG_MUTATION 
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useUsageLogs(limit = 100) {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_USAGE_LOGS, {
    variables: { kitchenId: kitchenId || '', limit },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [createLog] = useMutation(CREATE_USAGE_LOG_MUTATION, {
    refetchQueries: [GET_USAGE_LOGS],
  });

  const logs = data?.usageLogs || [];

  // Helper functions
  const addLog = async (logData: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    // Convert date string to proper DateTime format
    const processedData = {
      ...logData,
      kitchenId,
    };

    // If date is provided as date-only string, convert to DateTime
    if (processedData.date && typeof processedData.date === 'string') {
      // If it's just a date (YYYY-MM-DD), add time to make it a valid DateTime
      if (processedData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        processedData.date = new Date(processedData.date + 'T12:00:00.000Z').toISOString();
      }
    }
    
    return createLog({
      variables: {
        input: processedData,
      },
    });
  };

  // Calculate consumption patterns
  const getConsumptionPattern = (itemId: string, days = 7) => {
    const recentLogs = logs.filter((log: any) => {
      const logDate = new Date(log.date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return log.item?.id === itemId && logDate >= cutoffDate;
    });

    const totalConsumed = recentLogs
      .filter((log: any) => log.type === 'CONSUMED' || log.type === 'COOKED')
      .reduce((sum: number, log: any) => sum + log.quantity, 0);

    const dailyAverage = totalConsumed / days;
    
    return {
      totalConsumed,
      dailyAverage,
      logsCount: recentLogs.length,
    };
  };

  // Get waste analytics
  const getWasteAnalytics = (days = 30) => {
    const recentWaste = logs.filter((log: any) => {
      const logDate = new Date(log.date);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      return log.type === 'WASTED' && logDate >= cutoffDate;
    });

    const totalWasted = recentWaste.reduce((sum: number, log: any) => sum + log.quantity, 0);
    const wasteByCategory: Record<string, number> = {};
    
    recentWaste.forEach((log: any) => {
      const category = log.item?.category || 'Unknown';
      wasteByCategory[category] = (wasteByCategory[category] || 0) + log.quantity;
    });

    return {
      totalWasted,
      wasteByCategory,
      wasteCount: recentWaste.length,
    };
  };

  // Predict when item will run out
  const predictRunOut = (itemId: string, currentQuantity: number) => {
    const pattern = getConsumptionPattern(itemId, 14); // 2 weeks of data
    
    if (pattern.dailyAverage <= 0) {
      return null; // No consumption pattern
    }

    const daysRemaining = Math.floor(currentQuantity / pattern.dailyAverage);
    const runOutDate = new Date();
    runOutDate.setDate(runOutDate.getDate() + daysRemaining);

    return {
      daysRemaining,
      runOutDate,
      dailyConsumption: pattern.dailyAverage,
    };
  };

  return {
    // Data
    logs,
    
    // Loading states
    loading,
    error,
    
    // Actions
    addLog,
    refetch,
    
    // Analytics
    getConsumptionPattern,
    getWasteAnalytics,
    predictRunOut,
  };
}