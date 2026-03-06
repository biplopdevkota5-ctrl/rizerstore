"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Product, FundRequest, Purchase, Announcement } from './types';
import { db } from './db';

interface AppContextType {
  currentUser: User | null;
  products: Product[];
  fundRequests: FundRequest[];
  purchases: Purchase[];
  announcements: Announcement[];
  setCurrentUser: (user: User | null) => void;
  syncData: () => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setInternalCurrentUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [fundRequests, setFundRequests] = useState<FundRequest[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const syncData = () => {
    const session = db.getCurrentSession();
    if (session) {
      const allUsers = db.getUsers();
      const updatedUser = allUsers.find(u => u.id === session.id);
      if (updatedUser) {
        setInternalCurrentUser(updatedUser);
        db.saveSession(updatedUser);
      } else if (session.role === 'admin') {
        setInternalCurrentUser(session);
      }
    } else {
      setInternalCurrentUser(null);
    }
    
    setProducts(db.getProducts());
    setFundRequests(db.getFundRequests());
    setPurchases(db.getPurchases());
    setAnnouncements(db.getAnnouncements());
  };

  useEffect(() => {
    syncData();
  }, []);

  const setCurrentUser = (user: User | null) => {
    db.saveSession(user);
    setInternalCurrentUser(user);
  };

  const logout = () => {
    db.saveSession(null);
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
      setCurrentUser, 
      syncData,
      logout 
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