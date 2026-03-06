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

  // Safety Timeout to prevent "Infinite Loading" if Firebase is slow
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Safety timeout triggered: Resolving loading state.");
        setIsLoading(false);
      }
    }, 4000); // 4 seconds max wait
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Real-Time Auth & Profile Sync
  useEffect(() => {
    if (!auth || !db) {
      setIsLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Create an instant minimal user to allow Navbar to show the profile area
        setInternalCurrentUser(prev => prev || { 
          id: firebaseUser.uid, 
          email: firebaseUser.email || '', 
          username: firebaseUser.displayName || 'Gamer', 
          balance: 0, 
          role: 'user' 
        });
        
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setInternalCurrentUser({ ...docSnap.data(), id: firebaseUser.uid } as User);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Profile snapshot error:", error);
          setIsLoading(false);
        });

        return () => unsubProfile();
      } else {
        setInternalCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-Time Global Data Sync
  useEffect(() => {
    if (!db) return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product)));
    });

    const unsubFunds = onSnapshot(query(collection(db, 'fundRequests'), orderBy('createdAt', 'desc')), (snap) => {
      setFundRequests(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as FundRequest)));
    });

    const unsubPurchases = onSnapshot(query(collection(db, 'purchases'), orderBy('createdAt', 'desc')), (snap) => {
      setPurchases(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Purchase)));
    });

    const unsubAnn = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (snap) => {
      setAnnouncements(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Announcement)));
    });

    const unsubPromos = onSnapshot(query(collection(db, 'promoCodes'), orderBy('createdAt', 'desc')), (snap) => {
      setPromoCodes(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as PromoCode)));
    });

    return () => {
      unsubProducts(); unsubFunds(); unsubPurchases(); unsubAnn(); unsubPromos();
    };
  }, []);

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setInternalCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{ currentUser, products, fundRequests, purchases, announcements, promoCodes, setCurrentUser: setInternalCurrentUser, logout, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
}
