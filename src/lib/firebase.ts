import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider 
} from "firebase/auth";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCaorVVYwtNiiO1jOKFi8Muf9NWcGU8xR4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "swaangclub.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "swaangclub",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "swaangclub.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "174466690956",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:174466690956:web:f26e3dc122af17cf6570a9",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WKJKEEKQF6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Messaging Setup & Token Generator
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const getDeviceToken = async () => {
  const msg = await messaging();
  if (!msg) return null;
  try {
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BH0rR1Ryhd2KcqYPbyLTirDmOqIbEkLRa6slU9XLSOZBzrjrEEj1PYpYFi6C-7CfXR6hScDeJUgIBr5dNNf2MZE";
    const currentToken = await getToken(msg, { vapidKey });
    return currentToken;
  } catch (err) {
    console.error("An error occurred while retrieving token: ", err);
    return null;
  }
};