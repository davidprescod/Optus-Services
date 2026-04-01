
import React, { useState, useEffect } from 'react';
import { User, UserRole, Batch, ListingStatus, Bid } from '../types';
import { getBatches, updateBatchStatus, getBids, updateBatchCalculations, getUsers, addUser } from '../services/mockData';
import BatchCard from './BatchCard';
import { Button } from './ui/Button';
import { ShieldCheck, Calculator, Send, CheckCircle, Lightbulb, Users, UserPlus, Mail, Building2, Plus } from 'lucide-react';
import { getValuationAdvice } from '../services/geminiService';

const AdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [allBatches, setAllBatches] = useState<Batch[]>(getBatches());
  const [allUsers, setAllUsers] = useState<User[]>(getUsers());
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [view, setView] = useState<'pending' | 'bidding' | 'offers' | 'accounts'>('pending');
  
  const [calcData, setCalcData] = useState({ margin: 250, logistics: 150 });
  const [aiAdvice, setAiAdvice] = useState<any>(null);
  const [isGettingAdvice, setIsGettingAdvice] = useState(false);

  // New Seller Form State
  const [showAddSeller, setShowAddSeller] = useState(false);
  const [newSeller, setNewSeller] = useState({ name: '', email: '', company: '' });

  useEffect(() => {
    setAllBatches(getBatches());
    setAllUsers(getUsers());
  }, []);

  const pendingBatches = allBatches.filter(b => b.status === ListingStatus.PENDING_REVIEW);
  const biddingBatches = allBatches.filter(b => b.status === ListingStatus.OFFER_CALCULATION);
  const sentOffers = allBatches.filter(b => b.status === ListingStatus.OFFER_SENT);

  const handleApproveBatch = (id: string) => {
    updateBatchStatus(id, ListingStatus.APPROVED, 'Admin Batch Approval');
    setAllBatches(getBatches());
    alert("Batch approved. Broadcast notification sent to Buyer Mailing List.");
  };

  const openCalculator = async (batch: Batch) => {
    setSelectedBatch(batch);
    setIsGettingAdvice(true);
    const summary = batch.items.map(i => `${i.quantity}x ${i.make} ${i.model}`).join(', ');
    const advice = await getValuationAdvice('Batch Hardware', summary, 1);
    setAiAdvice(advice);
    setIsGettingAdvice(false);
  };

  const handleSendOffer = (batch: Batch) => {
    const bids = getBids(batch.id);
    const topBid = bids.length > 0 ? Math.max(...bids.map(b => b.amount)) : 0;
    const sellerOffer = topBid - (calcData.margin + calcData.logistics);

    updateBatchCalculations(batch.id, {
      buyerMaxBid: topBid,
      adminMargin: calcData.margin,
      logisticsReserve: calcData.logistics,
      sellerOfferAmount: sellerOffer,
      status: ListingStatus.OFFER_SENT
    }, 'Admin Calculation Completed');
    
    setAllBatches(getBatches());
    setSelectedBatch(null);
    alert(`Bulk offer of £${sellerOffer.toFixed(2)} dispatched to Seller.`);
  };

  const handleAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addUser({
      name: newSeller.name,
      email: newSeller.email,
      company: newSeller.company,
      role: UserRole.SELLER
    });
    setAllUsers([...allUsers, created]);
    setNewSeller({ name: '', email: '', company: '' });
    setShowAddSeller(false);
    alert("New seller account created and verified.");
  };

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Deal Pipeline</h1>
          <p className="text-slate-500">Managing global hardware batches & accounts.</p>
        </div>
        {view === 'accounts' && (
          <Button variant="primary" className="gap-2 bg-slate-900" onClick={() => setShowAddSeller(true)}>
            <UserPlus className="w-4 h-4" /> Add New Seller
          </Button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {['pending', 'bidding', 'offers', 'accounts'].map(t => (
          <button 
            key={t}
            onClick={() => setView(t as any)}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-widest transition-colors relative ${view === t ? 'text-slate-900' : 'text-slate-400'}`}
          >
            {t} 
            {view === t && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900"></div>}
          </button>
        ))}
      </div>

      {view === 'accounts' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700">Account Holder</th>
                <th className="px-6 py-4 font-bold text-slate-700">Company</th>
                <th className="px-6 py-4 font-bold text-slate-700">Role</th>
                <th className="px-6 py-4 font-bold text-slate-700">Contact</th>
                <th className="px-6 py-4 font-bold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-slate-900">{u.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{u.company}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                      u.role === UserRole.BUYER ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors font-semibold">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(view === 'pending' ? pendingBatches : view === 'bidding' ? biddingBatches : sentOffers).map(b => (
            <BatchCard 
              key={b.id} 
              batch={b} 
              actionLabel={view === 'pending' ? 'Review & List' : 'Set Margin'} 
              onAction={view === 'pending' ? () => handleApproveBatch(b.id) : () => openCalculator(b)}
            />
          ))}
        </div>
      )}

      {/* Add Seller Modal */}
      {showAddSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <h2 className="font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                <UserPlus className="w-4 h-4" /> Create Seller Account
              </h2>
              <button onClick={() => setShowAddSeller(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleAddSeller} className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Contact Name</label>
                <input type="text" required value={newSeller.name} onChange={e => setNewSeller({...newSeller, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="Full Name" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Business Email</label>
                <input type="email" required value={newSeller.email} onChange={e => setNewSeller({...newSeller, email: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="email@company.com" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Company Name</label>
                <input type="text" required value={newSeller.company} onChange={e => setNewSeller({...newSeller, company: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl" placeholder="e.g. Logistics Ltd" />
              </div>
              <div className="pt-4 flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowAddSeller(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1 bg-emerald-600 hover:bg-emerald-700" type="submit">Create Account</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-900 text-white">
              <h2 className="text-xl font-bold flex items-center gap-2 italic">
                <Calculator className="w-5 h-5 text-emerald-400" />
                Batch Spread Calculator: {selectedBatch.batchNumber}
              </h2>
              <button onClick={() => setSelectedBatch(null)} className="text-white hover:rotate-90 transition-transform">✕</button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Inventory Breakdown</h3>
                    <ul className="space-y-2">
                      {selectedBatch.items.map(item => (
                        <li key={item.id} className="flex justify-between text-xs">
                          <span className="font-bold text-slate-700">{item.make} {item.model}</span>
                          <span className="text-slate-500">Qty: {item.quantity}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 pt-4 border-t border-slate-200">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Max Buyer Bid</p>
                      <p className="text-3xl font-black text-blue-600">£{Math.max(...getBids(selectedBatch.id).map(b => b.amount), 0)}</p>
                    </div>
                  </div>

                  {aiAdvice && (
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <p className="text-[10px] text-emerald-700 font-bold mb-2 flex items-center gap-1 uppercase tracking-wider">
                        <Lightbulb className="w-3 h-3" /> Gemini Strategic Note
                      </p>
                      <p className="text-xs text-emerald-800 leading-relaxed italic">"{aiAdvice.marketInsight}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Broker Margin (£)</label>
                    <input type="number" value={calcData.margin} onChange={e => setCalcData({...calcData, margin: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Logistics Reserve (£)</label>
                    <input type="number" value={calcData.logistics} onChange={e => setCalcData({...calcData, logistics: parseFloat(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold" />
                  </div>

                  <div className="bg-slate-900 p-6 rounded-2xl text-white">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seller Offer</h4>
                    <p className="text-4xl font-black text-emerald-400">
                      £{(Math.max(...getBids(selectedBatch.id).map(b => b.amount), 0) - (calcData.margin + calcData.logistics)).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedBatch(null)}>Back</Button>
                <Button variant="primary" className="bg-slate-900 hover:bg-slate-800 gap-2 px-10" onClick={() => handleSendOffer(selectedBatch)}>
                  <Send className="w-4 h-4" /> Dispatch Bulk Offer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
