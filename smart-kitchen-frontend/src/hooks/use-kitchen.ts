'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { useQuery } from '@apollo/client';
import { GET_HOUSEHOLDS } from '@/lib/graphql/queries';

interface Kitchen {
  id: string;
  name: string;
  type: string;
}

interface Household {
  id: string;
  name: string;
  kitchens: Kitchen[];
}

interface KitchenContextType {
  currentKitchen: Kitchen | null;
  currentHousehold: Household | null;
  households: Household[];
  setCurrentKitchen: (kitchen: Kitchen) => void;
  loading: boolean;
  error: any;
}

const KitchenContext = createContext<KitchenContextType | undefined>(undefined);

export function useKitchen() {
  const context = useContext(KitchenContext);
  if (context === undefined) {
    throw new Error('useKitchen must be used within a KitchenProvider');
  }
  return context;
}

export function KitchenProvider({ children }: { children: React.ReactNode }) {
  const [currentKitchen, setCurrentKitchen] = useState<Kitchen | null>(null);
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  const { data, loading, error } = useQuery(GET_HOUSEHOLDS, {
    errorPolicy: 'all',
  });

  const households = data?.households || [];

  useEffect(() => {
    if (households.length > 0 && !currentHousehold) {
      // Set the first household as default
      const firstHousehold = households[0];
      setCurrentHousehold(firstHousehold);
      
      // Set the first kitchen of the first household as default
      if (firstHousehold.kitchens.length > 0) {
        setCurrentKitchen(firstHousehold.kitchens[0]);
      }
    }
  }, [households, currentHousehold]);

  const handleSetCurrentKitchen = (kitchen: Kitchen) => {
    setCurrentKitchen(kitchen);
    
    // Find and set the household that contains this kitchen
    const household = households.find((h: any) => 
      h.kitchens.some((k: any) => k.id === kitchen.id)
    );
    if (household) {
      setCurrentHousehold(household);
    }
  };

  const value: KitchenContextType = {
    currentKitchen,
    currentHousehold,
    households,
    setCurrentKitchen: handleSetCurrentKitchen,
    loading,
    error,
  };

  return React.createElement(
    KitchenContext.Provider,
    { value },
    children
  );
}

// Simple hook for components that just need the current kitchen ID
export function useCurrentKitchen(): string | null {
  const { currentKitchen } = useKitchen();
  return currentKitchen?.id || null;
}