import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Load config from firebase-applet-config.json
const firebaseConfig = {
  projectId: "optical-depth-ft3g1",
  appId: "1:287627778247:web:6251a0cf38ad158d0246e2",
  apiKey: "AIzaSyA-ZwXGrd0nRpWXyOvCRkOg1EzYK6IbtNk",
  authDomain: "optical-depth-ft3g1.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-49d6b286-a415-4c6a-81d0-f31de3005ba7",
  storageBucket: "optical-depth-ft3g1.firebasestorage.app",
  messagingSenderId: "287627778247",
};

// Initialize Firebase App with safe fallback for restricted environments
let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let googleProviderInstance: any = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(appInstance, firebaseConfig.firestoreDatabaseId)
    : getFirestore(appInstance);
  googleProviderInstance = new GoogleAuthProvider();
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance as Firestore;
export const googleProvider = googleProviderInstance;

export {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
};
export type { FirebaseUser };
