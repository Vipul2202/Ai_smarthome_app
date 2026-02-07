import { ApolloError } from '@apollo/client';

/**
 * Extract a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return 'An unknown error occurred';
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle ApolloError
  if (error instanceof ApolloError) {
    // Check for GraphQL errors
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      const firstError = error.graphQLErrors[0];
      return firstError.message || 'A GraphQL error occurred';
    }

    // Check for network errors
    if (error.networkError) {
      return 'Network error. Please check your connection.';
    }

    // Fallback to error message
    return error.message || 'An error occurred';
  }

  // Handle Error objects
  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  // Handle objects with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any;
    
    // Check for message property
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }

    // Check for graphQLErrors array
    if (Array.isArray(errorObj.graphQLErrors) && errorObj.graphQLErrors.length > 0) {
      return errorObj.graphQLErrors[0].message || 'A GraphQL error occurred';
    }

    // Try to stringify the object
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return stringified;
      }
    } catch (e) {
      // Ignore stringify errors
    }
  }

  // Last resort
  return 'An unexpected error occurred';
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('not authenticated') ||
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('invalid token') ||
    message.includes('token expired')
  );
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('not authorized') ||
    message.includes('forbidden') ||
    message.includes('access denied') ||
    message.includes('permission denied') ||
    message.includes('only have read access')
  );
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApolloError && error.networkError) {
    return true;
  }
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('fetch failed')
  );
}

/**
 * Check if error is about accepting own house invitation
 */
export function isOwnHouseError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('your own house') ||
    message.includes('cannot join your own') ||
    message.includes('invitation is for sharing')
  );
}

/**
 * Get user-friendly error title based on error type
 */
export function getErrorTitle(error: unknown): string {
  if (isAuthError(error)) {
    return 'Authentication Required';
  }
  if (isPermissionError(error)) {
    return 'Permission Denied';
  }
  if (isNetworkError(error)) {
    return 'Connection Error';
  }
  if (isOwnHouseError(error)) {
    return 'Invalid Invitation';
  }
  return 'Error';
}
