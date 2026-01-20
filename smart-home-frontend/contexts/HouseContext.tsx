import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeGraphQLRequest } from '@/utils/api';

interface House {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdDate: string;
}

interface HouseContextType {
  selectedHouse: House | null;
  houses: House[];
  isLoading: boolean;
  setSelectedHouse: (house: House | null) => void;
  setHouses: (houses: House[]) => void;
  loadHouses: () => Promise<void>;
  createHouse: (name: string, description: string) => Promise<{ success: boolean; error?: string; house?: House }>;
  hasHouses: boolean;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

interface HouseProviderProps {
  children: ReactNode;
}

export const HouseProvider: React.FC<HouseProviderProps> = ({ children }) => {
  const [selectedHouse, setSelectedHouseState] = useState<House | null>(null);
  const [houses, setHousesState] = useState<House[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false

  useEffect(() => {
    loadSelectedHouse();
    // Don't auto-load houses on mount - let the app control when to load
  }, []);

  const loadSelectedHouse = async () => {
    try {
      const savedHouse = await AsyncStorage.getItem('selectedHouse');
      if (savedHouse) {
        setSelectedHouseState(JSON.parse(savedHouse));
      }
    } catch (error) {
      console.error('Error loading selected house:', error);
    }
  };

  const setSelectedHouse = async (house: House | null) => {
    try {
      setSelectedHouseState(house);
      if (house) {
        await AsyncStorage.setItem('selectedHouse', JSON.stringify(house));
      } else {
        await AsyncStorage.removeItem('selectedHouse');
      }
    } catch (error) {
      console.error('Error saving selected house:', error);
    }
  };

  const loadHouses = async () => {
    try {
      setIsLoading(true);
      
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        console.log('No auth token found');
        setHousesState([]);
        return;
      }

      const data = await makeGraphQLRequest(
        `
          query GetHouses {
            houses {
              id
              userId
              name
              description
              createdDate
              updatedAt
            }
          }
        `,
        {},
        token
      );
      
      if (data.data?.houses) {
        const housesData = data.data.houses;
        setHousesState(housesData);
        
        // If no house is selected and we have houses, select the first one
        if (!selectedHouse && housesData.length > 0) {
          setSelectedHouse(housesData[0]);
        }
        
        console.log('Houses loaded from API:', housesData.length);
        return;
      } else if (data.errors) {
        console.log('GraphQL errors:', data.errors);
        const error = data.errors[0];
        let errorMessage = error?.message || 'Failed to load houses';
        
        // Handle authentication errors
        if (error?.extensions?.code === 'UNAUTHORIZED' || 
            error?.message?.toLowerCase().includes('unauthorized') ||
            error?.message?.toLowerCase().includes('authentication')) {
          // Redirect to login on authentication error
          console.log('Authentication error, redirecting to login');
          throw new Error('AUTHENTICATION_ERROR');
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      // Silently handle network errors in development - don't log to console.error
      const errorMessage = error?.message || String(error);
      
      // Handle authentication errors - just set empty houses, don't clear auth
      if (errorMessage === 'AUTHENTICATION_ERROR') {
        console.log('Authentication error while loading houses');
        setHousesState([]);
        return;
      }
      
      // Only use mock data in development if API is completely unavailable
      if (__DEV__ && (errorMessage.includes('Network request failed') || errorMessage.includes('fetch'))) {
        console.log('API unavailable, continuing with empty houses list');
        setHousesState([]);
      } else {
        // For real network errors, set empty array but don't throw
        console.log('Network error loading houses, continuing with empty list');
        setHousesState([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const setHouses = (newHouses: House[]) => {
    setHousesState(newHouses);
  };

  const createHouse = async (name: string, description: string): Promise<{ success: boolean; error?: string; house?: House }> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return { success: false, error: 'Authentication required' };
      }

      const data = await makeGraphQLRequest(
        `
          mutation CreateHouse($input: CreateHouseInput!) {
            createHouse(input: $input) {
              id
              userId
              name
              description
              createdDate
              updatedAt
            }
          }
        `,
        { input: { name, description } },
        token
      );
      
      if (data.data?.createHouse) {
        const newHouse = data.data.createHouse;
        
        // Add the new house to the list
        const updatedHouses = [newHouse, ...houses];
        setHousesState(updatedHouses);
        
        // Set as selected house if it's the first one
        if (houses.length === 0) {
          setSelectedHouse(newHouse);
        }
        
        console.log('House created successfully:', newHouse.name);
        return { success: true, house: newHouse };
      } else if (data.errors) {
        console.log('GraphQL errors:', data.errors);
        const error = data.errors[0];
        let errorMessage = error?.message || 'Failed to create house';
        
        // Handle authentication errors
        if (error?.extensions?.code === 'UNAUTHORIZED' || 
            error?.message?.toLowerCase().includes('unauthorized') ||
            error?.message?.toLowerCase().includes('authentication')) {
          return { success: false, error: 'Authentication required. Please login again.' };
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('Failed to create house:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const value: HouseContextType = {
    selectedHouse,
    houses,
    isLoading,
    setSelectedHouse,
    setHouses,
    loadHouses,
    createHouse,
    hasHouses: houses.length > 0,
  };

  return (
    <HouseContext.Provider value={value}>
      {children}
    </HouseContext.Provider>
  );
};

export const useHouse = () => {
  const context = useContext(HouseContext);
  if (context === undefined) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
};