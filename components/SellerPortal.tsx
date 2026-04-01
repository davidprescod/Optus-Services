import React, { useState } from 'react';
import { User, Batch, BatchItem, ListingStatus, UserRole } from '../types';
import { getBatches, addBatch, addUser, findUserByEmail } from '../services/mockData';
import BatchCard from './BatchCard';
import { Button } from './ui/Button';
import { 
  Plus, 
  Package, 
  ArrowRight, 
  Camera, 
  UploadCloud, 
  CheckCircle, 
  ArrowLeft,
  Building2,
  Mail,
  Lock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Trash2,
  Layers,
  LogIn,
  UserCheck,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { analyzeHardwareImage } from '../services/geminiService';

enum SellerState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  CREATE_BATCH = 'CREATE_BATCH'
}

const SellerPortal: React.FC<{ user: User }> = ({ user }) => {
  const [portalState, setPortalState] = useState<SellerState>(SellerState.AUTH);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('login');
  const [currentUser, setCurrentUser] = useState<User>(user);
  const [batches, setBatches] = useState(getBatches().filter(b => b.sellerId === user.id));
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null); // item id
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // Auth Form State
  const [authData, setAuthData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
  });

  // Batch Creation State
  const [batchItems, setBatchItems] = useState<BatchItem[]>([
    { id: 'initial', make: '', model: '', quantity: 1, condition: 'Fully Working', images: [] }
  ]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'register') {
      const newUser = addUser({
        name: authData.name || 'New Seller',
        email: authData.email,
        company: authData.companyName || 'Acme Logistics',
        role: UserRole.SELLER
      });
      setCurrentUser(newUser);
      setBatches([]);
      setPortalState(SellerState.DASHBOARD);
    } else {
      const existing = findUserByEmail(authData.email);
      if (existing && existing.role === UserRole.SELLER) {
        setCurrentUser(existing);
        setBatches(getBatches().filter(b => b.sellerId === existing.id));
        setPortalState(SellerState.DASHBOARD);
      } else if (existing) {
        alert("This account is not registered as a Seller.");
      } else {
        alert("Account not found. Please register first or use: john@logistics-co.uk");
      }
    }
  };

  const addItemToBatch = () => {
    const newItem: BatchItem = {
      id: Math.random().toString(36).substr(2, 9),
      make: '',
      model: '',
      quantity: 1,
      condition: 'Fully Working',
      images: []
    };
    setBatchItems([...batchItems, newItem]);
  };

  const removeItemFromBatch = (id: string) => {
    if (batchItems.length === 1) return;
    setBatchItems(batchItems.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BatchItem>) => {
    setBatchItems(batchItems.map(item => item.id === id ? { ...item, ...updates } : item));
    // Reset error when user starts correcting the form
    setSubmissionError(null);
  };

  const handleFileUpload = async (itemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      
      updateItem(itemId, { images: [dataUrl] });
      
      setIsAnalyzing(itemId);
      const analysis = await analyzeHardwareImage(base64);
      if (analysis && analysis.isIndustrialHardware) {
        updateItem(itemId, { 
          make: analysis.make || '', 
          model: analysis.model || '' 
        });
      }
      setIsAnalyzing(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitBatch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);

    // Requirement: Check if any hardware is not functional
    const hasNonFunctional = batchItems.some(item => item.condition !== 'Fully Working');
    
    if (hasNonFunctional) {
      setSubmissionError("We can't accept the batch with all hardware listed as we do not accept hardware that is not fully functional");
      return;
    }

    const newBatch: Batch = {
      id: Math.random().toString(36).substr(2, 9),
      batchNumber: `HL-${Math.floor(1000 + Math.random() * 9000)}`,
      sellerId: currentUser.id,
      items: batchItems,
      status: ListingStatus.PENDING_REVIEW,
      createdAt: new Date().toISOString()
    };
    addBatch(newBatch);
    setBatches([newBatch, ...batches]);
    setPortalState(SellerState.DASHBOARD);
    setBatchItems([{ id: 'initial', make: '', model: '', quantity: 1, condition: 'Fully Working', images: [] }]);
  };

  const startNewBatch = () => {
    setSubmissionError(null);
    setPortalState(SellerState.CREATE_BATCH);
  };

  // --- RENDERING ---

  if (portalState === SellerState.AUTH) {
    return (
      <div className="min-h-full flex items-center justify-center p-4 bg-white animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full border border-slate-200 rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="p-8 md:p-12 lg:p-16 space-y-8 bg-slate-50 border-r border-slate-100 hidden lg:block">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
                Seller Program
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Batch list your surplus Bar Coding hardware.
              </h1>
              <p className="text-lg text-slate-600">
                Turn entire warehouse pallets of scanners and mobile computers into working capital in a single batch listing.
              </p>
            </div>
            <div className="space-y-4 pt-8">
              {[
                { title: 'Bulk Liquidation', desc: 'List 1 or 100 different models in one Batch.', icon: Layers },
                { title: 'AI Identification', desc: 'Snap a photo and we identify the make and model.', icon: Camera },
                { title: 'Unique Batch Tracking', desc: 'Each shipment gets a dedicated unique number.', icon: Package },
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{benefit.title}</h4>
                    <p className="text-sm text-slate-500">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-8 md:p-12 lg:p-16 bg-white space-y-8">
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors ${authMode === 'login' ? 'text-slate-900' : 'text-slate-400'}`}
              >
                Sign In
                {authMode === 'login' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
              </button>
              <button 
                onClick={() => setAuthMode('register')}
                className={`flex-1 pb-4 text-sm font-bold uppercase tracking-widest relative transition-colors ${authMode === 'register' ? 'text-slate-900' : 'text-slate-400'}`}
              >
                Register
                {authMode === 'register' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
              </button>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {authMode === 'login' ? 'Welcome Back' : 'Create Seller Account'}
              </h2>
              <p className="text-slate-500">Access the UK's leading hardware brokerage.</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Contact Name</label>
                    <div className="relative">
                      <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required placeholder="Full Name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={authData.name} onChange={e => setAuthData({...authData, name: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" required placeholder="e.g. Acme Logistics" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={authData.companyName} onChange={e => setAuthData({...authData, companyName: e.target.value})} />
                    </div>
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Business Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" required placeholder="name@company.co.uk" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} />
                </div>
              </div>

              <div className="pt-4">
                <Button variant="primary" className="w-full py-4 bg-slate-900 hover:bg-slate-800 rounded-xl flex items-center justify-between group">
                  <span className="font-bold">{authMode === 'login' ? 'Sign In' : 'Register Account'}</span>
                  {authMode === 'login' ? <LogIn className="w-5 h-5" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (portalState === SellerState.CREATE_BATCH) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-12 space-y-8 animate-in slide-in-from-bottom duration-500 pb-24">
        <button onClick={() => setPortalState(SellerState.DASHBOARD)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Discard & Exit
        </button>
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Construct Batch</h1>
            <p className="text-slate-500">Group your equipment for a bulk offer consideration.</p>
          </div>
          <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono text-sm">
            NEW_BATCH_TEMP
          </div>
        </div>

        {submissionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div className="text-sm font-bold leading-relaxed">{submissionError}</div>
          </div>
        )}

        <form onSubmit={handleSubmitBatch} className="space-y-6">
          {batchItems.map((item, index) => (
            <div key={item.id} className={`bg-white border rounded-2xl p-6 shadow-sm transition-colors relative group ${item.condition !== 'Fully Working' ? 'border-red-200 bg-red-50/10' : 'border-slate-200 hover:border-emerald-200'}`}>
              {batchItems.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeItemFromBatch(item.id)}
                  className="absolute -top-3 -right-3 w-8 h-8 bg-white border border-red-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <div className="flex gap-2 items-center mb-4">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${item.condition !== 'Fully Working' ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                  {index + 1}
                </span>
                <h3 className="font-bold text-slate-900">Hardware Item</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3">
                  <div className="relative aspect-square border-2 border-dashed border-slate-100 rounded-xl overflow-hidden bg-slate-50 flex flex-col items-center justify-center text-center p-4">
                    {item.images[0] ? (
                      <img src={item.images[0]} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-slate-300 mb-2" />
                        <p className="text-[10px] font-medium text-slate-400">Click to Identify</p>
                      </>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(item.id, e)} />
                  </div>
                  {isAnalyzing === item.id && (
                    <div className="mt-2 text-[10px] text-blue-600 animate-pulse font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Analyzing...
                    </div>
                  )}
                </div>

                <div className="md:col-span-9 grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Make</label>
                    <input type="text" placeholder="e.g. Zebra" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={item.make} onChange={e => updateItem(item.id, { make: e.target.value })} required />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Model</label>
                    <input type="text" placeholder="e.g. TC70" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={item.model} onChange={e => updateItem(item.id, { model: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Qty</label>
                    <input type="number" min="1" className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm" value={item.quantity} onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) })} required />
                  </div>
                  <div className="col-span-3 flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={item.condition === 'Fully Working'} onChange={e => updateItem(item.id, { condition: e.target.checked ? 'Fully Working' : 'For Parts' })} className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className={`text-xs font-bold ${item.condition !== 'Fully Working' ? 'text-red-600' : 'text-slate-600'}`}>
                        Fully Functional
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-6 border-t border-slate-200">
            <button type="button" onClick={addItemToBatch} className="flex items-center gap-2 px-6 py-3 border-2 border-emerald-500 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors">
              <Plus className="w-5 h-5" />
              Add Another Product Type
            </button>
            <Button variant="primary" type="submit" className="w-full md:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-200">
              Submit Batch for offer consideration
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{currentUser.company} Portal</h1>
            <p className="text-slate-500 italic text-sm">Official Seller Account ({currentUser.name})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setPortalState(SellerState.AUTH)} className="gap-2">
             <LogOut className="w-4 h-4" /> Logout
          </Button>
          <Button variant="primary" onClick={startNewBatch} className="gap-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl px-6 py-3 font-bold">
            <Plus className="w-5 h-5" />
            New Hardware Batch
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Batches', value: batches.length, icon: Package, color: 'emerald' },
          { label: 'Total Units Pending', value: batches.filter(b => b.status === ListingStatus.PENDING_REVIEW || b.status === ListingStatus.APPROVED).reduce((acc, b) => acc + b.items.reduce((iAcc, item) => iAcc + item.quantity, 0), 0), icon: ArrowRight, color: 'amber' },
          { label: 'Settled Value', value: '£0.00', icon: CheckCircle, color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center mb-4`}>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          Your Batch History
          <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{batches.length} Records</span>
        </h2>
        {batches.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <Package className="mx-auto w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No Batches Yet</h3>
            <p className="text-slate-500 mb-8">Group your equipment and submit it as a single batch for bulk processing.</p>
            <Button variant="primary" onClick={startNewBatch} className="bg-slate-900 rounded-xl px-8">Start First Batch</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {batches.map(b => (
              <BatchCard key={b.id} batch={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerPortal;