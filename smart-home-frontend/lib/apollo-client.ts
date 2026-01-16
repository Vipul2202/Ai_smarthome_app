import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create HTTP link
const httpLink = createHttpLink({
  uri: process.env.EXPO_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

// Create auth link
const authLink = setContext(async (_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = await AsyncStorage.getItem('authToken');
  
  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          inventoryItems: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          shoppingLists: {
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