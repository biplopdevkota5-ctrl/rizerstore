
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * Verified Firebase configuration for rizerstore-e022b.
 */
const firebaseConfig = {
  apiKey: "AIzaSyD6wv_EuiASof1HfLNeky8Qy3VpTAepprM",
  authDomain: "rizerstore-e022b.firebaseapp.com",
  projectId: "rizerstore-e022b",
  storageBucket: "rizerstore-e022b.firebasestorage.app",
  messagingSenderId: "561049848687",
  appId: "1:561049848687:web:9909bfc214a232bc83b69a"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

// Idempotent initialization
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase startup failed:", error);
}

export { app, db, auth, firebaseConfig };
