
import React, { useState } from 'react';
import { User, Batch, ListingStatus, Bid } from '../types';
import { getBatches, addBid } from '../services/mockData';
import BatchCard from './BatchCard';
import { Button } from './ui/Button';
import { Search, DollarSign, Layers } from 'lucide-react';

const BuyerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [batches, setBatches] = useState(getBatches().filter(b => b.status === ListingStatus.APPROVED));
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    
    setIsSubmitting(true);
    const newBid: Bid = {
      id: Math.random().toString(36).substr(2, 9),
      batchId: selectedBatch.id,
      buyerId: user.id,
      amount: parseFloat(bidAmount),
      timestamp: new Date().toISOString()
    };

    addBid(newBid);
    setTimeout(() => {
      setIsSubmitting(false);
      setSelectedBatch(null);
      setBidAmount('');
      setBatches(getBatches().filter(b => b.status === ListingStatus.APPROVED));
    }, 800);
  };

  return (
    <div className="space-y-8 p-4 md:p-8 animate-in fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase">Stock Alerts</h1>
          <p className="text-slate-500">Global pallet-level inventory bidding portal.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search batches..." className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {batches.map(b => (
          <BatchCard 
            key={b.id} 
            batch={b} 
            actionLabel="Place Bulk Bid"
            onAction={() => setSelectedBatch(b)}
          />
        ))}
        {batches.length === 0 && (
          <div className="col-span-full py-20 text-center bg-blue-50 border border-blue-100 rounded-3xl">
            <Layers className="mx-auto w-10 h-10 text-blue-200 mb-4" />
            <h3 className="text-xl font-bold text-blue-900">No active stock alerts</h3>
            <p className="text-blue-600">Inventory batches appear here after verification.</p>
          </div>
        )}
      </div>

      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-600 text-white font-bold italic">
              <h2>Pallet Bid Submission: {selectedBatch.batchNumber}</h2>
              <button onClick={() => setSelectedBatch(null)} className="text-white hover:opacity-75">
                CLOSE
              </button>
            </div>
            
            <form onSubmit={handlePlaceBid} className="p-8 space-y-8">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Batch Contents</h3>
                <div className="space-y-3">
                  {selectedBatch.items.map(i => (
                    <div key={i.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white border border-slate-200 overflow-hidden">
                           <img src={i.images[0]} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-slate-800">{i.make} {i.model}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">x{i.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Maximum Pallet Bid (GBP)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} placeholder="0.00" className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-2xl font-black text-slate-900" required />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">Bids are legally binding and valid for 72 hours.</p>
              </div>

              <div className="flex gap-4">
                <Button variant="ghost" className="flex-1 py-4" type="button" onClick={() => setSelectedBatch(null)}>Cancel</Button>
                <Button variant="primary" className="flex-2 py-4 px-10 bg-blue-600 hover:bg-blue-700 font-black rounded-xl" type="submit" isLoading={isSubmitting}>
                  LOCK IN BID
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
