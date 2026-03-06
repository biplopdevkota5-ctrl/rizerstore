
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
  
  const isFirebaseConfigured = !!auth && !!db;
  const [isLoading, setIsLoading] = useState(true);

  // Auth & Profile Synchronization
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setIsLoading(false);
      return;
    }

    let unsubProfile: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      // Clear previous profile listener if it exists
      if (unsubProfile) unsubProfile();

      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for profile changes in real-time (balance, role, etc.)
        unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            setInternalCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: userData.username || 'Gamer',
              balance: userData.balance || 0,
              role: userData.role || 'user'
            });
          } else {
            // Fallback for new signups before doc is created
            setInternalCurrentUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              username: firebaseUser.displayName || 'Gamer',
              balance: 0,
              role: 'user'
            });
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Profile sync error:", err);
          setIsLoading(false);
        });
      } else {
        setInternalCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubProfile) unsubProfile();
    };
  }, [isFirebaseConfigured]);

  // Global Data Synchronization
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    }, (err) => console.error("Products sync error:", err));

    const unsubFunds = onSnapshot(query(collection(db, 'fundRequests'), orderBy('createdAt', 'desc')), (snap) => {
      setFundRequests(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as FundRequest)));
    }, (err) => console.error("Funds sync error:", err));

    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), orderBy('createdAt', 'desc')), (snap) => {
      setPurchases(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
    }, (err) => console.error("Purchases sync error:", err));

    const unsubAnn = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement)));
    }, (err) => console.error("Announcements sync error:", err));

    const unsubPromos = onSnapshot(query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc')), (snap) => {
      setPromoCodes(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PromoCode)));
    }, (err) => console.error("Promos sync error:", err));

    return () => {
      unsubProducts();
      unsubFunds();
      unsubPurchases();
      unsubAnn();
      unsubPromos();
    };
  }, [isFirebaseConfigured]);

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setInternalCurrentUser(null);
      window.location.href = '/auth?tab=login';
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
      setCurrentUser: setInternalCurrentUser, 
      syncData: () => {},
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
