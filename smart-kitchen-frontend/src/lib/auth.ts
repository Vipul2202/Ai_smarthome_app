// Authentication utilities

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Storage keys
const TOKEN_KEY = 'kitchen_auth_token';
const USER_KEY = 'kitchen_user_data';

// Get auth state from localStorage
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { user: null, token: null, isAuthenticated: false };
  }

  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (!token || !userStr) {
      return { user: null, token: null, isAuthenticated: false };
    }

    const user = JSON.parse(userStr);
    return { user, token, isAuthenticated: true };
  } catch (error) {
    console.error('Error reading auth state:', error);
    clearAuthState();
    return { user: null, token: null, isAuthenticated: false };
  }
}

// Save auth state to localStorage
export function setAuthState(user: User, token: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving auth state:', error);
  }
}

// Clear auth state from localStorage
export function clearAuthState(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
}

// Get auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
}

// Get current user
export function getCurrentUser(): User | null {
  return getAuthState().user;
}