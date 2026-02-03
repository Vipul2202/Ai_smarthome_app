import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const GOOGLE_CLIENT_ID_IOS = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const GOOGLE_CLIENT_ID_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  error?: string;
}

export class GoogleAuthService {
  private static getClientId(): string {
    if (Platform.OS === 'ios') {
      return GOOGLE_CLIENT_ID_IOS!;
    } else {
      return GOOGLE_CLIENT_ID_ANDROID!;
    }
  }

  static async signIn(): Promise<GoogleAuthResult> {
    try {
      const clientId = this.getClientId();
      
      if (!clientId) {
        return {
          success: false,
          error: 'Google Client ID not configured'
        };
      }

      // Create proper redirect URI for Expo
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.smarthome.app',
        path: 'oauth'
      });

      console.log('Using redirect URI:', redirectUri);
      console.log('Using client ID:', clientId);

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        extraParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      });

      // Perform the authentication
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      console.log('Auth result type:', result.type);
      console.log('Auth result:', result);

      if (result.type === 'success') {
        try {
          // Exchange the authorization code for tokens
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId,
              code: result.params.code,
              redirectUri,
            },
            {
              tokenEndpoint: 'https://oauth2.googleapis.com/token',
            }
          );

          console.log('Token exchange result:', tokenResult);

          if (tokenResult.idToken) {
            return {
              success: true,
              idToken: tokenResult.idToken
            };
          } else {
            return {
              success: false,
              error: 'No ID token received from Google'
            };
          }
        } catch (tokenError: any) {
          console.error('Token exchange error:', tokenError);
          return {
            success: false,
            error: `Token exchange failed: ${tokenError.message}`
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'User cancelled authentication'
        };
      } else if (result.type === 'dismiss') {
        return {
          success: false,
          error: 'Authentication was dismissed. Please try again.'
        };
      } else {
        console.error('Auth failed with result:', result);
        return {
          success: false,
          error: 'Authentication failed. Please check your network connection and try again.'
        };
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed'
      };
    }
  }

  static async signOut(): Promise<void> {
    // For Google OAuth, we just need to clear local tokens
    // The actual sign-out is handled by clearing the JWT token
    console.log('Google sign-out completed');
  }
}