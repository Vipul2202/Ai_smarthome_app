import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useHouse } from '@/contexts/HouseContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { houses, isLoading: housesLoading, loadHouses } = useHouse();
  const [hasCheckedHouses, setHasCheckedHouses] = useState(false);
  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(null);
  const [hasCheckedSelection, setHasCheckedSelection] = useState(false);

  useEffect(() => {
    // Only load houses if user is authenticated and we haven't checked yet
    if (user && !hasCheckedHouses) {
      loadHouses().finally(() => setHasCheckedHouses(true));
    }
  }, [user, hasCheckedHouses]);

  useEffect(() => {
    // Check if a house is selected
    const checkSelectedHouse = async () => {
      if (user && hasCheckedHouses) {
        const houseId = await AsyncStorage.getItem('selectedHouseId');
        setSelectedHouseId(houseId);
        setHasCheckedSelection(true);
      }
    };
    checkSelectedHouse();
  }, [user, hasCheckedHouses]);

  // Show loading while checking auth state
  if (authLoading) {
    return <LoadingSpinner overlay text="Loading..." />;
  }

  // Not authenticated - go to login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Show loading while checking houses
  if (!hasCheckedHouses || housesLoading || !hasCheckedSelection) {
    return <LoadingSpinner overlay text="Loading your houses..." />;
  }

  // Authenticated but no houses - go to create house
  if (houses.length === 0) {
    return <Redirect href="/houses/create" />;
  }

  // Authenticated with houses but no house selected - go to select house
  if (!selectedHouseId) {
    return <Redirect href="/select-house" />;
  }

  // Authenticated with houses and house selected - go to dashboard
  return <Redirect href="/(tabs)" />;
}