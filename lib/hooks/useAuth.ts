import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/authService';
import { apiService } from '../services/apiService';
import { SignInCredentials } from '@/lib/types/auth';
import { ROUTES } from '@/lib/constants/routes';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const signIn = async (credentials: SignInCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.signIn(credentials);
      authService.setAuth(response);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authService.clearAuth();
    router.push(ROUTES.AUTH);
  };

  return {
    signIn,
    signOut,
    isLoading,
    error,
    isAuthenticated: authService.isAuthenticated,
  };
};

