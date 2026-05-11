import React from 'react';
import { Search as SearchIcon, Pill, ArrowRight, Info, AlertCircle, TrendingDown, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translateMedicine, type MedicineTranslation } from '../services/geminiService';
import { COMMON_MEDICINES } from '../data/medicines';
import { cn } from '../lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  brandName: string;
  genericName: string;
}

export function MedicineSearch() {
  const [query_str, setQueryStr] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<MedicineTranslation | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [searchHistory, setSearchHistory] = React.useState<HistoryItem[]>([]);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  // Suggestions logic
  React.useEffect(() => {
    if (query_str.length > 1) {
      // Use common search logic for suggestions
      const results = COMMON_MEDICINES
        .filter(m => 
          m.brandName.toLowerCase().includes(query_str.toLowerCase()) ||
          m.genericName.toLowerCase().includes(query_str.toLowerCase())
        )
        .map(m => m.brandName)
        .slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query_str]);

  // Search History real-time listener
  React.useEffect(() => {
    if (!db || !auth?.currentUser) return;
    const path = `users/${auth.currentUser.uid}/searchHistory`;
    const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(5));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        brandName: d.data().brandName,
        genericName: d.data().genericName,
      })) as HistoryItem[];
      setSearchHistory(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = async (e?: React.FormEvent, searchVal?: string) => {
    if (e) e.preventDefault();
    const finalQuery = searchVal || query_str;
    if (!finalQuery.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setShowSuggestions(false);

    const data = await translateMedicine(finalQuery);
    if (data) {
      setResult(data);
      // Save to history if authenticated
      if (db && auth?.currentUser) {
        const path = `users/${auth.currentUser.uid}/searchHistory`;
        try {
          await addDoc(collection(db, path), {
            brandName: data.brandName,
            genericName: data.genericName,
            timestamp: serverTimestamp()
          });
        } catch (err) {
          console.error("Failed to save history", err);
        }
      }
    } else {
      setError("Medicine not found or invalid. Please try another brand name.");
    }
    setLoading(false);
  };

  const deleteHistoryItem = async (id: string) => {
    if (!db || !auth?.currentUser) return;
    const path = `users/${auth.currentUser.uid}/searchHistory/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (err) {
      console.error("Failed to delete history item", err);
    }
  };

  const chartData = result ? [
    { name: 'Generic', value: result.genericPrice },
    { name: 'Savings', value: result.brandedPrice - result.genericPrice }
  ] : [];

  const COLORS = ['#059669', '#E2E8F0'];

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-24">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Medicine Search</h1>
        <p className="text-slate-500 text-sm">Find affordable generic equivalents for your branded prescription.</p>
      </div>

      <form onSubmit={(e) => handleSearch(e)} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query_str}
            onChange={(e) => setQueryStr(e.target.value)}
            placeholder="Enter brand name (e.g. Crocin, Augmentin)"
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-brand-primary placeholder:text-slate-400"
            onFocus={() => query_str.length > 1 && setShowSuggestions(true)}
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          
          <AnimatePresence>
            {showSuggestions && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
              >
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQueryStr(suggestion);
                      handleSearch(undefined, suggestion);
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-emerald-50 text-slate-700 font-medium border-b border-slate-50 last:border-0 flex items-center gap-3"
                  >
                    <SearchIcon className="w-3.5 h-3.5 text-slate-300" />
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          {['Crocin', 'Pan 40', 'Augmentin', 'Telma 40', 'Glycomet'].map(name => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setQueryStr(name);
                handleSearch(undefined, name);
              }}
              className="px-4 py-1.5 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 text-xs font-bold rounded-full border border-slate-200 hover:border-emerald-200 transition-all active:scale-95"
            >
              {name}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-3 w-full bg-brand-primary text-white font-semibold py-3 rounded-2xl shadow-lg transition-transform active:scale-95 disabled:opacity-70"
        >
          {loading ? "Analyzing..." : "Search Generic Equivalent"}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <div className="w-12 h-12 border-4 border-slate-200 border-t-brand-primary rounded-full animate-spin" />
            <p className="text-slate-500 font-medium animate-pulse">Running Brand-to-Generic Translation...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 p-4 rounded-xl flex gap-3 text-red-700"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {!result && !loading && searchHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4 pt-2"
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-slate-400">
                <History className="w-4 h-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Recent Searches</p>
              </div>
              <button 
                onClick={async () => {
                  if (!db || !auth?.currentUser) return;
                  const confirmed = window.confirm("Clear your entire search history?");
                  if (!confirmed) return;
                  
                  // In a real app, you'd use a batch or a cloud function to clear a collection.
                  // For now, we'll delete them individually for simplicity in this demo.
                  for (const item of searchHistory) {
                    await deleteHistoryItem(item.id);
                  }
                }}
                className="text-[10px] font-bold text-red-400 hover:text-red-500 transition-colors uppercase tracking-widest"
              >
                Clear All
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {searchHistory.map((item) => (
                <div key={item.id} className="flex gap-2 group animate-in fade-in slide-in-from-left-2 transition-all">
                  <button 
                    onClick={() => handleSearch(undefined, item.brandName)}
                    className="flex-1 text-left p-3.5 bg-white border border-slate-100 rounded-2xl hover:border-brand-primary hover:bg-emerald-50/30 transition-all flex justify-between items-center shadow-sm"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{item.brandName}</span>
                      <span className="text-[10px] text-brand-primary font-medium">Generic: {item.genericName}</span>
                    </div>
                    <SearchIcon className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-primary transition-colors" />
                  </button>
                  <button 
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-3.5 text-slate-300 hover:text-red-400 transition-colors bg-white border border-slate-100 rounded-2xl hover:border-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-brand-primary/5 p-4 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Branded Version</h3>
                    <p className="text-lg font-bold text-slate-800">{result.brandName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-400 line-through">₹{result.brandedPrice}</p>
                    <p className="text-xs text-slate-400">Market Avg</p>
                  </div>
                </div>
                
                <div className="flex justify-center my-4">
                  <motion.div 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <ArrowRight className="text-brand-primary w-6 h-6" />
                  </motion.div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-bold text-brand-primary text-xs uppercase tracking-wider">Jan-Aushadhi Generic</h3>
                    <p className="text-2xl font-bold text-brand-primary">{result.genericName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-primary">₹{result.genericPrice}</p>
                    <p className="text-xs text-brand-primary font-medium">Potential Rate</p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 text-white p-2 rounded-lg">
                      <TrendingDown className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Total Savings</p>
                      <p className="text-xs text-emerald-700">Per standard pack</p>
                    </div>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">₹{result.brandedPrice - result.genericPrice}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Composition</p>
                    <p className="text-xs font-medium text-slate-700">{result.composition}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Usage</p>
                    <p className="text-xs font-medium text-slate-700">{result.usage}</p>
                  </div>
                </div>

                <div className="h-[180px] w-full flex flex-col items-center justify-center relative">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-400 uppercase">Save</p>
                      <p className="text-xl font-black text-brand-primary">{Math.round(result.savingsPercentage)}%</p>
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-blue-700 border border-blue-100 mb-4">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Prices are approximate. Jan-Aushadhi Kendras may have slightly different rates depending on locational subsidies and fresh stock updates.
              </p>
            </div>
            
            <button 
              onClick={() => setResult(null)}
              className="w-full py-4 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Back to Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
