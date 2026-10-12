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
  getDocFromServer,
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
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App with safe fallback for restricted environments
let appInstance: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let googleProviderInstance: any = null;

try {
  appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(appInstance);
  const databaseId = firebaseConfig.firestoreDatabaseId || 'ai-studio-49d6b286-a415-4c6a-81d0-f31de3005ba7';
  dbInstance = getFirestore(appInstance, databaseId);
  googleProviderInstance = new GoogleAuthProvider();

  // Test connection on boot
  if (dbInstance) {
    getDocFromServer(doc(dbInstance, 'test', 'connection')).catch((error) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn('Please check your Firebase configuration.');
      }
    });
  }
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo: authInstance?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const app = appInstance;
export const auth = authInstance;
export const db = dbInstance as Firestore;
export const googleProvider = googleProviderInstance;
export { firebaseConfig };

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
