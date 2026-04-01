
import React from 'react';
import { Batch, ListingStatus } from '../types';
import { Package, Clock, Layers } from 'lucide-react';

interface BatchCardProps {
  batch: Batch;
  onAction?: (batch: Batch) => void;
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

const BatchCard: React.FC<BatchCardProps> = ({ batch, onAction, actionLabel }) => {
  const totalQty = batch.items.reduce((acc, item) => acc + item.quantity, 0);
  const firstImage = batch.items[0]?.images[0] || 'https://picsum.photos/400/300?random=1';

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow group">
      <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
        <img 
          src={firstImage} 
          alt={batch.batchNumber} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={batch.status} />
        </div>
        <div className="absolute bottom-2 left-2 px-2 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded">
          {batch.batchNumber}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              {batch.items.length} Product Types
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {batch.items.slice(0, 2).map(i => `${i.make} ${i.model}`).join(', ')}
              {batch.items.length > 2 && ' ...'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400">Total Qty</span>
            <p className="text-lg font-bold text-slate-900">{totalQty}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4 uppercase font-bold tracking-wider">
          <Clock className="w-3 h-3" />
          {new Date(batch.createdAt).toLocaleDateString()}
        </div>

        {onAction && (
          <button 
            onClick={() => onAction(batch)}
            className="w-full py-2 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            {actionLabel || 'View Batch'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BatchCard;
