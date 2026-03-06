import { User, Product, FundRequest, Purchase, Announcement } from './types';

const STORAGE_KEYS = {
  USERS: 'rizer_users',
  PRODUCTS: 'rizer_products',
  FUND_REQUESTS: 'rizer_funds',
  PURCHASES: 'rizer_purchases',
  ANNOUNCEMENTS: 'rizer_announcements',
  CURRENT_USER: 'rizer_session'
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Valorant Stacked Account (Immortal)',
    price: 4500,
    description: 'Immortal 3 Peak account with multiple premium skins including Reaver Vandal and Prime Phantom.',
    imageUrl: 'https://picsum.photos/seed/v1/600/400',
    tag: 'HOT',
    createdAt: Date.now()
  },
  {
    id: '2',
    name: '$50 Razer Gold Gift Card',
    price: 6800,
    description: 'Digital code for Razer Gold wallet. Instant delivery after purchase.',
    imageUrl: 'https://picsum.photos/seed/v2/600/400',
    tag: 'NEW',
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'PUBG Mobile UC (8100)',
    price: 12000,
    description: 'Direct top-up of 8100 UC to your PUBG Mobile ID.',
    imageUrl: 'https://picsum.photos/seed/v3/600/400',
    tag: 'LIMITED',
    createdAt: Date.now()
  }
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', content: 'Welcome to Rizer Store! Use code NEW10 for discount!', createdAt: Date.now() },
  { id: '2', content: 'New Valorant accounts added today. Check them out!', createdAt: Date.now() - 86400000 }
];

export const db = {
  getUsers: (): User[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },
  saveUsers: (users: User[]) => localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)),

  getProducts: (): Product[] => {
    if (typeof window === 'undefined') return INITIAL_PRODUCTS;
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : INITIAL_PRODUCTS;
  },
  saveProducts: (products: Product[]) => localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products)),

  getFundRequests: (): FundRequest[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.FUND_REQUESTS);
    return data ? JSON.parse(data) : [];
  },
  saveFundRequests: (requests: FundRequest[]) => localStorage.setItem(STORAGE_KEYS.FUND_REQUESTS, JSON.stringify(requests)),

  getPurchases: (): Purchase[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return data ? JSON.parse(data) : [];
  },
  savePurchases: (purchases: Purchase[]) => localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)),

  getAnnouncements: (): Announcement[] => {
    if (typeof window === 'undefined') return INITIAL_ANNOUNCEMENTS;
    const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    return data ? JSON.parse(data) : INITIAL_ANNOUNCEMENTS;
  },
  saveAnnouncements: (ann: Announcement[]) => localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(ann)),

  getCurrentSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },
  saveSession: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};