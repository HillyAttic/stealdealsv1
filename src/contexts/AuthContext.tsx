"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOutFn,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as firebaseUpdateProfile,
  getIdToken,
} from "firebase/auth";
import { auth } from "@/lib/auth-client";
import { User as AppUser, UserPreferences } from "@/types/auth";

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: UserData | null;
  appUser: AppUser | null;
  loading: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: () => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  signInSafe: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpSafe: (email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogleSafe: () => Promise<{ success: boolean; error?: string }>;
  signOutSafe: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_PREFERENCES: UserPreferences = {
  propertyTypes: [],
  priceRange: { min: 0, max: 10000000 },
  locations: [],
  notifications: {
    email: true,
    push: false,
    newProperties: true,
    priceAlerts: true,
  },
};

async function setTokenCookie(firebaseUser: User) {
  try {
    const idToken = await getIdToken(firebaseUser);
    await fetch("/api/auth/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  } catch (error) {
    console.error("Failed to set token cookie:", error);
  }
}

async function clearTokenCookie() {
  try {
    await fetch("/api/auth/set-token", { method: "DELETE" });
  } catch (error) {
    console.error("Failed to clear token cookie:", error);
  }
}

function toDate(value: any): Date {
  if (value instanceof Date) return value;
  if (value?.toDate && typeof value.toDate === "function") return value.toDate();
  if (value?.seconds && typeof value.seconds === "number") return new Date(value.seconds * 1000);
  if (typeof value === "string") return new Date(value);
  return new Date();
}

function toAppUser(fbUser: UserData, firestoreData?: any): AppUser {
  const now = new Date();
  return {
    id: fbUser.uid,
    email: fbUser.email || "",
    name: firestoreData?.name || fbUser.displayName || fbUser.email?.split("@")[0] || "",
    avatar: firestoreData?.avatar || fbUser.photoURL || undefined,
    role: firestoreData?.role || "user",
    provider: firestoreData?.provider || "email",
    isActive: firestoreData?.isActive !== false,
    emailVerified: fbUser.emailVerified,
    createdAt: toDate(firestoreData?.createdAt) || now,
    updatedAt: toDate(firestoreData?.updatedAt) || now,
    lastLoginAt: toDate(firestoreData?.lastLoginAt) || now,
    preferences: firestoreData?.preferences || DEFAULT_PREFERENCES,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: UserData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        };
        setUser(userData);

        // 1. Set server-verified cookie
        await setTokenCookie(firebaseUser);

        // 2. Sync user document server-side via Admin SDK (bypasses Firestore rules)
        try {
          const idToken = await getIdToken(firebaseUser);
          const syncRes = await fetch("/api/auth/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.success && syncData.user) {
              setAppUser(toAppUser(userData, syncData.user));
            } else {
              setAppUser(toAppUser(userData));
            }
          } else {
            console.warn("[AuthContext] sync-user returned non-OK:", syncRes.status);
            setAppUser(toAppUser(userData));
          }
        } catch (error: any) {
          console.error("[AuthContext] Failed to sync user document:", error.message);
          setAppUser(toAppUser(userData));
        }
      } else {
        setUser(null);
        setAppUser(null);
        await clearTokenCookie();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (auth.currentUser) {
      const refreshHandler = () => {
        if (auth.currentUser) {
          setTokenCookie(auth.currentUser);
        }
      };
      auth.currentUser.getIdTokenResult().then(refreshHandler);
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
      await firebaseUpdateProfile(userCredential.user, { displayName });
    }
  };

  const signInWithGoogleHandler = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    provider.setCustomParameters({ prompt: 'select_account' });

    // Clear any stale Firebase auth data from session storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('firebase:redirectEvent') || key.includes('firebase:pendingRedirect'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (e) {
      console.warn("[AuthContext] Failed to clear session storage:", e);
    }

    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      if (error.code === 'auth/account-exists-with-different-credential' ||
          error.code === 'auth/credential-already-in-use') {
        throw new Error('This email is already registered with a different sign-in method. Please sign in with your email and password first, then you can link Google from your account settings.');
      }
      throw error;
    }
  };

  const signOutHandler = async () => {
    await clearTokenCookie();
    await firebaseSignOutFn(auth);

    // Clear Firebase auth data from session storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('firebase:')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    } catch (e) {
      console.warn("[AuthContext] Failed to clear session storage:", e);
    }
  };

  const resetPasswordHandler = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const verifyEmailHandler = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const updateProfileData = async (updates: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) return;

    try {
      // 1. Update Firebase Auth profile (display name / photo)
      await firebaseUpdateProfile(auth.currentUser, updates);

      // 2. Update Firestore user doc via server API (bypasses client-side rules)
      const profileRes = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updates.displayName,
          avatar: updates.photoURL,
        }),
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success && profileData.user) {
          setAppUser((prev) => prev ? {
            ...prev,
            name: updates.displayName ?? prev.name,
            displayName: updates.displayName ?? prev.displayName,
            avatar: updates.photoURL ?? prev.avatar,
            photoURL: updates.photoURL ?? prev.photoURL,
          } : null);
        }
      } else {
        console.warn("[AuthContext] Profile update returned non-OK:", profileRes.status);
      }

      // 3. Sync local user state regardless
      setUser((prev) => prev ? {
        ...prev,
        displayName: updates.displayName ?? prev.displayName,
        photoURL: updates.photoURL ?? prev.photoURL,
      } : null);
    } catch (error: any) {
      console.error("[AuthContext] Failed to update profile:", error.message);
    }
  };

  const signInSafe = useCallback(async (email: string, password: string) => {
    try {
      await signIn(email, password);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : error.message || "Sign in failed",
      };
    }
  }, []);

  const signUpSafe = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      await signUp(email, password, displayName);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.code === "auth/email-already-in-use"
          ? "Email already in use"
          : error.message || "Sign up failed",
      };
    }
  }, []);

  const signInWithGoogleSafe = useCallback(async () => {
    try {
      await signInWithGoogleHandler();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Google sign in failed" };
    }
  }, []);

  const signOutSafe = useCallback(async () => {
    try {
      await signOutHandler();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Sign out failed" };
    }
  }, []);

  const value: AuthContextType = {
    user,
    appUser,
    loading,
    isLoaded: !loading,
    isSignedIn: !!user,
    userId: user?.uid || null,
    signIn,
    signUp,
    signInWithGoogle: signInWithGoogleHandler,
    signOut: signOutHandler,
    resetPassword: resetPasswordHandler,
    verifyEmail: verifyEmailHandler,
    updateProfile: updateProfileData,
    signInSafe,
    signUpSafe,
    signInWithGoogleSafe,
    signOutSafe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth state and methods - Drop-in replacement for Clerk useAuth
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    user: context.user,
    appUser: context.appUser,
    loading: context.loading,
    isSignedIn: context.isSignedIn,
    isLoaded: context.isLoaded,
    userId: context.userId,
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
    signInWithGoogle: context.signInWithGoogle,
    verifyEmail: context.verifyEmail,
    resetPassword: context.resetPassword,
    updateProfile: context.updateProfile,
  };
}

/**
 * Hook to access user data - Drop-in replacement for Clerk useUser
 */
export function useUser() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within an AuthProvider");
  }
  return {
    user: context.appUser || context.user,
    isLoaded: context.isLoaded,
    isSignedIn: context.isSignedIn,
  };
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

export default AuthProvider;
