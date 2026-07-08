export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  createdAt: string;
  otpSent?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  coverPhotoUrl?: string;
  bio?: string;
  birthDate?: string;
  gender?: string;
  location?: string;
  website?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  allowDirectMessages?: boolean;
  profilePrivate?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string>;
  timestamp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// OTP Verification Types
export interface SendOTPRequest {
  email: string;
}

export interface SendOTPResponse {
  message: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface VerifyOTPResponse {
  message: string;
  emailVerifiedAt: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  birthDate?: string | null;
  gender?: string | null;
  location?: string | null;
  website?: string | null;
  allowDirectMessages?: boolean;
  profilePrivate?: boolean;
}


