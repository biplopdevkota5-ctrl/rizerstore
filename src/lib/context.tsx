
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, FundRequest, Purchase, Announcement, PromoCode } from './types';
import { db } from './firebase';
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

  // Helper to check if Firebase is configured
  const isFirebaseConfigured = () => {
    const config = (db as any)._app?.options;
    return config && config.apiKey && !config.apiKey.includes("YOUR_API_KEY");
  };

  useEffect(() => {
    // Session Recovery from LocalStorage
    const storedSession = localStorage.getItem('rizer_session');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        
        if (sessionData.role === 'admin' && sessionData.id === 'admin-id') {
          setInternalCurrentUser(sessionData);
          setIsLoading(false);
          return;
        }

        if (isFirebaseConfigured()) {
          const userRef = doc(db, 'users', sessionData.id);
          const unsubUser = onSnapshot(userRef, (docSnap) => {
            if (docSnap.exists()) {
              setInternalCurrentUser(docSnap.data() as User);
            } else {
              // User deleted from DB, logout
              localStorage.removeItem('rizer_session');
              setInternalCurrentUser(null);
            }
            setIsLoading(false);
          }, (error) => {
            console.error("User Sync Error:", error);
            setIsLoading(false);
          });
          return () => unsubUser();
        } else {
          setInternalCurrentUser(sessionData);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Session recovery error:", e);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    // Real-time Listeners for Collections
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
    if (user) {
      localStorage.setItem('rizer_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('rizer_session');
    }
    setInternalCurrentUser(user);
  };

  const logout = () => {
    localStorage.removeItem('rizer_session');
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
