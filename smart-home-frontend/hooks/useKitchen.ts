import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@apollo/client';
import { GET_HOUSEHOLDS, GET_KITCHENS } from '@/lib/graphql/queries';

interface Kitchen {
  id: string;
  name: string;
  description?: string;
}

interface Household {
  id: string;
  household: {
    id: string;
    name: string;
    description?: string;
    inviteCode: string;
    kitchens: Kitchen[];
  };
  role: string;
}

interface KitchenContextType {
  currentKitchenId: string | null;
  currentKitchen: Kitchen | null;
  currentHouseholdId: string | null;
  currentHousehold: Household | null;
  households: Household[];
  kitchens: Kitchen[];
  loading: boolean;
  error: any;
  setCurrentKitchen: (kitchenId: string) => Promise<void>;
  setCurrentHousehold: (householdId: string) => Promise<void>;
  refreshData: () => void;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export const useCurrentKitchen = (): string | null => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useCurrentKitchen must be used within a KitchenProvider');
  }
  return context.currentKitchenId;
};

export const useKitchen = (): KitchenContextType => {
  const context = useContext(KitchenContext);
  if (!context) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
};

interface KitchenProviderProps {
  children: ReactNode;
}

export const KitchenProvider = ({ children }: KitchenProviderProps) => {
  const [currentKitchenId, setCurrentKitchenIdState] = useState<string | null>(null);
  const [currentHouseholdId, setCurrentHouseholdIdState] = useState<string | null>(null);

  // Fetch households and kitchens
  const { 
    data: householdsData, 
    loading: householdsLoading, 
    error: householdsError,
    refetch: refetchHouseholds
  } = useQuery(GET_HOUSEHOLDS, {
    errorPolicy: 'all',
  });

  const { 
    data: kitchensData, 
    loading: kitchensLoading, 
    error: kitchensError,
    refetch: refetchKitchens
  } = useQuery(GET_KITCHENS, {
    variables: { householdId: currentHouseholdId || '' },
    skip: !currentHouseholdId,
    errorPolicy: 'all',
  });

  const households: Household[] = householdsData?.households || [];
  const kitchens: Kitchen[] = kitchensData?.kitchens || [];

  // Find current household and kitchen
  const currentHousehold = households.find(h => h.household.id === currentHouseholdId) || null;
  const currentKitchen = kitchens.find(k => k.id === currentKitchenId) || 
                        currentHousehold?.household.kitchens.find(k => k.id === currentKitchenId) || null;

  // Load saved selections from storage
  useEffect(() => {
    loadSavedSelections();
  }, []);

  // Auto-select first available options if none selected
  useEffect(() => {
    if (households.length > 0 && !currentHouseholdId) {
      const firstHousehold = households[0];
      setCurrentHousehold(firstHousehold.household.id);
    }
  }, [households, currentHouseholdId]);

  useEffect(() => {
    if (currentHousehold && currentHousehold.household.kitchens.length > 0 && !currentKitchenId) {
      const firstKitchen = currentHousehold.household.kitchens[0];
      setCurrentKitchen(firstKitchen.id);
    }
  }, [currentHousehold, currentKitchenId]);

  const loadSavedSelections = async () => {
    try {
      const savedHouseholdId = await AsyncStorage.getItem('currentHouseholdId');
      const savedKitchenId = await AsyncStorage.getItem('currentKitchenId');
      
      if (savedHouseholdId) {
        setCurrentHouseholdIdState(savedHouseholdId);
      }
      
      if (savedKitchenId) {
        setCurrentKitchenIdState(savedKitchenId);
      }
    } catch (error) {
      console.error('Error loading saved selections:', error);
    }
  };

  const setCurrentKitchen = async (kitchenId: string) => {
    try {
      setCurrentKitchenIdState(kitchenId);
      await AsyncStorage.setItem('currentKitchenId', kitchenId);
    } catch (error) {
      console.error('Error saving current kitchen:', error);
    }
  };

  const setCurrentHousehold = async (householdId: string) => {
    try {
      setCurrentHouseholdIdState(householdId);
      await AsyncStorage.setItem('currentHouseholdId', householdId);
      
      // Clear current kitchen when switching households
      setCurrentKitchenIdState(null);
      await AsyncStorage.removeItem('currentKitchenId');
    } catch (error) {
      console.error('Error saving current household:', error);
    }
  };

  const refreshData = () => {
    refetchHouseholds();
    if (currentHouseholdId) {
      refetchKitchens();
    }
  };

  const value: KitchenContextType = {
    currentKitchenId,
    currentKitchen,
    currentHouseholdId,
    currentHousehold,
    households,
    kitchens: currentHousehold?.household.kitchens || kitchens,
    loading: householdsLoading || kitchensLoading,
    error: householdsError || kitchensError,
    setCurrentKitchen,
    setCurrentHousehold,
    refreshData,
  };

  return (
    <KitchenContext.Provider value={value}>
      {children}
    </KitchenContext.Provider>
  );
};