/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, MapPin, Calendar, BarChart3, User as UserIcon, Menu, MessageSquare, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MedicineSearch } from './components/MedicineSearch';
import { StoreLocator } from './components/StoreLocator';
import { MedicineReminders } from './components/MedicineReminders';
import { SavingsStats } from './components/SavingsStats';
import { Auth } from './components/Auth';
import { FeedbackModal } from './components/FeedbackModal';
import { Sidebar } from './components/Sidebar';
import { auth, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { checkMedicineStock } from './services/geminiService';

type Tab = 'search' | 'stores' | 'reminders' | 'savings';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [authChecking, setAuthChecking] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Tab>('search');
  const [showStockModal, setShowStockModal] = React.useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = React.useState(false);
  const [showSidebar, setShowSidebar] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  
  const [medicineInput, setMedicineInput] = React.useState('');
  const [selectedStoreName, setSelectedStoreName] = React.useState('Jan-Aushadhi Kendra #421');
  const [stockResponse, setStockResponse] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!auth) {
      setAuthChecking(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleGlobalStockInquiry = async () => {
    if (!medicineInput) return;
    setIsSearching(true);
    const res = await checkMedicineStock(medicineInput, selectedStoreName);
    setStockResponse(res);
    setIsSearching(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'search': return <MedicineSearch />;
      case 'stores': return <StoreLocator />;
      case 'reminders': return <MedicineReminders />;
      case 'savings': return <SavingsStats />;
    }
  };

  if (authChecking) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-container">
        <Auth onAuthenticated={() => {}} />
      </div>
    );
  }

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-white z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSidebar(true)}
            className="bg-brand-primary p-2 rounded-xl text-white active:scale-95 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xs font-black text-brand-primary uppercase tracking-tighter leading-none">Jan-Aushadhi</h2>
            <h1 className="text-sm font-bold text-slate-800">Finder App</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStockModal(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="bg-slate-100 p-2 rounded-xl text-slate-600 overflow-hidden"
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-full" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </button>
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
                  >
                    <div className="px-3 py-2 mb-2 border-b border-slate-50">
                      <p className="text-xs font-bold text-slate-800 truncate">{user.displayName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => {
                        logOut();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 pb-2 safe-area-bottom">
        <NavButton 
          active={activeTab === 'search'} 
          onClick={() => setActiveTab('search')} 
          icon={<Search className="w-5 h-5" />} 
          label="Search" 
        />
        <NavButton 
          active={activeTab === 'stores'} 
          onClick={() => setActiveTab('stores')} 
          icon={<MapPin className="w-5 h-5" />} 
          label="Locator" 
        />
        <div className="w-12" /> {/* Space for floating button maybe? Or just spacing */}
        <NavButton 
          active={activeTab === 'reminders'} 
          onClick={() => setActiveTab('reminders')} 
          icon={<Calendar className="w-5 h-5" />} 
          label="Tracker" 
        />
        <NavButton 
          active={activeTab === 'savings'} 
          onClick={() => setActiveTab('savings')} 
          icon={<BarChart3 className="w-5 h-5" />} 
          label="Stats" 
        />

        {/* Floating Stock Center Button */}
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
           <button 
            onClick={() => setActiveTab('search')}
            className={`p-4 rounded-2xl shadow-xl transition-all ${
              activeTab === 'search' ? 'bg-brand-primary text-white scale-110' : 'bg-slate-100 text-slate-400'
            }`}
           >
             <Search className="w-6 h-6" />
           </button>
        </div>
      </nav>

      {/* Stock Request Modal (Simulated) */}
      <AnimatePresence>
        {showStockModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full rounded-3xl p-6 shadow-2xl relative"
            >
              <h2 className="text-xl font-bold mb-2">Stock Request</h2>
              <p className="text-sm text-slate-500 mb-6">Ask a nearby Kendra if they have a specific medicine in stock.</p>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Select Store</label>
                  <select 
                    value={selectedStoreName}
                    onChange={e => setSelectedStoreName(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary"
                  >
                    <option>Jan-Aushadhi Kendra #421</option>
                    <option>Prime Generic Mart</option>
                    <option>Central Government Store</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Medicine Name</label>
                  <input 
                    type="text" 
                    value={medicineInput}
                    onChange={e => setMedicineInput(e.target.value)}
                    placeholder="Enter medicine..." 
                    className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-primary" 
                  />
                </div>

                {stockResponse && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-600">
                    {stockResponse}
                  </div>
                )}

                <button 
                  onClick={handleGlobalStockInquiry}
                  disabled={isSearching || !medicineInput}
                  className="w-full bg-brand-primary text-white font-bold py-3 rounded-2xl shadow-lg mt-4 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Inquiring...
                    </>
                  ) : 'Send Inquiry'}
                </button>
                <button 
                  onClick={() => {
                    setShowStockModal(false);
                    setStockResponse('');
                    setMedicineInput('');
                  }}
                  className="w-full text-slate-400 text-sm font-bold py-2 hover:text-slate-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Feedback Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowFeedbackModal(true)}
        className="fixed right-6 bottom-24 z-40 bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center group"
      >
        <MessageSquare className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
          Give Feedback
        </span>
      </motion.button>

      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />

      <Sidebar 
        isOpen={showSidebar} 
        onClose={() => setShowSidebar(false)} 
        userEmail={user?.email || null}
      />
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-brand-primary' : 'text-slate-400'}`}
    >
      <div className={`p-1 rounded-lg transition-colors ${active ? 'bg-emerald-50' : 'transparent'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );
}
