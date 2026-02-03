// Network utility with fallback support
export class NetworkManager {
  private static primaryUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.65:4000';
  private static fallbackUrl = process.env.EXPO_PUBLIC_API_URL_FALLBACK || 'http://localhost:4000';
  private static currentUrl = NetworkManager.primaryUrl;
  private static isUsingFallback = false;

  static async getApiUrl(): Promise<string> {
    return NetworkManager.currentUrl;
  }

  static async testConnection(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

      const response = await fetch(`${url}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.log(`Connection test failed for ${url}:`, error);
      return false;
    }
  }

  static async ensureConnection(): Promise<string> {
    // Test current URL first
    if (await NetworkManager.testConnection(NetworkManager.currentUrl)) {
      return NetworkManager.currentUrl;
    }

    // If current URL fails, try the other one
    const alternativeUrl = NetworkManager.isUsingFallback 
      ? NetworkManager.primaryUrl 
      : NetworkManager.fallbackUrl;

    if (await NetworkManager.testConnection(alternativeUrl)) {
      NetworkManager.currentUrl = alternativeUrl;
      NetworkManager.isUsingFallback = !NetworkManager.isUsingFallback;
      console.log(`Switched to ${NetworkManager.isUsingFallback ? 'fallback' : 'primary'} URL: ${NetworkManager.currentUrl}`);
      return NetworkManager.currentUrl;
    }

    // If both fail, return current URL and let the request fail with proper error
    console.warn('Both primary and fallback URLs are unreachable');
    return NetworkManager.currentUrl;
  }

  static async makeGraphQLRequest(query: string, variables: any = {}, token?: string): Promise<any> {
    const apiUrl = await NetworkManager.ensureConnection();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    console.log('🌐 Making GraphQL request to:', `${apiUrl}/graphql`);
    console.log('🔑 Auth header present:', !!token);
    console.log('📝 Query:', query.replace(/\s+/g, ' ').trim());
    console.log('📊 Variables:', JSON.stringify(variables));

    const requestBody = {
      query: query.trim(),
      variables,
    };

    console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ HTTP Error Response:', errorText);
      throw new Error(`Network request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📋 Response data:', JSON.stringify(data, null, 2));

    if (data.errors) {
      console.error('❌ GraphQL Errors:', data.errors);
      const error = data.errors[0];
      
      // Provide specific error messages based on error type
      if (error.message.includes('Authentication required') || error.message.includes('unauthorized')) {
        throw new Error('Authentication required - please login again');
      } else if (error.message.includes('House not found') || error.message.includes('access denied')) {
        throw new Error('House access denied - please select a valid house');
      } else if (error.extensions?.code === 'GRAPHQL_VALIDATION_FAILED') {
        throw new Error(`GraphQL validation error: ${error.message}`);
      } else {
        throw new Error(error.message || 'GraphQL error occurred');
      }
    }

    return data;
  }
}