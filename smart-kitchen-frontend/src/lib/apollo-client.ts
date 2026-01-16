import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = typeof window !== 'undefined' ? localStorage.getItem('kitchen_auth_token') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      const errorCode = extensions?.code;
      const userMessage = extensions?.userMessage || message;
      
      console.error(
        `[GraphQL error]: Code: ${errorCode}, Message: ${message}, User Message: ${userMessage}, Location: ${locations}, Path: ${path}`
      );

      // Handle authentication errors
      if (errorCode === 'UNAUTHORIZED' || errorCode === 'INVALID_TOKEN' || errorCode === 'TOKEN_EXPIRED') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kitchen_auth_token');
          localStorage.removeItem('kitchen_user_data');
          
          // Only redirect if not already on auth pages
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password')) {
            window.location.href = '/login';
          }
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    // Handle network-level authentication errors
    if ('statusCode' in networkError && networkError.statusCode === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kitchen_auth_token');
        localStorage.removeItem('kitchen_user_data');
        
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password')) {
          window.location.href = '/login';
        }
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      InventoryItem: {
        fields: {
          batches: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
      ShoppingList: {
        fields: {
          items: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});