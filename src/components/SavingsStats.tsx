import React from 'react';
import { TrendingDown, Wallet, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SavingsStats() {
  const data = [
    { name: 'Diabetes', branded: 1200, generic: 250 },
    { name: 'Cardiac', branded: 2500, generic: 600 },
    { name: 'Gastric', branded: 800, generic: 150 },
    { name: 'Neuro', branded: 3400, generic: 900 },
  ];

  const totalBranded = data.reduce((acc, curr) => acc + curr.branded, 0);
  const totalGeneric = data.reduce((acc, curr) => acc + curr.generic, 0);
  const totalSavings = totalBranded - totalGeneric;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-24">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Savings Analysis</h1>
          <p className="text-slate-500 text-sm">Visualizing switching impact.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex flex-col justify-between"
        >
          <div className="bg-emerald-500/10 p-2 rounded-xl w-fit mb-4">
            <TrendingDown className="text-emerald-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Potential Savings</p>
            <p className="text-2xl font-black text-emerald-700">₹{totalSavings}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-sky-50 p-4 rounded-3xl border border-sky-100 flex flex-col justify-between"
        >
          <div className="bg-sky-500/10 p-2 rounded-xl w-fit mb-4">
            <Wallet className="text-sky-600 w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Generic Cost</p>
            <p className="text-2xl font-black text-sky-700">₹{totalGeneric}</p>
          </div>
        </motion.div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center justify-between">
           Yearly Forecast
           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Estimated</span>
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: -20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="branded" name="Branded Cost" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={20} />
              <Bar dataKey="generic" name="Generic Cost" fill="#059669" radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-4">
          Switching to Jan-Aushadhi can reduce your monthly medical expenses by up to 80%.
        </p>
      </div>

      <div className="space-y-4 mt-2">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest px-2">Quality Assurance</h3>
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
             <div className="bg-brand-primary/10 p-3 rounded-full">
               <ShieldCheck className="text-brand-primary w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">BPPI Audited</p>
               <p className="text-xs text-slate-500 leading-tight">Every batch is tested in NABL accredited labs before dispatch.</p>
             </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl">
             <div className="bg-brand-accent/10 p-3 rounded-full">
               <Heart className="text-brand-accent w-6 h-6" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-800">Identical Bio-availability</p>
               <p className="text-xs text-slate-500 leading-tight">Generic medicines match their branded counterparts in efficacy and safety.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
