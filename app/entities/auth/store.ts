'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';
import { authApi, type UserPublic } from './api';

// ─── Auth Store (Zustand) ────────────────────────────────────
// Manages authentication state, tokens in cookies, and user profile.

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface AuthState {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  checkAuth: () => Promise<void>;
  setUser: (user: UserPublic | null) => void;
}

function saveTokens(accessToken: string, refreshToken: string) {
  // Access token — short-lived, accessible to JS for API calls
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, {
    path: '/',
    sameSite: 'lax',
    expires: 1, // 1 day — actual expiry enforced by JWT
  });
  // Refresh token — longer-lived
  Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
    path: '/',
    sameSite: 'lax',
    expires: 30, // 30 days
  });
}

function clearTokens() {
  Cookies.remove(ACCESS_TOKEN_KEY, { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
}

function getRefreshToken(): string | undefined {
  return Cookies.get(REFRESH_TOKEN_KEY);
}

function getAccessToken(): string | undefined {
  return Cookies.get(ACCESS_TOKEN_KEY);
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const { tokens, user } = await authApi.login({ email, password });
    saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  register: async (email: string, password: string, name?: string) => {
    const { tokens, user } = await authApi.register({ email, password, name });
    saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  googleLogin: async (credential: string) => {
    const { tokens, user } = await authApi.googleLogin(credential);
    saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      const rt = getRefreshToken();
      if (rt) {
        await authApi.logout(rt);
      }
    } catch {
      // Best effort — clear tokens anyway
    }
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  refreshToken: async () => {
    const rt = getRefreshToken();
    if (!rt) return false;

    try {
      const { tokens } = await authApi.refresh(rt);
      saveTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false });
      return false;
    }
  },

  checkAuth: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const { user } = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      // Token might be expired — try refresh
      const refreshed = await get().refreshToken();
      if (refreshed) {
        try {
          const { user } = await authApi.getProfile();
          set({ user, isAuthenticated: true, isLoading: false });
          return;
        } catch {
          // Refresh succeeded but profile failed — give up
        }
      }
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user: UserPublic | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
