
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * Firebase configuration optimized for Netlify.
 * Uses environment variables with hardcoded fallbacks for project rizerstore-e022b.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD6wv_EuiASof1HfLNeky8Qy3VpTAepprM",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "rizerstore-e022b.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "rizerstore-e022b",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "rizerstore-e022b.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "561049848687",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:561049848687:web:9909bfc214a232bc83b69a"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, db, auth, firebaseConfig };
