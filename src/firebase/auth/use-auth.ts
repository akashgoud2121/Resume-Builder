'use client';

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  GithubAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
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
  
  const signInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
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
  
  const sendPasswordResetEmail = (email: string) => {
    return firebaseSendPasswordResetEmail(auth, email);
  };
  

  return { signUp, signIn, signInWithGoogle, signInWithGitHub, signOut, updateUserProfile, sendPasswordResetEmail };
}
