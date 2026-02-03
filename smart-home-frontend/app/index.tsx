import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        console.log('🔍 Starting authentication check...');
        
        // Wait for auth provider to finish loading
        if (authLoading) {
          console.log('⏳ Auth provider still loading...');
          return;
        }

        // Check if user exists in context
        if (!user) {
          console.log('❌ No user in context');
          
          // Double-check stored auth data
          const token = await AsyncStorage.getItem('authToken');
          const userData = await AsyncStorage.getItem('userData');
          const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
          
          console.log('📱 Stored auth check:');
          console.log('- Token exists:', !!token);
          console.log('- UserData exists:', !!userData);
          console.log('- TokenExpiry:', tokenExpiry);
          
          if (token && tokenExpiry) {
            const expiryDate = new Date(tokenExpiry);
            const now = new Date();
            const isExpired = now >= expiryDate;
            
            console.log('- Token expired:', isExpired);
            
            if (isExpired) {
              console.log('🗑️ Clearing expired auth data');
              await AsyncStorage.multiRemove([
                'authToken', 
                'userData', 
                'tokenExpiry',
                'selectedHouseId',
                'selectedHouseName'
              ]);
            }
          }
          
          // No valid authentication - redirect to login
          console.log('🚪 Redirecting to login screen');
          setRedirectPath('/(auth)/login');
          setIsCheckingAuth(false);
          return;
        }

        // User is authenticated
        console.log('✅ User authenticated:', user.email);
        
        // Check if user has selected a house
        const selectedHouseId = await AsyncStorage.getItem('selectedHouseId');
        console.log('🏠 Selected house ID:', selectedHouseId);
        
        if (selectedHouseId) {
          console.log('🏠 Redirecting to dashboard');
          setRedirectPath('/(tabs)');
        } else {
          console.log('🏠 Redirecting to house selection');
          setRedirectPath('/select-house');
        }
        
        setIsCheckingAuth(false);
        
      } catch (error) {
        console.error('❌ Error during auth check:', error);
        setRedirectPath('/(auth)/login');
        setIsCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading || isCheckingAuth || !redirectPath) {
    return <LoadingSpinner overlay text="Checking authentication..." />;
  }

  console.log('🚀 Redirecting to:', redirectPath);
  return <Redirect href={redirectPath as any} />;
}