import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyAiu8z2gImpChnGetY0iFW3udNli-qFjn8',
  authDomain: 'pmapp-10fb3.firebaseapp.com',
  projectId: 'pmapp-10fb3',
  storageBucket: 'pmapp-10fb3.firebasestorage.app',
  messagingSenderId: '461952741066',
  appId: '1:461952741066:web:e54d75e66bea15b849ce33',
  measurementId: 'G-384XXHZTBS',
};

// Initialize Firebase App singleton
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore & Cloud Storage
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
