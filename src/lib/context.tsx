
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, FundRequest, Purchase, Announcement, PromoCode } from './types';
import { db, auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';

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
  isFirebaseConfigured: boolean;
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

  const isFirebaseConfigured = !!auth && !!db;

  // 1. Safety Timeout for Loading State
  // This ensures the app doesn't get stuck on the loader if Firebase takes too long or fails
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn("Firebase auth check timed out. Forcing UI release.");
        setIsLoading(false);
      }
    }, 5000); // 5 second safety net
    
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // 2. Listen for Auth State Changes
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth!, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db!, 'users', firebaseUser.uid);
        
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
          } else {
            // Document doesn't exist yet, but we have the auth user
            setInternalCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: firebaseUser.displayName || 'User',
              balance: 0,
              role: 'user'
            });
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          setIsLoading(false);
        });

        return () => unsubProfile();
      } else {
        setInternalCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  // 3. Listen for Global Collections
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubProducts = onSnapshot(query(collection(db!, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    }, (err) => console.error("Products error:", err));

    const unsubFunds = onSnapshot(query(collection(db!, 'fundRequests'), orderBy('createdAt', 'desc')), (snap) => {
      setFundRequests(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as FundRequest)));
    }, (err) => console.error("Funds error:", err));

    const unsubPurchases = onSnapshot(query(collection(db!, 'purchases'), orderBy('createdAt', 'desc')), (snap) => {
      setPurchases(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
    }, (err) => console.error("Purchases error:", err));

    const unsubAnn = onSnapshot(query(collection(db!, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement)));
    }, (err) => console.error("Announcements error:", err));

    const unsubPromos = onSnapshot(query(collection(db!, 'promoCodes'), orderBy('createdAt', 'desc')), (snap) => {
      setPromoCodes(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PromoCode)));
    }, (err) => console.error("Promos error:", err));

    return () => {
      unsubProducts();
      unsubFunds();
      unsubPurchases();
      unsubAnn();
      unsubPromos();
    };
  }, [isFirebaseConfigured]);

  const syncData = () => {};

  const setCurrentUser = (user: User | null) => {
    setInternalCurrentUser(user);
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setInternalCurrentUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
      isLoading,
      isFirebaseConfigured
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
