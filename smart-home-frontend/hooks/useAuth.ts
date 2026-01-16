import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery, useApolloClient } from '@apollo/client';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME_QUERY, FORGOT_PASSWORD_MUTATION } from '@/lib/graphql/auth';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const apolloClient = useApolloClient();

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [forgotPasswordMutation, { loading: forgotPasswordLoading }] = useMutation(FORGOT_PASSWORD_MUTATION);

  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(GET_ME_QUERY, {
    skip: !user && !isInitialized,
    errorPolicy: 'ignore',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
      }
    },
    onError: (error) => {
      console.log('User query error:', error);
      // If token is invalid, clear it
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        logout();
      }
    }
  });

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      setIsInitialized(true);
      
      if (token) {
        // Token exists, try to fetch user data
        try {
          const { data } = await refetchUser();
          if (data?.me) {
            setUser(data.me);
          } else {
            // Invalid token, clear it
            await AsyncStorage.removeItem('authToken');
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password },
      });

      if (data?.login?.token && data?.login?.user) {
        await AsyncStorage.setItem('authToken', data.login.token);
        setUser(data.login.user);
        
        // Reset Apollo cache to ensure fresh data
        await apolloClient.resetStore();
        
        return { success: true, user: data.login.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data } = await registerMutation({
        variables: { name, email, password },
      });

      if (data?.register?.token && data?.register?.user) {
        await AsyncStorage.setItem('authToken', data.register.token);
        setUser(data.register.user);
        
        // Reset Apollo cache to ensure fresh data
        await apolloClient.resetStore();
        
        return { success: true, user: data.register.user };
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Registration failed';
      throw new Error(message);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { data } = await forgotPasswordMutation({
        variables: { email },
      });

      return {
        success: data?.forgotPassword?.success || false,
        message: data?.forgotPassword?.message || 'Password reset email sent'
      };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const message = error.graphQLErrors?.[0]?.message || error.message || 'Failed to send reset email';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setUser(null);
      
      // Clear Apollo cache
      await apolloClient.clearStore();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  return {
    user,
    isLoading: isLoading || userLoading,
    isAuthenticated: !!user,
    isInitialized,
    login,
    register,
    forgotPassword,
    logout,
    updateUser,
    loading: {
      login: loginLoading,
      register: registerLoading,
      forgotPassword: forgotPasswordLoading,
    }
  };
};