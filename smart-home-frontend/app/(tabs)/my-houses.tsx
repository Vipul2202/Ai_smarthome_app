import { useEffect } from 'react';
import { router } from 'expo-router';

export default function MyHousesTab() {
  useEffect(() => {
    // Redirect to houses management page
    router.replace('/houses');
  }, []);

  // Return null since we're redirecting
  return null;
}