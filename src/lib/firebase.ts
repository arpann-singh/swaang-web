import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

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
