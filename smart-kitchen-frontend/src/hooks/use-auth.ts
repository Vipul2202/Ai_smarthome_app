import { useState, useEffect, createContext, useContext } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { ME_QUERY } from '@/lib/graphql/queries';
import { 
  LOGIN_MUTATION, 
  REGISTER_MUTATION, 
  LOGOUT_MUTATION,
  FORGOT_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION
} from '@/lib/graphql/mutations';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  settings?: any;
  households?: Array<{
    id: string;
    household: {
      id: string;
      name: string;
      description?: string;
    };
    role: string;
  }>;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: any;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthProvider(): AuthContextType {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const [token, setToken] = useState<string | null>(null);

  // Initialize token from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('auth_token');
      setToken(storedToken);
    }
  }, []);

  // Query current user
  const { 
    data: userData, 
    loading, 
    error,
    refetch: refetchUser
  } = useQuery(ME_QUERY, {
    skip: !token,
    errorPolicy: 'all',
    onError: (error) => {
      // If token is invalid, clear it
      if (error.message.includes('Unauthorized') || error.message.includes('Invalid token')) {
        handleLogout();
      }
    }
  });

  // Mutations
  const [loginMutation] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token: newToken, user } = data.login;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      // Update Apollo Client cache
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: { me: user }
      });
      
      toast.success(`Welcome back, ${user.name || user.email}!`);
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(`Login failed: ${error.message}`);
    }
  });

  const [registerMutation] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      const { token: newToken, user } = data.register;
      localStorage.setItem('auth_token', newToken);
      setToken(newToken);
      
      // Update Apollo Client cache
      apolloClient.writeQuery({
        query: ME_QUERY,
        data: { me: user }
      });
      
      toast.success(`Welcome to Smart Kitchen Manager, ${user.name || user.email}!`);
      router.push('/dashboard');
    },
    onError: (error) => {
      toast.error(`Registration failed: ${error.message}`);
    }
  });

  const [logoutMutation] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      handleLogout();
      toast.success('Logged out successfully');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Force logout even if server request fails
      handleLogout();
    }
  });

  const [forgotPasswordMutation] = useMutation(FORGOT_PASSWORD_MUTATION, {
    onCompleted: (data) => {
      toast.success(data.forgotPassword.message);
    },
    onError: (error) => {
      toast.error(`Password reset failed: ${error.message}`);
    }
  });

  const [resetPasswordMutation] = useMutation(RESET_PASSWORD_MUTATION, {
    onCompleted: (data) => {
      toast.success(data.resetPassword.message);
      router.push('/login');
    },
    onError: (error) => {
      toast.error(`Password reset failed: ${error.message}`);
    }
  });

  // Helper functions
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    apolloClient.clearStore();
    router.push('/login');
  };

  const login = async (email: string, password: string) => {
    try {
      await loginMutation({
        variables: {
          input: { email, password }
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      await registerMutation({
        variables: {
          input: { email, password, name }
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if server request fails
      handleLogout();
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await forgotPasswordMutation({
        variables: { email }
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await resetPasswordMutation({
        variables: { token, newPassword }
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  return {
    user: userData?.me || null,
    loading,
    error,
    isAuthenticated: !!token && !!userData?.me,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refetchUser
  };
}

export { AuthContext };