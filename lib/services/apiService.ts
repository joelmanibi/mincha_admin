import { authService } from './authService';
import { SignInCredentials, AuthResponse } from '@/lib/types/auth';

const API_BASE_URL = 'http://dev-mani.tech:8000';

export const apiService = {
  signIn: async (credentials: SignInCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/user/signin-sudo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred during sign in');
    }

    return response.json();
  },

  // Add other API calls here
};

