'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  assertFirebaseClientConfig,
  getFirebaseAuth,
  getGoogleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '@/lib/firebase';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexus_access_token',
  USER: 'nexus_user',
};

/**
 * @typedef {Object} User
 * @property {string} userId
 * @property {string} orgId
 * @property {string[]} teamIds
 * @property {string} role
 * @property {string} email
 * @property {string} name
 */

/**
 * @typedef {Object} AuthContextValue
 * @property {User | null} user
 * @property {boolean} isAuthenticated
 * @property {boolean} isLoading
 * @property {(email: string, password: string) => Promise<void>} login
 * @property {(name: string, email: string, password: string) => Promise<{ verificationEmailSent: boolean }>} register
 * @property {() => Promise<void>} loginWithGoogle
 * @property {(email: string) => Promise<void>} resetPassword
 * @property {() => Promise<void>} logout
 * @property {() => { Authorization: string } | {}} getAuthHeaders
 */

const AuthContext = createContext(/** @type {AuthContextValue} */ (undefined));

/**
 * AuthProvider – wraps the app to provide Firebase authentication state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {User | null} */ (null));
  const [accessToken, setAccessToken] = useState(/** @type {string | null} */ (null));
  const [isLoading, setIsLoading] = useState(true);

  // ── Sync with Firebase Auth state ──────────────────────────────────────
  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (err) {
      console.warn('[firebase auth] client configuration missing:', err.message);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      setIsLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Retrieve ID token for socket/API authentication
          const token = await firebaseUser.getIdToken(true);
          
          // Map roles/teams based on email address
          const email = firebaseUser.email || '';
          let role = 'member';
          let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef']; // default Engineering team

          // Grant Admin role to seed email or custom admin email formats
          if (email.startsWith('priya@') || email.includes('admin') || email === 'patel.priya@gmail.com') {
            role = 'org_admin';
            teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'];
          }

          const mappedUser = {
            userId: firebaseUser.uid,
            orgId: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0', // seed Org ID
            teamIds,
            role,
            email,
            name: firebaseUser.displayName || email.split('@')[0] || 'Nexus User',
          };

          setUser(mappedUser);
          setAccessToken(token);
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
        } catch (tokenErr) {
          console.error('[firebase auth] failed to get token:', tokenErr);
          setUser(null);
          setAccessToken(null);
        }
      } else {
        setUser(null);
        setAccessToken(null);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    assertFirebaseClientConfig();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    } catch (err) {
      console.error('[firebase auth] Email sign-in failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    assertFirebaseClientConfig();
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      const displayName = name.trim();
      if (displayName) {
        await updateProfile(credential.user, { displayName });
        await credential.user.reload();
      }

      // Force state refresh so it gets bound immediately without waiting for onAuthStateChanged delay
      const token = await credential.user.getIdToken(true);
      const emailAddr = credential.user.email || '';
      let role = 'member';
      let teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef'];

      if (emailAddr.startsWith('priya@') || emailAddr.includes('admin') || emailAddr === 'patel.priya@gmail.com') {
        role = 'org_admin';
        teamIds = ['e0c6600c-b26a-4d7a-8f12-0fbc185906ef', 'f1ca7ece-bd1f-4b07-8e6f-5799a2fe619c'];
      }

      const mappedUser = {
        userId: credential.user.uid,
        orgId: 'd7b3b9b4-523d-4c3e-9083-d9d13dbff4d0',
        teamIds,
        role,
        email: emailAddr,
        name: displayName || emailAddr.split('@')[0],
      };

      setUser(mappedUser);
      setAccessToken(token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mappedUser));
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      return { success: true };
    } catch (err) {
      console.error('[firebase auth] Email registration failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    assertFirebaseClientConfig();
    setIsLoading(true);
    try {
      await signInWithPopup(getFirebaseAuth(), getGoogleProvider());
    } catch (err) {
      console.error('[firebase auth] Google Sign-In failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    assertFirebaseClientConfig();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
    } catch (err) {
      console.error('[firebase auth] Password reset failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out.
   */
  const logout = useCallback(async () => {
      setIsLoading(true);
    try {
      await signOut(getFirebaseAuth());
    } catch (err) {
      console.error('[firebase auth] Sign-Out failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Helper to retrieve auth headers for API calls.
   */
  const getAuthHeaders = useCallback(() => {
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [accessToken]);

  const isAuthenticated = Boolean(user && accessToken);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      loginWithGoogle,
      resetPassword,
      logout,
      getAuthHeaders,
    }),
    [user, isAuthenticated, isLoading, login, register, loginWithGoogle, resetPassword, logout, getAuthHeaders]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;
