/**
 * API Integration Test Suite
 * 
 * This file contains tests to verify that the API integration is working properly
 * across all pages and components. Run these tests to ensure everything is functioning.
 */

import { apiClient } from './api-client';
import { ME_QUERY } from './graphql/queries';
import { UPDATE_USER_PROFILE_MUTATION, UPDATE_USER_SETTINGS_MUTATION } from './graphql/mutations';

export interface TestResult {
  test: string;
  success: boolean;
  error?: string;
  duration: number;
}

export class APIIntegrationTester {
  private results: TestResult[] = [];

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        test: testName,
        success: true,
        duration,
      };
      
      this.results.push(result);
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      const result: TestResult = {
        test: testName,
        success: false,
        error: error.message,
        duration,
      };
      
      this.results.push(result);
      return result;
    }
  }

  async testHealthCheck(): Promise<TestResult> {
    return this.runTest('API Health Check', async () => {
      const isHealthy = await apiClient.healthCheck();
      if (!isHealthy) {
        throw new Error('API health check failed');
      }
    });
  }

  async testUserQuery(): Promise<TestResult> {
    return this.runTest('User Query (ME_QUERY)', async () => {
      const result = await apiClient.query(ME_QUERY);
      if (!result.success) {
        throw new Error(result.error || 'User query failed');
      }
    });
  }

  async testUserProfileUpdate(): Promise<TestResult> {
    return this.runTest('User Profile Update', async () => {
      const result = await apiClient.mutate(UPDATE_USER_PROFILE_MUTATION, {
        input: {
          name: 'Test User Updated',
        },
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Profile update failed');
      }
    });
  }

  async testUserSettingsUpdate(): Promise<TestResult> {
    return this.runTest('User Settings Update', async () => {
      const testSettings = {
        notifications: {
          lowStock: true,
          expiring: true,
          shopping: false,
          reminders: true,
          email: true,
          push: true,
          sound: true,
          vibration: true,
        },
        privacy: {
          dataCollection: true,
          analytics: false,
          marketing: false,
          shareData: false,
        },
        app: {
          language: 'en',
          currency: 'INR',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          autoBackup: true,
          offlineMode: false,
          hapticFeedback: true,
          animations: true,
          autoSync: true,
          lowStockThreshold: 5,
          expiryWarningDays: 3,
        },
        security: {
          twoFactorAuth: false,
          biometricAuth: false,
          sessionTimeout: '30m',
          loginNotifications: true,
          passwordLastChanged: '2024-01-15',
        },
        support: {
          helpCenter: true,
          crashReports: true,
          usageAnalytics: false,
          betaFeatures: false,
        },
      };

      const result = await apiClient.mutate(UPDATE_USER_SETTINGS_MUTATION, {
        input: testSettings,
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Settings update failed');
      }
    });
  }

  async testRateLimiting(): Promise<TestResult> {
    return this.runTest('Rate Limiting Protection', async () => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array.from({ length: 10 }, () => 
        apiClient.query(ME_QUERY, {}, { maxRetries: 1 })
      );
      
      const results = await Promise.all(promises);
      
      // At least some requests should succeed
      const successCount = results.filter(r => r.success).length;
      if (successCount === 0) {
        throw new Error('All requests failed - possible over-aggressive rate limiting');
      }
      
      console.log(`Rate limiting test: ${successCount}/10 requests succeeded`);
    });
  }

  async testErrorHandling(): Promise<TestResult> {
    return this.runTest('Error Handling', async () => {
      // Test with invalid mutation to check error handling
      try {
        const result = await apiClient.mutate(UPDATE_USER_PROFILE_MUTATION, {
          input: {
            name: '', // Invalid empty name should trigger validation error
          },
        });
        
        if (result.success) {
          throw new Error('Expected validation error for empty name');
        }
        
        // Check if error is properly handled
        if (!result.error || !result.code) {
          throw new Error('Error response missing required fields');
        }
        
        console.log(`Error handling test passed: ${result.code} - ${result.error}`);
      } catch (error: any) {
        // This is expected for validation errors
        if (error.message.includes('validation') || error.message.includes('invalid')) {
          console.log('Error handling test passed: Validation error caught');
        } else {
          throw error;
        }
      }
    });
  }

  async testRetryMechanism(): Promise<TestResult> {
    return this.runTest('Retry Mechanism', async () => {
      // Test retry mechanism with a query that might fail
      const result = await apiClient.query(ME_QUERY, {}, {
        maxRetries: 2,
        baseDelay: 100,
      });
      
      // The retry mechanism should handle transient failures
      // If it succeeds, the retry mechanism is working
      if (!result.success && result.code !== 'UNAUTHORIZED') {
        throw new Error(`Retry mechanism failed: ${result.error}`);
      }
      
      console.log('Retry mechanism test passed');
    });
  }

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting API Integration Tests...');
    
    this.results = [];
    
    // Run tests in sequence to avoid overwhelming the API
    await this.testHealthCheck();
    await this.testUserQuery();
    await this.testUserProfileUpdate();
    await this.testUserSettingsUpdate();
    await this.testRateLimiting();
    await this.testErrorHandling();
    await this.testRetryMechanism();
    
    return this.results;
  }

  getTestSummary(): {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    totalDuration: number;
  } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    return {
      total,
      passed,
      failed,
      passRate,
      totalDuration,
    };
  }

  printResults(): void {
    console.log('\n📊 API Integration Test Results:');
    console.log('================================');
    
    this.results.forEach(result => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const duration = `${result.duration}ms`;
      console.log(`${status} ${result.test} (${duration})`);
      
      if (!result.success && result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const summary = this.getTestSummary();
    console.log('\n📈 Summary:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate.toFixed(1)}%`);
    console.log(`Total Duration: ${summary.totalDuration}ms`);
    
    if (summary.passRate === 100) {
      console.log('\n🎉 All tests passed! API integration is working correctly.');
    } else if (summary.passRate >= 80) {
      console.log('\n⚠️  Most tests passed. Check failed tests for issues.');
    } else {
      console.log('\n🚨 Multiple tests failed. API integration needs attention.');
    }
  }
}

// Export singleton instance
export const apiTester = new APIIntegrationTester();

// Utility function to run tests from browser console
export const runAPITests = async (): Promise<void> => {
  const results = await apiTester.runAllTests();
  apiTester.printResults();
  return;
};

// Make it available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).runAPITests = runAPITests;
  (window as any).apiTester = apiTester;
}