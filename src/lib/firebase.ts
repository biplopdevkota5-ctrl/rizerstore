
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * Firebase configuration for rizerstore-e022b.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD6wv_EuiASof1HfLNeky8Qy3VpTAepprM",
  authDomain: "rizerstore-e022b.firebaseapp.com",
  projectId: "rizerstore-e022b",
  storageBucket: "rizerstore-e022b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "561049848687",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:561049848687:web:9909bfc214a232bc83b69a"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Defensive check: Only initialize if the API key is provided and looks valid
const isConfigValid = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 20;

if (typeof window !== "undefined") {
  try {
    if (isConfigValid) {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, db, auth, firebaseConfig };
