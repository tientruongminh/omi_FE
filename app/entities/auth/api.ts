import { apiFetch } from '@/shared/api';

// ─── Auth API Layer ───────────────────────────────────────────
// Aligned with backend response shapes from auth service

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserPublic {
  user_id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: 'student' | 'teacher' | 'admin';
  created_at: string;
}

/** Backend returns { tokens, user } for login/register/google */
export interface AuthResponse {
  tokens: AuthTokens;
  user: UserPublic;
}

/** Backend returns { tokens } for refresh */
export interface RefreshResponse {
  tokens: AuthTokens;
}

/** Backend returns { user } for /auth/me */
export interface ProfileResponse {
  user: UserPublic;
}

export interface OtpResponse {
  message: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
}

// ─── API Calls ────────────────────────────────────────────────

export const authApi = {
  /** Step 1: Send OTP to email for registration */
  sendOtp(email: string) {
    return apiFetch<OtpResponse>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /** Step 2: Verify OTP code */
  verifyOtp(email: string, code: string) {
    return apiFetch<OtpVerifyResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  },

  /** Step 3: Complete registration (returns tokens + user) */
  register(payload: RegisterPayload) {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Login with email/password (returns tokens + user) */
  login(payload: LoginPayload) {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Login with Google credential (returns tokens + user) */
  googleLogin(credential: string) {
    return apiFetch<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  /** Refresh access token (returns new tokens) */
  refresh(refreshToken: string) {
    return apiFetch<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /** Get current user profile */
  getProfile() {
    return apiFetch<ProfileResponse>('/auth/me');
  },

  /** Logout (invalidates refresh token) */
  logout(refreshToken: string) {
    return apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },
};
