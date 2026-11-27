import React, { createContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, increment, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import type { AuthContextValue, UserProfile } from '../types';

export const AuthContext = createContext<AuthContextValue>(null as unknown as AuthContextValue);

const USERS = 'users';

function profileFromFirebase(fbUser: FirebaseUser, extra: Partial<UserProfile> = {}): UserProfile {
  return {
    uid: fbUser.uid,
    id: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    photoURL: fbUser.photoURL,
    fullName: fbUser.displayName || extra.fullName || '',
    name: extra.name || fbUser.displayName || '',
    createdAt: fbUser.metadata?.creationTime,
    totalScans: 0,
    ...extra,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firebase owns the session; Firestore owns the extended profile.
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, USERS, fbUser.uid));
        const stored = snap.exists() ? (snap.data() as UserProfile) : {};
        setUser({ ...profileFromFirebase(fbUser), ...stored, uid: fbUser.uid });
      } catch (error) {
        console.warn('Could not load user profile from Firestore:', error);
        setUser(profileFromFirebase(fbUser));
      } finally {
        setIsLoading(false);
      }
    });
  }, []);

  const persistProfile = async (uid: string, data: Partial<UserProfile>) => {
    await setDoc(doc(db, USERS, uid), { ...data, uid, updatedAt: serverTimestamp() }, { merge: true });
  };

  const signIn = async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const snap = await getDoc(doc(db, USERS, credential.user.uid));
    setUser({
      ...profileFromFirebase(credential.user),
      ...(snap.exists() ? (snap.data() as UserProfile) : {}),
    });
  };

  const signUp = async (email: string, password: string, profile: Partial<UserProfile> = {}) => {
    const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const displayName = profile.fullName || profile.name || email.split('@')[0];
    await updateProfile(credential.user, { displayName });
    const newProfile = profileFromFirebase(credential.user, { ...profile, fullName: displayName });
    await persistProfile(credential.user.uid, newProfile);
    setUser(newProfile);
  };

  const signInWithGoogle = async () => {
    const credential = await signInWithPopup(auth, googleProvider);
    const fbUser = credential.user;
    const snap = await getDoc(doc(db, USERS, fbUser.uid));
    const existing = snap.exists() ? (snap.data() as UserProfile) : {};
    const merged = { ...profileFromFirebase(fbUser), ...existing };
    await persistProfile(fbUser.uid, merged);
    setUser(merged);
  };

  // Retained for callers that only need to seed local state.
  const loginContext = (userData: UserProfile) => {
    setUser((prev) => ({ ...(prev || {}), ...userData } as UserProfile));
    if (userData?.uid) void persistProfile(userData.uid, userData).catch(console.warn);
  };

  const logoutContext = async () => {
    await signOut(auth);
    setUser(null);
  };

  const updateUser = (newData: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...(prev || {}), ...newData } as UserProfile;
      if (updated.uid) {
        void persistProfile(updated.uid, newData).catch((error) =>
          console.warn('Could not save profile to Firestore:', error)
        );
      }
      return updated;
    });
  };

  const incrementTotalScans = () => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, totalScans: (prev.totalScans || 0) + 1 };
      if (updated.uid) {
        void updateDoc(doc(db, USERS, updated.uid), {
          totalScans: increment(1),
          updatedAt: serverTimestamp(),
        }).catch((error) => console.warn('Could not update scan count:', error));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isLoggedIn: !!user,
        signIn,
        signUp,
        signInWithGoogle,
        login: loginContext,
        logout: logoutContext,
        updateUser,
        incrementTotalScans,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
