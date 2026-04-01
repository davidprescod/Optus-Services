
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  ShieldCheck, 
  UserCircle, 
  LogOut,
  Bell,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { UserRole, User } from './types';
import SellerPortal from './components/SellerPortal';
import BuyerDashboard from './components/BuyerDashboard';
import AdminDashboard from './components/AdminDashboard';

const MOCK_USERS: Record<UserRole, User> = {
  [UserRole.SELLER]: { id: 's1', name: 'John Seller', email: 'john@logistics-co.uk', role: UserRole.SELLER, company: 'Logistics Co UK' },
  [UserRole.BUYER]: { id: 'b1', name: 'Alice Buyer', email: 'alice@refurb-pro.com', role: UserRole.BUYER, company: 'Refurb Pro' },
  [UserRole.ADMIN]: { id: 'a1', name: 'Admin User', email: 'admin@hardwarelink.io', role: UserRole.ADMIN, company: 'HardwareLink' }
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[UserRole.SELLER]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const switchRole = (role: UserRole) => {
    setCurrentUser(MOCK_USERS[role]);
    setIsMobileMenuOpen(false);
  };

  const isSellerView = currentUser.role === UserRole.SELLER;

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Navigation Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col">
            <div className="p-6 flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="font-bold text-xl tracking-tight">HardwareLink</h1>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4">
              <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform Portals</p>
              
              <button 
                onClick={() => switchRole(UserRole.SELLER)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentUser.role === UserRole.SELLER ? 'bg-emerald-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Seller Portal</span>
              </button>

              <button 
                onClick={() => switchRole(UserRole.BUYER)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentUser.role === UserRole.BUYER ? 'bg-blue-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Buyer Portal</span>
              </button>

              <button 
                onClick={() => switchRole(UserRole.ADMIN)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentUser.role === UserRole.ADMIN ? 'bg-purple-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <ShieldCheck className="w-5 h-5" />
                <span>Admin Panel</span>
              </button>

              <div className="pt-8 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">My Session</div>
              <div className="flex items-center gap-3 px-3 py-2 text-slate-300">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm truncate">{currentUser.name}</span>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors text-sm px-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Shared Header (Hidden for specific Seller Auth states if needed, but useful for role switching demo) */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>

            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-slate-800 hidden sm:block">
                {isSellerView ? "Enterprise Seller Access" : `Dashboard » ${currentUser.role}`}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-slate-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs border border-slate-200">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={
                currentUser.role === UserRole.SELLER ? <SellerPortal user={currentUser} /> :
                currentUser.role === UserRole.BUYER ? <BuyerDashboard user={currentUser} /> :
                <AdminDashboard user={currentUser} />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
