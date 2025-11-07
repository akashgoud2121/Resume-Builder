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
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { useFirebase } from '../provider';
import { useEffect } from 'react';

export function useAuthActions() {
  const { app } = useFirebase();
  const auth = getAuth(app);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': (response: any) => {
              // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
  }, [auth]);


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
  
  const sendPhoneNumberOtp = async (phoneNumber: string) => {
    const appVerifier = window.recaptchaVerifier;
    return await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  };

  const verifyOtp = async (confirmationResult: ConfirmationResult, code: string) => {
    return await confirmationResult.confirm(code);
  };


  return { signUp, signIn, signInWithGoogle, signInWithGitHub, signOut, updateUserProfile, sendPhoneNumberOtp, verifyOtp };
}

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}
