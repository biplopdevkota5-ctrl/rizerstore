
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * Firebase configuration using environment variables for security.
 * Ensure these are set in your deployment environment (e.g., Netlify).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: "rizerstore-e022b.firebaseapp.com",
  projectId: "rizerstore-e022b",
  storageBucket: "rizerstore-e022b.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ""
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Only initialize if we have a valid API Key to prevent crashing
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "") {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

export { app, db, auth, firebaseConfig };
