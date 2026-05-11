import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp, setDoc, Firestore } from 'firebase/firestore';

// We use import.meta.glob to optionally load the config file without breaking the build
// @ts-ignore
const configs = import.meta.glob('../firebase-applet-config.json', { eager: true });
const configPath = '../firebase-applet-config.json';
const firebaseConfig = (configs[configPath] as any)?.default || null;

const dummyConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

function getFirebaseApp() {
  if (getApps().length > 0) return getApp();
  if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "placeholder") {
    return initializeApp(firebaseConfig);
  }
  // If no config found, we return null so components can handle the "Setup Required" state
  return null;
}

const app = getFirebaseApp();
export const auth: Auth | null = app ? getAuth(app) : null;
export const db: Firestore | null = app ? getFirestore(app, firebaseConfig?.firestoreDatabaseId) : null;
export const googleProvider = new GoogleAuthProvider();

// Error handling helper as per instructions
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Service
export async function signUpWithEmail(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth not initialized.");
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (db) {
       await setDoc(doc(db, 'users', result.user.uid), {
         uid: result.user.uid,
         email: result.user.email,
         displayName: email.split('@')[0],
         createdAt: serverTimestamp()
       }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Sign Up Error:", error);
    throw error;
  }
}

export async function signInWithEmail(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth not initialized.");
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Sign In Error:", error);
    throw error;
  }
}

export async function signIn() {
  if (!auth) throw new Error("Firebase Auth not initialized. Please complete setup.");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Create user profile in Firestore
    if (db) {
       await setDoc(doc(db, 'users', result.user.uid), {
         uid: result.user.uid,
         email: result.user.email,
         displayName: result.user.displayName,
         photoURL: result.user.photoURL,
         createdAt: serverTimestamp()
       }, { merge: true });
    }
    return result.user;
  } catch (error) {
    console.error("Auth Error:", error);
    throw error;
  }
}

export async function logOut() {
  if (!auth) return;
  await signOut(auth);
}
