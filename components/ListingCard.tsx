
import React from 'react';
// Changed Listing to Batch as it is the current standard in types.ts
import { Batch, ListingStatus } from '../types';
import { Package, Clock, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';

interface ListingCardProps {
  listing: Batch;
  onAction?: (listing: Batch) => void;
  actionLabel?: string;
}

const StatusBadge: React.FC<{ status: ListingStatus }> = ({ status }) => {
  const styles = {
    [ListingStatus.PENDING_REVIEW]: "bg-amber-100 text-amber-700 border-amber-200",
    [ListingStatus.APPROVED]: "bg-emerald-100 text-emerald-700 border-emerald-200",
    [ListingStatus.OFFER_CALCULATION]: "bg-blue-100 text-blue-700 border-blue-200",
    [ListingStatus.OFFER_SENT]: "bg-indigo-100 text-indigo-700 border-indigo-200",
    [ListingStatus.OFFER_ACCEPTED]: "bg-purple-100 text-purple-700 border-purple-200",
    [ListingStatus.PO_UPLOADED]: "bg-cyan-100 text-cyan-700 border-cyan-200",
    [ListingStatus.COMPLETED]: "bg-slate-100 text-slate-700 border-slate-200",
    [ListingStatus.REJECTED]: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

const ListingCard: React.FC<ListingCardProps> = ({ listing, onAction, actionLabel }) => {
  // Extracting first item and total quantity to maintain similar UI for Batch data
  const firstItem = listing.items[0];
  const totalQty = listing.items.reduce((acc, item) => acc + item.quantity, 0);
  const displayImage = firstItem?.images[0] || 'https://picsum.photos/400/300?random=1';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
        <img 
          src={displayImage} 
          alt={firstItem?.model || 'Hardware Batch'} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={listing.status} />
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold text-slate-900">{firstItem?.make || 'Various Hardware'}</h3>
            <p className="text-sm text-slate-500">{firstItem?.model || 'Bulk Listing'}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Qty</span>
            <p className="text-lg font-bold text-slate-900">{totalQty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
          <Clock className="w-3 h-3" />
          <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
        </div>

        {onAction && (
          <button 
            onClick={() => onAction(listing)}
            className="w-full py-2 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            {actionLabel || 'View Details'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
