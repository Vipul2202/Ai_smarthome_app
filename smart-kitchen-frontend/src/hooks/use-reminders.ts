'use client';

import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_REMINDERS, 
  GET_UPCOMING_REMINDERS 
} from '@/lib/graphql/queries';
import { 
  CREATE_REMINDER_MUTATION, 
  UPDATE_REMINDER_MUTATION, 
  DELETE_REMINDER_MUTATION,
  GENERATE_SMART_REMINDERS_MUTATION 
} from '@/lib/graphql/mutations';
import { useCurrentKitchen } from './use-kitchen';

export function useReminders() {
  const kitchenId = useCurrentKitchen();

  const { 
    data, 
    loading, 
    error, 
    refetch 
  } = useQuery(GET_REMINDERS, {
    variables: { kitchenId: kitchenId || '' },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const { 
    data: upcomingData, 
    loading: upcomingLoading 
  } = useQuery(GET_UPCOMING_REMINDERS, {
    variables: { kitchenId: kitchenId || '', days: 7 },
    skip: !kitchenId,
    errorPolicy: 'all',
  });

  const [createReminder] = useMutation(CREATE_REMINDER_MUTATION, {
    refetchQueries: [GET_REMINDERS, GET_UPCOMING_REMINDERS],
  });

  const [updateReminder] = useMutation(UPDATE_REMINDER_MUTATION, {
    refetchQueries: [GET_REMINDERS, GET_UPCOMING_REMINDERS],
  });

  const [deleteReminder] = useMutation(DELETE_REMINDER_MUTATION, {
    refetchQueries: [GET_REMINDERS, GET_UPCOMING_REMINDERS],
  });

  const [generateSmartReminders] = useMutation(GENERATE_SMART_REMINDERS_MUTATION, {
    refetchQueries: [GET_REMINDERS, GET_UPCOMING_REMINDERS],
  });

  const reminders = data?.reminders || [];
  const upcomingReminders = upcomingData?.upcomingReminders || [];

  // Helper functions
  const addReminder = async (reminderData: any) => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    return createReminder({
      variables: {
        input: {
          ...reminderData,
          kitchenId,
        },
      },
    });
  };

  const editReminder = async (id: string, isCompleted: boolean) => {
    return updateReminder({
      variables: {
        id,
        isCompleted,
      },
    });
  };

  const removeReminder = async (id: string) => {
    return deleteReminder({
      variables: { id },
    });
  };

  const completeReminder = async (id: string) => {
    return editReminder(id, true);
  };

  const uncompleteReminder = async (id: string) => {
    return editReminder(id, false);
  };

  const generateSmartRemindersAction = async () => {
    if (!kitchenId) throw new Error('No kitchen selected');
    
    return generateSmartReminders({
      variables: { kitchenId },
    });
  };

  return {
    // Data
    reminders,
    upcomingReminders,
    
    // Loading states
    loading: loading || upcomingLoading,
    error,
    
    // Actions
    addReminder,
    editReminder,
    removeReminder,
    completeReminder,
    uncompleteReminder,
    generateSmartRemindersAction,
    refetch,
    
    // Stats
    stats: {
      total: reminders.length,
      completed: reminders.filter((r: any) => r.isCompleted).length,
      pending: reminders.filter((r: any) => !r.isCompleted).length,
      upcoming: upcomingReminders.length,
    },
  };
}