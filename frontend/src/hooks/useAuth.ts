import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import { AxiosError } from 'axios';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, setError, initializeAuth } = useAuthStore();

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Registration failed');
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      await authService.login(data);
      return authService.getCurrentUser();
    },
    onSuccess: (user) => {
      login(user);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Login failed');
    },
  });

  const { refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      logout();
    },
  });

  const sendOTPMutation = useMutation({
    mutationFn: (email: string) => authService.sendOTP({ email }),
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  const verifyOTPMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) => authService.verifyOTP(data),
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Verification failed');
    },
  });

  return {
    user,
    isAuthenticated,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout: logoutMutation.mutate,
    sendOTP: sendOTPMutation.mutate,
    sendOTPAsync: sendOTPMutation.mutateAsync,
    isSendingOTP: sendOTPMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    verifyOTPAsync: verifyOTPMutation.mutateAsync,
    isVerifyingOTP: verifyOTPMutation.isPending,
    refetchUser,
    initializeAuth,
  };
};
