import { apolloClient } from './apollo-client';
import { ApolloError } from '@apollo/client';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  retryAfter?: number;
}

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

class ApiClient {
  private defaultRetryOptions: RetryOptions = {
    maxRetries: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
  };

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number, options: RetryOptions): number {
    const { baseDelay = 1000, maxDelay = 10000, backoffFactor = 2 } = options;
    const delay = baseDelay * Math.pow(backoffFactor, attempt - 1);
    return Math.min(delay, maxDelay);
  }

  private shouldRetry(error: ApolloError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    // Don't retry authentication errors
    if (error.graphQLErrors?.some(e => 
      ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(e.extensions?.code as string)
    )) {
      return false;
    }

    // Don't retry validation errors
    if (error.graphQLErrors?.some(e => 
      ['VALIDATION_ERROR', 'INVALID_INPUT'].includes(e.extensions?.code as string)
    )) {
      return false;
    }

    // Retry network errors and server errors
    if (error.networkError) return true;
    if (error.graphQLErrors?.some(e => 
      ['INTERNAL_ERROR', 'DATABASE_ERROR', 'RATE_LIMIT_EXCEEDED'].includes(e.extensions?.code as string)
    )) {
      return true;
    }

    return false;
  }

  private handleError(error: ApolloError): ApiResponse {
    console.error('API Error:', error);

    // Handle GraphQL errors
    if (error.graphQLErrors?.length > 0) {
      const graphQLError = error.graphQLErrors[0];
      const code = graphQLError.extensions?.code as string;
      const userMessage = graphQLError.extensions?.userMessage as string;
      
      // Handle rate limiting
      if (code === 'RATE_LIMIT_EXCEEDED') {
        return {
          success: false,
          error: userMessage || 'Too many requests. Please try again later.',
          code,
          retryAfter: graphQLError.extensions?.retryAfter as number,
        };
      }

      // Handle authentication errors
      if (['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(code)) {
        return {
          success: false,
          error: 'Authentication required. Please log in again.',
          code,
        };
      }

      // Handle validation errors
      if (['VALIDATION_ERROR', 'INVALID_INPUT'].includes(code)) {
        return {
          success: false,
          error: userMessage || graphQLError.message,
          code,
        };
      }

      // Handle other GraphQL errors
      return {
        success: false,
        error: userMessage || graphQLError.message,
        code,
      };
    }

    // Handle network errors
    if (error.networkError) {
      if ('statusCode' in error.networkError) {
        const statusCode = error.networkError.statusCode;
        
        if (statusCode === 429) {
          return {
            success: false,
            error: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED',
          };
        }
        
        if (statusCode >= 500) {
          return {
            success: false,
            error: 'Server error. Please try again later.',
            code: 'SERVER_ERROR',
          };
        }
      }

      return {
        success: false,
        error: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // Fallback error
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
    };
  }

  async query<T = any>(
    query: any,
    variables?: any,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const options = { ...this.defaultRetryOptions, ...retryOptions };
    let lastError: ApolloError;

    for (let attempt = 1; attempt <= (options.maxRetries || 3); attempt++) {
      try {
        const result = await apolloClient.query({
          query,
          variables,
          fetchPolicy: 'cache-first',
          errorPolicy: 'all',
        });

        if (result.errors && result.errors.length > 0) {
          throw new ApolloError({
            graphQLErrors: result.errors,
          });
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        lastError = error as ApolloError;

        if (!this.shouldRetry(lastError, attempt, options.maxRetries || 3)) {
          break;
        }

        if (attempt < (options.maxRetries || 3)) {
          const delay = this.calculateDelay(attempt, options);
          console.log(`Retrying query in ${delay}ms (attempt ${attempt + 1})`);
          await this.delay(delay);
        }
      }
    }

    return this.handleError(lastError!);
  }

  async mutate<T = any>(
    mutation: any,
    variables?: any,
    retryOptions?: RetryOptions
  ): Promise<ApiResponse<T>> {
    const options = { ...this.defaultRetryOptions, ...retryOptions };
    let lastError: ApolloError;

    for (let attempt = 1; attempt <= (options.maxRetries || 3); attempt++) {
      try {
        const result = await apolloClient.mutate({
          mutation,
          variables,
          errorPolicy: 'all',
        });

        if (result.errors && result.errors.length > 0) {
          throw new ApolloError({
            graphQLErrors: result.errors,
          });
        }

        return {
          success: true,
          data: result.data,
        };
      } catch (error) {
        lastError = error as ApolloError;

        if (!this.shouldRetry(lastError, attempt, options.maxRetries || 3)) {
          break;
        }

        if (attempt < (options.maxRetries || 3)) {
          const delay = this.calculateDelay(attempt, options);
          console.log(`Retrying mutation in ${delay}ms (attempt ${attempt + 1})`);
          await this.delay(delay);
        }
      }
    }

    return this.handleError(lastError!);
  }

  // Utility method to check if the API is reachable
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL?.replace('/graphql', '/health') || 'http://localhost:4000/health'
      );
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Clear Apollo cache
  clearCache(): void {
    apolloClient.clearStore();
  }

  // Reset Apollo store
  resetStore(): void {
    apolloClient.resetStore();
  }
}

export const apiClient = new ApiClient();

// Export utility functions
export const isNetworkError = (error: any): boolean => {
  return error?.networkError !== undefined;
};

export const isAuthError = (error: any): boolean => {
  const code = error?.graphQLErrors?.[0]?.extensions?.code;
  return ['UNAUTHORIZED', 'INVALID_TOKEN', 'TOKEN_EXPIRED'].includes(code);
};

export const isRateLimitError = (error: any): boolean => {
  const code = error?.graphQLErrors?.[0]?.extensions?.code;
  return code === 'RATE_LIMIT_EXCEEDED';
};

export const getErrorMessage = (error: any): string => {
  if (error?.graphQLErrors?.[0]?.extensions?.userMessage) {
    return error.graphQLErrors[0].extensions.userMessage;
  }
  if (error?.graphQLErrors?.[0]?.message) {
    return error.graphQLErrors[0].message;
  }
  if (error?.networkError) {
    return 'Network error. Please check your connection.';
  }
  return 'An unexpected error occurred.';
};