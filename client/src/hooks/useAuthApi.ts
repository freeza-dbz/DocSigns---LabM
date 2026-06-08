import { useState, useCallback } from 'react';
import { authApi } from '@/services/authApi';
import { User } from '@/types';

export const useAuthApi = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.login({ email, password });
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.register({ fullName, email, password });
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      return await authApi.forgotPassword(email);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process password reset';
      setError(message);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, password: string) => {
    try {
      setError(null);
      return await authApi.resetPassword(token, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reset password';
      setError(message);
      throw err;
    }
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authApi.verifyToken();
      setUser(response);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Token verification failed';
      setError(message);
      setUser(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    forgotPassword,
    resetPassword,
    verifyToken,
  };
};
