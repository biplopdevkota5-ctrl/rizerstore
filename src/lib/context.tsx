
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, FundRequest, Purchase, Announcement, PromoCode } from './types';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc, getDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User | null;
  products: Product[];
  fundRequests: FundRequest[];
  purchases: Purchase[];
  announcements: Announcement[];
  promoCodes: PromoCode[];
  setCurrentUser: (user: User | null) => void;
  syncData: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setInternalCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isFirebaseConfigured = () => {
    const config = (db as any)._app?.options;
    return config && config.apiKey && !config.apiKey.includes("YOUR_API_KEY");
  };

  // 1. Listen for Auth State Changes
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in, fetch their Firestore profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Use real-time listener for the user profile (to sync balance)
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setInternalCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: userData.username,
              balance: userData.balance || 0,
              role: userData.role || 'user'
            });
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          setIsLoading(false);
        });

        return () => unsubProfile();
      } else {
        // User is logged out
        setInternalCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Listen for Global Collections
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => doc.data() as Product));
    }, (err) => console.error("Products error:", err));

    const unsubFunds = onSnapshot(query(collection(db, 'fundRequests'), orderBy('createdAt', 'desc')), (snap) => {
      setFundRequests(snap.docs.map(doc => doc.data() as FundRequest));
    }, (err) => console.error("Funds error:", err));

    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), orderBy('createdAt', 'desc')), (snap) => {
      setPurchases(snap.docs.map(doc => doc.data() as Purchase));
    }, (err) => console.error("Purchases error:", err));

    const unsubAnn = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      setAnnouncements(snap.docs.map(doc => doc.data() as Announcement));
    }, (err) => console.error("Announcements error:", err));

    const unsubPromos = onSnapshot(query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc')), (snap) => {
      setPromoCodes(snap.docs.map(doc => doc.data() as PromoCode));
    }, (err) => console.error("Promos error:", err));

    return () => {
      unsubProducts();
      unsubFunds();
      unsubPurchases();
      unsubAnn();
      unsubPromos();
    };
  }, []);

  const syncData = () => {
    // Handled by onSnapshot
  };

  const setCurrentUser = (user: User | null) => {
    setInternalCurrentUser(user);
  };

  const logout = async () => {
    await signOut(auth);
    setInternalCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <AppContext.Provider value={{ 
      currentUser, 
      products, 
      fundRequests, 
      purchases, 
      announcements,
      promoCodes,
      setCurrentUser, 
      syncData,
      logout,
      isLoading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
