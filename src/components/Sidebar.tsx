import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, ShieldCheck, HeartPulse, LifeBuoy, Settings, LogOut } from 'lucide-react';
import { logOut } from '../firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
}

export function Sidebar({ isOpen, onClose, userEmail }: SidebarProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 bg-emerald-600 text-white relative">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mb-4">
                <HeartPulse className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Jan-Aushadhi</h2>
              <p className="text-emerald-100 text-xs font-medium">Healthcare Savings Tool</p>
              {userEmail && (
                <p className="mt-4 text-[10px] uppercase font-black tracking-widest text-emerald-200/60 truncate">
                  {userEmail}
                </p>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6">
              <SidebarItem 
                icon={<Info className="w-5 h-5" />} 
                label="About Generic Medicine" 
                onClick={onClose}
              />
              <SidebarItem 
                icon={<ShieldCheck className="w-5 h-5" />} 
                label="Quality Standards" 
                onClick={onClose}
              />
              <SidebarItem 
                icon={<LifeBuoy className="w-5 h-5" />} 
                label="Help & Support" 
                onClick={onClose}
              />
              <div className="h-px bg-slate-100 my-4 mx-8" />
              <SidebarItem 
                icon={<Settings className="w-5 h-5" />} 
                label="Settings" 
                onClick={onClose}
              />
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100">
              <button 
                onClick={() => {
                  logOut();
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <p className="mt-6 text-center text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">
                Version 1.0.4 - Beta
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SidebarItem({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 px-8 py-4 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all group"
    >
      <div className="text-slate-400 group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}
