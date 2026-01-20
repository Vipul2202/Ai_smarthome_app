import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';
import { makeGraphQLRequest } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
      
      if (token && userData && tokenExpiry) {
        const expiryDate = new Date(tokenExpiry);
        const now = new Date();
        
        if (now < expiryDate) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('User authenticated:', parsedUser.email);
        } else {
          console.log('Token expired, clearing auth');
          await AsyncStorage.multiRemove(['authToken', 'userData', 'tokenExpiry']);
        }
      } else {
        console.log('No authentication found');
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await makeGraphQLRequest(
        `
          mutation Login($input: LoginInput!) {
            login(input: $input) {
              token
              user {
                id
                name
                email
                avatar
                createdAt
                updatedAt
              }
            }
          }
        `,
        { input: { email, password } }
      );
      
      if (data.data?.login) {
        const { token, user: userData } = data.data.login;
        
        // Set token expiry to 15 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);
        
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['userData', JSON.stringify(userData)],
          ['tokenExpiry', expiryDate.toISOString()]
        ]);
        
        setUser(userData);
        console.log('Login successful:', userData.email);
        return { success: true };
      } else if (data.errors) {
        console.log('GraphQL errors:', data.errors);
        const error = data.errors[0];
        let errorMessage = error?.message || 'Login failed';
        
        // Use the user-friendly message if available
        if (error?.extensions?.userMessage) {
          errorMessage = error.extensions.userMessage;
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: 'Invalid email or password' };
    } catch (error) {
      console.error('Login error:', error);
      
      // Only use mock authentication in development if API is completely unavailable
      if (__DEV__ && error.message?.includes('Network request failed')) {
        console.log('API unavailable, using mock login for development');
        
        if (email && password) {
          const mockUser: User = {
            id: Date.now().toString(),
            name: email.split('@')[0] || 'Demo User',
            email: email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0] || 'Demo User')}&background=3B82F6&color=fff`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const mockToken = 'mock-jwt-token-' + Date.now();

          await AsyncStorage.setItem('authToken', mockToken);
          await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
          
          setUser(mockUser);
          console.log('Mock login successful:', mockUser.email);
          return { success: true };
        }
      }
      
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const data = await makeGraphQLRequest(
        `
          mutation Register($input: RegisterInput!) {
            register(input: $input) {
              token
              user {
                id
                name
                email
                avatar
                createdAt
                updatedAt
              }
            }
          }
        `,
        { input: { name, email, password } }
      );
      
      if (data.data?.register) {
        const { token, user: userData } = data.data.register;
        
        // Set token expiry to 15 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 15);
        
        await AsyncStorage.multiSet([
          ['authToken', token],
          ['userData', JSON.stringify(userData)],
          ['tokenExpiry', expiryDate.toISOString()]
        ]);
        
        setUser(userData);
        console.log('Registration successful:', userData.email);
        return { success: true };
      } else if (data.errors) {
        console.log('GraphQL errors:', data.errors);
        const error = data.errors[0];
        let errorMessage = error?.message || 'Registration failed';
        
        // Use the user-friendly message if available
        if (error?.extensions?.userMessage) {
          errorMessage = error.extensions.userMessage;
        }
        
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Only use mock registration in development if API is completely unavailable
      if (__DEV__ && error.message?.includes('Network request failed')) {
        console.log('API unavailable, using mock registration for development');
        
        const mockUser: User = {
          id: Date.now().toString(),
          name: name,
          email: email,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3B82F6&color=fff`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const mockToken = 'mock-jwt-token-' + Date.now();

        await AsyncStorage.setItem('authToken', mockToken);
        await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
        
        setUser(mockUser);
        console.log('Mock registration successful:', mockUser.email);
        return { success: true };
      }
      
      return { success: false, error: 'Network error. Please check your connection and try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.multiRemove(['authToken', 'userData', 'tokenExpiry']);
      setUser(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date().toISOString() };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        console.log('User data updated successfully:', updatedUser.name);
      } catch (error) {
        console.error('Error updating user data:', error);
        throw error;
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};