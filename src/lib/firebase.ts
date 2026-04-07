import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  getAuth, 
  GoogleAuthProvider // 🔥 NEW: Added for Google Login
} from "firebase/auth";
// 🔥 NEW: Import Firebase Cloud Messaging
import { getMessaging, getToken, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCaorVVYwtNiiO1jOKFi8Muf9NWcGU8xR4",
  authDomain: "swaangclub.firebaseapp.com",
  projectId: "swaangclub",
  storageBucket: "swaangclub.firebasestorage.app",
  messagingSenderId: "174466690956",
  appId: "1:174466690956:web:f26e3dc122af17cf6570a9",
  measurementId: "G-WKJKEEKQF6"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// 🔥 NEW: Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 🔥 NEW: Messaging Setup & Token Generator
export const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

export const getDeviceToken = async () => {
  const msg = await messaging();
  if (!msg) return null;
  try {
    const currentToken = await getToken(msg, {
      vapidKey: "BH0rR1Ryhd2KcqYPbyLTirDmOqIbEkLRa6slU9XLSOZBzrjrEEj1PYpYFi6C-7CfXR6hScDeJUgIBr5dNNf2MZE"
    });
    return currentToken;
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};