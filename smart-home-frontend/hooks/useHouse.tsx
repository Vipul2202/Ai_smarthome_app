import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_HOUSES = gql`
  query GetHouses {
    houses {
      id
      name
      description
      createdDate
      updatedAt
      userRole
    }
    sharedHouses {
      id
      name
      description
      createdDate
      updatedAt
      userRole
    }
  }
`;

const CREATE_HOUSE = gql`
  mutation CreateHouse($input: CreateHouseInput!) {
    createHouse(input: $input) {
      id
      name
      description
      createdDate
      updatedAt
    }
  }
`;

interface House {
  id: string;
  name: string;
  description?: string;
  createdDate?: string;
  updatedAt?: string;
  userRole?: 'READ' | 'WRITE' | null;
}

interface HouseContextType {
  currentHouseId: string | null;
  currentHouse: House | null;
  selectedHouse: House | null; // Alias for currentHouse
  houses: House[];
  loading: boolean;
  isLoading: boolean; // Alias for loading
  error: any;
  setCurrentHouse: (houseId: string) => Promise<void>;
  setSelectedHouse: (house: House) => Promise<void>; // Alternative signature
  refreshData: () => void;
  loadHouses: () => void; // Alias for refreshData
  createHouse: (name: string, description?: string | null) => Promise<{ success: boolean; data?: any; error?: any }>;
}

const HouseContext = createContext<HouseContextType | undefined>(undefined);

export const useCurrentHouse = (): string | null => {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error('useCurrentHouse must be used within a HouseProvider');
  }
  return context.currentHouseId;
};

export const useHouse = (): HouseContextType => {
  const context = useContext(HouseContext);
  if (!context) {
    throw new Error('useHouse must be used within a HouseProvider');
  }
  return context;
};

interface HouseProviderProps {
  children: ReactNode;
}

export const HouseProvider = ({ children }: HouseProviderProps) => {
  const [currentHouseId, setCurrentHouseIdState] = useState<string | null>(null);

  // Fetch houses
  const { 
    data: housesData, 
    loading: housesLoading, 
    error: housesError,
    refetch: refetchHouses
  } = useQuery(GET_HOUSES, {
    errorPolicy: 'all',
  });

  // Create house mutation
  const [createHouseMutation, { loading: creatingHouse }] = useMutation(CREATE_HOUSE, {
    refetchQueries: [{ query: GET_HOUSES }],
  });

  const houses: House[] = [
    ...(housesData?.houses || []),
    ...(housesData?.sharedHouses || [])
  ];

  // Find current house
  const currentHouse = houses.find(h => h.id === currentHouseId) || null;

  // Load saved selections from storage
  useEffect(() => {
    loadSavedSelections();
  }, []);

  // Auto-select first available house if none selected
  useEffect(() => {
    if (houses.length > 0 && !currentHouseId) {
      const firstHouse = houses[0];
      setCurrentHouse(firstHouse.id);
    }
  }, [houses, currentHouseId]);

  const loadSavedSelections = async () => {
    try {
      const savedHouseId = await AsyncStorage.getItem('selectedHouseId');
      
      if (savedHouseId) {
        setCurrentHouseIdState(savedHouseId);
      }
    } catch (error) {
      console.error('Error loading saved house selection:', error);
    }
  };

  const setCurrentHouse = async (houseId: string) => {
    try {
      setCurrentHouseIdState(houseId);
      await AsyncStorage.setItem('selectedHouseId', houseId);
    } catch (error) {
      console.error('Error saving current house:', error);
    }
  };

  const refreshData = () => {
    refetchHouses();
  };

  const setSelectedHouse = async (house: House) => {
    await setCurrentHouse(house.id);
  };

  const loadHouses = () => {
    refetchHouses();
  };

  const createHouse = async (name: string, description?: string | null) => {
    try {
      const { data: result, errors } = await createHouseMutation({
        variables: {
          input: {
            name,
            description: description || null,
          },
        },
      });

      // Check for GraphQL errors
      if (errors && errors.length > 0) {
        return { success: false, error: errors[0] };
      }

      if (result?.createHouse) {
        // Auto-select the new house
        await setCurrentHouse(result.createHouse.id);
        return { success: true, data: result.createHouse };
      }

      return { success: false, error: 'Failed to create house' };
    } catch (error) {
      console.error('Error creating house:', error);
      return { success: false, error };
    }
  };

  const value: HouseContextType = {
    currentHouseId,
    currentHouse,
    selectedHouse: currentHouse, // Alias
    houses,
    loading: housesLoading || creatingHouse,
    isLoading: housesLoading || creatingHouse, // Alias
    error: housesError,
    setCurrentHouse,
    setSelectedHouse,
    refreshData,
    loadHouses, // Alias
    createHouse,
  };

  return (
    <HouseContext.Provider value={value}>
      {children}
    </HouseContext.Provider>
  );
};