
import { Batch, ListingStatus, Bid, AuditLog, User, UserRole } from '../types';

// Initial state for demo
export const INITIAL_USERS: User[] = [
  { id: 's1', name: 'John Seller', email: 'john@logistics-co.uk', role: UserRole.SELLER, company: 'Logistics Co UK' },
  { id: 'b1', name: 'Alice Buyer', email: 'alice@refurb-pro.com', role: UserRole.BUYER, company: 'Refurb Pro' },
  { id: 'a1', name: 'Admin User', email: 'admin@hardwarelink.io', role: UserRole.ADMIN, company: 'HardwareLink' }
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'b1',
    batchNumber: 'HL-4821',
    sellerId: 's1',
    items: [
      {
        id: 'i1',
        make: 'Zebra',
        model: 'TC51-G',
        quantity: 45,
        condition: 'Fully Working',
        images: ['https://picsum.photos/400/300?random=1']
      },
      {
        id: 'i2',
        make: 'Honeywell',
        model: 'EDA51',
        quantity: 15,
        condition: 'Fully Working',
        images: ['https://picsum.photos/400/300?random=3']
      }
    ],
    status: ListingStatus.PENDING_REVIEW,
    createdAt: new Date().toISOString()
  },
  {
    id: 'b2',
    batchNumber: 'HL-9102',
    sellerId: 's1',
    items: [
      {
        id: 'i3',
        make: 'Honeywell',
        model: 'Dolphin 99EX',
        quantity: 12,
        condition: 'Fully Working',
        images: ['https://picsum.photos/400/300?random=2']
      }
    ],
    status: ListingStatus.APPROVED,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const INITIAL_BIDS: Bid[] = [
  {
    id: 'bid1',
    batchId: 'b2',
    buyerId: 'b1',
    amount: 1500,
    timestamp: new Date().toISOString()
  }
];

// In-memory store
let usersStore = [...INITIAL_USERS];
let batchesStore = [...INITIAL_BATCHES];
let bidsStore = [...INITIAL_BIDS];
let auditStore: AuditLog[] = [];

// User Management
export const getUsers = () => usersStore;

export const addUser = (user: Omit<User, 'id'>) => {
  const newUser = { ...user, id: Math.random().toString(36).substr(2, 9) };
  usersStore = [...usersStore, newUser];
  return newUser;
};

export const findUserByEmail = (email: string) => {
  return usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
};

// Batch Management
export const getBatches = () => batchesStore;

export const addBatch = (batch: Batch) => {
  batchesStore = [batch, ...batchesStore];
  logAudit(batch.id, 'Batch Created', 'Seller');
};

export const updateBatchStatus = (id: string, status: ListingStatus, actor: string) => {
  batchesStore = batchesStore.map(b => b.id === id ? { ...b, status } : b);
  logAudit(id, `Status changed to ${status}`, actor);
};

export const updateBatchCalculations = (id: string, data: Partial<Batch>, actor: string) => {
  batchesStore = batchesStore.map(b => b.id === id ? { ...b, ...data } : b);
  logAudit(id, `Financials calculated`, actor);
};

export const getBids = (batchId?: string) => {
  return batchId ? bidsStore.filter(b => b.batchId === batchId) : bidsStore;
};

export const addBid = (bid: Bid) => {
  bidsStore = [...bidsStore, bid];
  const batch = batchesStore.find(b => b.id === bid.batchId);
  if (batch && batch.status === ListingStatus.APPROVED) {
    updateBatchStatus(batch.id, ListingStatus.OFFER_CALCULATION, 'Buyer Bid Received');
  }
};

const logAudit = (batchId: string, action: string, performedBy: string) => {
  const log: AuditLog = {
    id: Math.random().toString(36).substr(2, 9),
    batchId,
    action,
    timestamp: new Date().toISOString(),
    performedBy
  };
  auditStore = [log, ...auditStore];
};

export const getAuditTrail = (batchId: string) => auditStore.filter(a => a.batchId === batchId);
