'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  signOut, signInWithGoogle as dbSignInWithGoogle, getCurrentUser,
  dbDeleteAccount, dbGetPrivacyConsent, dbSavePrivacyConsent, TERMS_VERSION,
} from '../db';

interface UserState {
  userId: string | null;
  authUser: { id: string; username: string } | null;
  nickname: string;
  termsAccepted: boolean;

  setNickname: (n: string) => void;
  setAuthUser: (u: { id: string; username: string } | null) => void;
  checkAuth: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  acceptTerms: (contentHash: string, content: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userId: null,
      authUser: null,
      nickname: '',
      termsAccepted: false,

      setNickname: (n) => set({ nickname: n }),
      setAuthUser: (u) => set({ authUser: u, userId: u?.id ?? null }),

      checkAuth: async () => {
        const user = await getCurrentUser();
        if (!user) return;
        set({ authUser: user, userId: user.id });
        const consent = await dbGetPrivacyConsent(user.id).catch(() => null);
        set({ termsAccepted: !!(consent && consent.content_hash === TERMS_VERSION) });
      },

      signInWithGoogle: async () => {
        await dbSignInWithGoogle();
      },

      logout: () => {
        signOut().catch(() => {});
        set({ authUser: null, userId: null, nickname: '' });
      },

      deleteAccount: async () => {
        await dbDeleteAccount();
        set({ authUser: null, userId: null, termsAccepted: false });
      },

      acceptTerms: async (contentHash, content) => {
        try { await dbSavePrivacyConsent(contentHash, content); } catch {}
        set({ termsAccepted: true });
      },
    }),
    {
      name: 'trippy-user',
      partialize: (s) => ({
        userId: s.userId,
        authUser: s.authUser,
        nickname: s.nickname,
        termsAccepted: s.termsAccepted,
      }),
    }
  )
);
