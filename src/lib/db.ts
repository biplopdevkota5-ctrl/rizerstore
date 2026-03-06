
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { User, Product, FundRequest, Purchase, Announcement, PromoCode } from "./types";

const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  FUND_REQUESTS: 'fundRequests',
  PURCHASES: 'purchases',
  ANNOUNCEMENTS: 'announcements',
  PROMO_CODES: 'promoCodes'
};

export const dbService = {
  // Users
  async saveUser(user: User) {
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
  },
  async updateUserBalance(userId: string, newBalance: number) {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(userRef, { balance: newBalance });
  },
  
  // Products
  async addProduct(product: Product) {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
  },
  async deleteProduct(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  },

  // Fund Requests
  async addFundRequest(request: FundRequest) {
    await setDoc(doc(db, COLLECTIONS.FUND_REQUESTS, request.id), request);
  },
  async deleteFundRequest(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.FUND_REQUESTS, id));
  },
  async updateFundRequestStatus(id: string, status: 'approved' | 'rejected') {
    const ref = doc(db, COLLECTIONS.FUND_REQUESTS, id);
    await updateDoc(ref, { status });
  },

  // Promo Codes
  async addPromoCode(promo: PromoCode) {
    await setDoc(doc(db, COLLECTIONS.PROMO_CODES, promo.id), promo);
  },
  async deletePromoCode(id: string) {
    await deleteDoc(doc(db, COLLECTIONS.PROMO_CODES, id));
  },
  async incrementPromoUsage(id: string) {
    const ref = doc(db, COLLECTIONS.PROMO_CODES, id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as PromoCode;
      await updateDoc(ref, { usedCount: (data.usedCount || 0) + 1 });
    }
  },

  // Purchases
  async addPurchase(purchase: Purchase) {
    await setDoc(doc(db, COLLECTIONS.PURCHASES, purchase.id), purchase);
  },

  // Announcements
  async addAnnouncement(ann: Announcement) {
    await setDoc(doc(db, COLLECTIONS.ANNOUNCEMENTS, ann.id), ann);
  }
};
