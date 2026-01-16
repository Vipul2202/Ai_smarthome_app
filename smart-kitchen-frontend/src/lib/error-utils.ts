import { ApolloError } from '@apollo/client';

export interface FormattedError {
  message: string;
  userMessage: string;
  code?: string;
  field?: string;
}

export function formatGraphQLError(error: ApolloError): FormattedError {
  // Get the first GraphQL error (most relevant)
  const graphQLError = error.graphQLErrors?.[0];
  
  if (graphQLError) {
    const extensions = graphQLError.extensions;
    return {
      message: graphQLError.message,
      userMessage: (extensions?.userMessage as string) || graphQLError.message,
      code: extensions?.code as string | undefined,
      field: extensions?.field as string | undefined,
    };
  }

  // Handle network errors
  if (error.networkError) {
    return {
      message: error.networkError.message,
      userMessage: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
    };
  }

  // Fallback for other errors
  return {
    message: error.message,
    userMessage: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
  };
}

export function getErrorMessage(error: ApolloError): string {
  const formattedError = formatGraphQLError(error);
  return formattedError.userMessage;
}

export function getFieldError(error: ApolloError, fieldName: string): string | null {
  const formattedError = formatGraphQLError(error);
  if (formattedError.field === fieldName) {
    return formattedError.userMessage;
  }
  return null;
}

export function isAuthError(error: ApolloError): boolean {
  const formattedError = formatGraphQLError(error);
  const authErrorCodes = ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED', 'INVALID_CREDENTIALS'];
  return authErrorCodes.includes(formattedError.code || '');
}

export function isValidationError(error: ApolloError): boolean {
  const formattedError = formatGraphQLError(error);
  const validationErrorCodes = ['INVALID_INPUT', 'PASSWORD_TOO_SHORT', 'INVALID_EMAIL', 'USER_ALREADY_EXISTS'];
  return validationErrorCodes.includes(formattedError.code || '');
}

// Error messages for common scenarios
export const ErrorMessages = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect.',
  USER_ALREADY_EXISTS: 'An account with this email already exists. Please use a different email or sign in.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  UNAUTHORIZED: 'You must be signed in to access this feature.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  RESOURCE_NOT_FOUND: 'The requested resource could not be found.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
  
  // Form-specific messages
  REQUIRED_FIELD: 'This field is required.',
  INVALID_FORMAT: 'Please enter a valid format.',
  
  // Success messages
  REGISTRATION_SUCCESS: 'Account created successfully! Welcome to Smart Kitchen Manager.',
  LOGIN_SUCCESS: 'Welcome back!',
  PASSWORD_RESET_SENT: 'Password reset instructions have been sent to your email.',
  PASSWORD_RESET_SUCCESS: 'Your password has been reset successfully.',
  LOGOUT_SUCCESS: 'You have been signed out successfully.',
};

// Toast notification helper
export interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

export function createErrorToast(error: ApolloError): ToastOptions {
  const formattedError = formatGraphQLError(error);
  
  return {
    title: 'Error',
    description: formattedError.userMessage,
    variant: 'destructive',
    duration: 5000,
  };
}

export function createSuccessToast(message: string, title?: string): ToastOptions {
  return {
    title: title || 'Success',
    description: message,
    variant: 'success',
    duration: 4000,
  };
}