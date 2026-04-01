
export enum UserRole {
  SELLER = 'SELLER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN'
}

export enum ListingStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  OFFER_CALCULATION = 'OFFER_CALCULATION',
  OFFER_SENT = 'OFFER_SENT',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  PO_UPLOADED = 'PO_UPLOADED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company: string;
}

export interface BatchItem {
  id: string;
  make: string;
  model: string;
  quantity: number;
  condition: string;
  images: string[];
}

export interface Batch {
  id: string;
  batchNumber: string;
  sellerId: string;
  items: BatchItem[];
  status: ListingStatus;
  createdAt: string;
  buyerMaxBid?: number;
  adminMargin?: number;
  logisticsReserve?: number;
  sellerOfferAmount?: number;
  buyerPoUrl?: string;
  adminPoUrl?: string;
}

export interface Bid {
  id: string;
  batchId: string;
  buyerId: string;
  amount: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  batchId: string;
  action: string;
  timestamp: string;
  performedBy: string;
}
