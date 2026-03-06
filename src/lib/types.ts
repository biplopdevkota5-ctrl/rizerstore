export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  role: UserRole;
  password?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  tag?: 'NEW' | 'HOT' | 'LIMITED' | string;
  createdAt: number;
}

export interface PromoCode {
  id: string;
  code: string;
  discountAmount: number;
  usageLimit: number | null; // null = unlimited
  usedCount: number;
  expiryDate: number | null; // timestamp, null = forever
  createdAt: number;
}

export interface FundRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  method: 'eSewa' | 'Khalti' | 'FonePay';
  proofImage: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Purchase {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  price: number;
  discountApplied?: number;
  contactMethod: string;
  contactId: string;
  status: 'completed';
  createdAt: number;
}

export interface Announcement {
  id: string;
  content: string;
  createdAt: number;
}
