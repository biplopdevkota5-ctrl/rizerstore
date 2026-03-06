
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * Firebase configuration using the provided project details.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD6wv_EuiASof1HfLNeky8Qy3VpTAepprM",
  authDomain: "rizerstore-e022b.firebaseapp.com",
  projectId: "rizerstore-e022b",
  storageBucket: "rizerstore-e022b.firebasestorage.app",
  messagingSenderId: "561049848687",
  appId: "1:561049848687:web:9909bfc214a232bc83b69a"
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// Defensive check: Only initialize if the API key is provided
const isConfigValid = typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.length > 10;

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
