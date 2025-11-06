'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { useFirebase } from '../provider';

export function useAuthActions() {
  const { app } = useFirebase();
  const auth = getAuth(app);

  const signUp = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await updateProfile(userCredential.user, { displayName });
    return userCredential;
  };

  const signIn = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  };

  const signOut = () => {
    return firebaseSignOut(auth);
  };

  const updateUserProfile = (displayName: string) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in.');
    }
    return updateProfile(auth.currentUser, { displayName });
  };

  return { signUp, signIn, signInWithGoogle, signOut, updateUserProfile };
}
