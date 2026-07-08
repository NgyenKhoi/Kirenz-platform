import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';
import { LoginRequest, RegisterRequest, UpdateProfileRequest } from '../types/auth.types';
import { AxiosError } from 'axios';

export const useAuth = () => {
  const { user, isAuthenticated, login, logout, setError, initializeAuth, setUser } = useAuthStore();


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

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken: string) => {
      await authService.loginWithGoogle({ idToken });
      return authService.getCurrentUser();
    },
    onSuccess: (user) => {
      login(user);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Google login failed');
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

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Failed to update profile');
    },
  });


  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => authService.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Failed to upload avatar');
    },
  });

  const uploadCoverMutation = useMutation({
    mutationFn: (file: File) => authService.uploadCover(file),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
    },
    onError: (error: AxiosError<{ message: string }>) => {
      setError(error.response?.data?.message || 'Failed to upload cover photo');
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
    googleLoginAsync: googleLoginMutation.mutateAsync,
    isGoogleLoggingIn: googleLoginMutation.isPending,
    googleLoginError: googleLoginMutation.error,
    logout: logoutMutation.mutate,
    sendOTP: sendOTPMutation.mutate,
    sendOTPAsync: sendOTPMutation.mutateAsync,
    isSendingOTP: sendOTPMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    verifyOTPAsync: verifyOTPMutation.mutateAsync,
    isVerifyingOTP: verifyOTPMutation.isPending,
    updateProfile: updateProfileMutation.mutate,
    updateProfileAsync: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateProfileSuccess: updateProfileMutation.isSuccess,
    uploadAvatar: uploadAvatarMutation.mutate,
    uploadAvatarAsync: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    uploadCover: uploadCoverMutation.mutate,
    uploadCoverAsync: uploadCoverMutation.mutateAsync,
    isUploadingCover: uploadCoverMutation.isPending,
    refetchUser,
    initializeAuth,
  };

};

