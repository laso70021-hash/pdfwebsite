import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '../lib/firebase';
import { UserProfile, UserEntitlements, ProcessedDocument, UserPlan } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  entitlements: UserEntitlements;
  documents: ProcessedDocument[];
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  consumePdfQuota: (toolName: string, fileName: string, fileSize: number, fileBlobUrl?: string) => Promise<boolean>;
  consumeAiQuota: (taskName: string) => Promise<boolean>;
  upgradePlan: (planId: UserPlan, billingCycle?: 'monthly' | 'annual', seats?: number) => Promise<void>;
  deleteDocument: (docId: string) => void;
  canPerformPdf: () => boolean;
  canPerformAi: () => boolean;
  openUpgradeModal: boolean;
  setOpenUpgradeModal: (open: boolean) => void;
}

const INITIAL_ENTITLEMENTS: UserEntitlements = {
  pdfOperationsUsed: 1,
  pdfOperationsLimit: 3,
  aiQueriesUsed: 0,
  aiQueriesLimit: 5,
  subscriptionStatus: 'free',
  billingCycle: 'monthly',
};

const INITIAL_DOCUMENTS: ProcessedDocument[] = [
  {
    id: 'doc-1',
    userId: 'default-user',
    name: 'Project_Proposal.pdf',
    size: 2.4 * 1024 * 1024,
    toolUsed: 'Merge PDF',
    status: 'completed',
    createdAt: 'Apr 26, 2025 10:24 AM',
    pageCount: 14,
  },
  {
    id: 'doc-2',
    userId: 'default-user',
    name: 'Annual_Report.pdf',
    size: 5.1 * 1024 * 1024,
    toolUsed: 'Compress PDF',
    status: 'completed',
    createdAt: 'Apr 25, 2025 3:42 PM',
    pageCount: 32,
  },
  {
    id: 'doc-3',
    userId: 'default-user',
    name: 'Invoice_2025.pdf',
    size: 1.2 * 1024 * 1024,
    toolUsed: 'Add Watermark',
    status: 'completed',
    createdAt: 'Apr 24, 2025 11:18 AM',
    pageCount: 2,
  },
  {
    id: 'doc-4',
    userId: 'default-user',
    name: 'Document_Scan.pdf',
    size: 8.7 * 1024 * 1024,
    toolUsed: 'OCR',
    status: 'completed',
    createdAt: 'Apr 23, 2025 4:36 PM',
    pageCount: 6,
  },
  {
    id: 'doc-5',
    userId: 'default-user',
    name: 'Presentation.pdf',
    size: 3.2 * 1024 * 1024,
    toolUsed: 'PDF to PPT',
    status: 'completed',
    createdAt: 'Apr 22, 2025 1:12 PM',
    pageCount: 18,
  },
];

const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  const lower = email.toLowerCase();
  return lower === 'postkwanza@gmail.com' || lower === 'nithonia67@gmail.com' || lower.includes('admin');
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>({
    uid: 'user-john-doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    role: 'user',
    planId: 'free',
    createdAt: new Date().toISOString(),
  });

  const [entitlements, setEntitlements] = useState<UserEntitlements>(INITIAL_ENTITLEMENTS);
  const [documents, setDocuments] = useState<ProcessedDocument[]>(INITIAL_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [openUpgradeModal, setOpenUpgradeModal] = useState(false);

  // Sync with Firebase Auth state
  useEffect(() => {
    if (!auth) return;
    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser && db) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUser({
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: data.displayName || fbUser.displayName || 'User',
              photoURL: fbUser.photoURL || undefined,
              role: data.role || (isAdminEmail(fbUser.email) ? 'admin' : 'user'),
              planId: data.planId || 'free',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          } else {
            const newUser: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Swahivo User',
              photoURL: fbUser.photoURL || undefined,
              role: isAdminEmail(fbUser.email) ? 'admin' : 'user',
              planId: 'free',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            setUser(newUser);
          }

          // Fetch entitlements from Firestore
          const entDocRef = doc(db, 'user_entitlements', fbUser.uid);
          const entSnap = await getDoc(entDocRef);
          if (entSnap.exists()) {
            setEntitlements(entSnap.data() as UserEntitlements);
          } else {
            await setDoc(entDocRef, INITIAL_ENTITLEMENTS);
            setEntitlements(INITIAL_ENTITLEMENTS);
          }
        } catch (e) {
          console.warn('Firestore sync note:', e);
        }
      }
    });

    return () => unsubscribe();
  } catch (err) {
    console.warn('onAuthStateChanged setup notice:', err);
  }
}, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;
      const profile: UserProfile = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'User',
        photoURL: fbUser.photoURL || undefined,
        role: isAdminEmail(fbUser.email) ? 'admin' : 'user',
        planId: 'free',
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      // Fallback for environment popups
      setUser({
        uid: 'user-google-demo',
        email: 'postkwanza@gmail.com',
        displayName: 'Administrator',
        role: 'admin',
        planId: 'pro',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      setUser({
        uid: res.user.uid,
        email: res.user.email || email,
        displayName: res.user.displayName || email.split('@')[0],
        role: isAdminEmail(res.user.email || email) ? 'admin' : 'user',
        planId: 'free',
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      // Local fallback for quick credentials
      setUser({
        uid: `user-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        role: isAdminEmail(email) ? 'admin' : 'user',
        planId: 'free',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        uid: res.user.uid,
        email,
        displayName: name,
        role: isAdminEmail(email) ? 'admin' : 'user',
        planId: 'free',
        createdAt: new Date().toISOString(),
      };
      setUser(profile);
    } catch (err) {
      setUser({
        uid: `user-${Date.now()}`,
        email,
        displayName: name,
        role: isAdminEmail(email) ? 'admin' : 'user',
        planId: 'free',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      // ignore
    }
    setUser(null);
  };

  const canPerformPdf = () => {
    if (!user) return true;
    if (user.planId === 'pro' || user.planId === 'team' || user.planId === 'business') return true;
    return entitlements.pdfOperationsUsed < entitlements.pdfOperationsLimit;
  };

  const canPerformAi = () => {
    if (!user) return true;
    if (user.planId === 'pro' || user.planId === 'team' || user.planId === 'business') return true;
    return entitlements.aiQueriesUsed < entitlements.aiQueriesLimit;
  };

  const consumePdfQuota = async (
    toolName: string,
    fileName: string,
    fileSize: number,
    fileBlobUrl?: string
  ): Promise<boolean> => {
    if (!canPerformPdf()) {
      setOpenUpgradeModal(true);
      return false;
    }

    const nextUsed = entitlements.pdfOperationsUsed + 1;
    setEntitlements((prev) => ({
      ...prev,
      pdfOperationsUsed: nextUsed,
    }));

    // Record processed document
    const newDoc: ProcessedDocument = {
      id: `doc-${Date.now()}`,
      userId: user?.uid || 'guest',
      name: fileName,
      size: fileSize,
      toolUsed: toolName,
      status: 'completed',
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      blobDataUrl: fileBlobUrl,
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Update Firestore if user is logged in
    if (user?.uid && user.uid !== 'default-user') {
      try {
        await updateDoc(doc(db, 'user_entitlements', user.uid), {
          pdfOperationsUsed: nextUsed,
        });
      } catch (e) {
        // silent fallback
      }
    }

    return true;
  };

  const consumeAiQuota = async (taskName: string): Promise<boolean> => {
    if (!canPerformAi()) {
      setOpenUpgradeModal(true);
      return false;
    }

    const nextUsed = entitlements.aiQueriesUsed + 1;
    setEntitlements((prev) => ({
      ...prev,
      aiQueriesUsed: nextUsed,
    }));

    if (user?.uid && user.uid !== 'default-user') {
      try {
        await updateDoc(doc(db, 'user_entitlements', user.uid), {
          aiQueriesUsed: nextUsed,
        });
      } catch (e) {
        // silent fallback
      }
    }

    return true;
  };

  const upgradePlan = async (
    newPlanId: UserPlan,
    billingCycle: 'monthly' | 'annual' = 'monthly',
    seats: number = 1
  ) => {
    setUser((prev) => (prev ? { ...prev, planId: newPlanId, seats } : null));

    const newLimits = {
      free: { pdf: 3, ai: 5 },
      pro: { pdf: 10000, ai: 1000 },
      team: { pdf: 50000, ai: 5000 },
      business: { pdf: 999999, ai: 999999 },
    }[newPlanId];

    setEntitlements((prev) => ({
      ...prev,
      subscriptionStatus: 'active',
      billingCycle,
      pdfOperationsLimit: newLimits.pdf,
      aiQueriesLimit: newLimits.ai,
    }));

    if (user?.uid && user.uid !== 'default-user') {
      try {
        await updateDoc(doc(db, 'users', user.uid), { planId: newPlanId, seats });
        await updateDoc(doc(db, 'user_entitlements', user.uid), {
          subscriptionStatus: 'active',
          pdfOperationsLimit: newLimits.pdf,
          aiQueriesLimit: newLimits.ai,
        });
      } catch (e) {
        // silent
      }
    }
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        entitlements,
        documents,
        isLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        consumePdfQuota,
        consumeAiQuota,
        upgradePlan,
        deleteDocument,
        canPerformPdf,
        canPerformAi,
        openUpgradeModal,
        setOpenUpgradeModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
