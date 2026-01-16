import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL configuration with fallbacks
const API_URLS = [
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:4000',
  process.env.EXPO_PUBLIC_API_URL_FALLBACK_1 || 'http://localhost:4000',
  process.env.EXPO_PUBLIC_API_URL_FALLBACK_2 || 'http://10.0.2.2:4000',
];

let workingApiUrl: string | null = null;

// Test if an API URL is working
async function testApiUrl(url: string): Promise<boolean> {
  try {
    console.log(`🔍 Testing API URL: ${url}`);
    
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout after 5 seconds')), 5000);
    });

    // Race between fetch and timeout
    const response = await Promise.race([
      fetch(`${url}/health`, { method: 'GET' }),
      timeoutPromise
    ]);
    
    const isOk = response.ok;
    console.log(`${isOk ? '✅' : '❌'} API URL ${url}: ${response.status} ${response.statusText}`);
    return isOk;
  } catch (error) {
    console.log(`❌ API URL ${url} failed:`, error.message);
    return false;
  }
}

// Find a working API URL
export async function getWorkingApiUrl(): Promise<string> {
  console.log('🔍 Finding working API URL...');
  
  // Return cached working URL if available
  if (workingApiUrl) {
    console.log(`📋 Using cached URL: ${workingApiUrl}`);
    return workingApiUrl;
  }

  // Check if we have a cached working URL
  try {
    const cachedUrl = await AsyncStorage.getItem('workingApiUrl');
    if (cachedUrl) {
      console.log(`🔍 Testing cached URL: ${cachedUrl}`);
      const isWorking = await testApiUrl(cachedUrl);
      if (isWorking) {
        workingApiUrl = cachedUrl;
        console.log(`✅ Cached URL is working: ${cachedUrl}`);
        return cachedUrl;
      } else {
        console.log(`❌ Cached URL is no longer working: ${cachedUrl}`);
      }
    }
  } catch (error) {
    console.log('⚠️ Error checking cached API URL:', error);
  }

  // Test each URL to find a working one
  console.log(`🔍 Testing ${API_URLS.length} API URLs...`);
  for (const url of API_URLS) {
    const isWorking = await testApiUrl(url);
    if (isWorking) {
      workingApiUrl = url;
      // Cache the working URL
      try {
        await AsyncStorage.setItem('workingApiUrl', url);
        console.log(`💾 Cached working URL: ${url}`);
      } catch (error) {
        console.log('⚠️ Error caching API URL:', error);
      }
      console.log(`✅ Found working API URL: ${url}`);
      return url;
    }
  }

  // If no URL works, return the first one as fallback
  console.warn('❌ No working API URL found, using fallback:', API_URLS[0]);
  return API_URLS[0];
}

// Make a GraphQL request with automatic URL discovery
export async function makeGraphQLRequest(query: string, variables?: any, token?: string) {
  console.log('🚀 Making GraphQL request...');
  
  const apiUrl = await getWorkingApiUrl();
  console.log(`📡 Using API URL: ${apiUrl}`);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔐 Using authentication token');
  }

  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      console.log(`❌ HTTP error! status: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ GraphQL request successful');
    return data;
  } catch (error: any) {
    console.log('❌ GraphQL request failed:', error?.message || error);
    throw error;
  }
}

// Reset the working API URL (useful for testing or when connection fails)
export function resetApiUrl() {
  workingApiUrl = null;
  AsyncStorage.removeItem('workingApiUrl').catch(console.error);
}