import React from 'react';
import { Calendar, Bell, Plus, CheckCircle2, Circle, Clock, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';

interface Reminder {
  id: string;
  name: string;
  dosage: string;
  nextRefill: string;
  completed: boolean;
}

export function MedicineReminders() {
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newDosage, setNewDosage] = React.useState('');
  const [newDate, setNewDate] = React.useState('');

  React.useEffect(() => {
    if (!db || !auth?.currentUser) {
      setLoading(false);
      return;
    }

    const path = `users/${auth.currentUser.uid}/reminders`;
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({
        id: d.id,
        name: d.data().medicineName,
        dosage: d.data().dosage,
        nextRefill: d.data().nextRefillDate,
        completed: d.data().isCompleted,
      })) as Reminder[];
      setReminders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  const toggle = async (id: string, currentStatus: boolean) => {
    if (!db || !auth?.currentUser) return;
    const path = `users/${auth.currentUser.uid}/reminders/${id}`;
    try {
      await updateDoc(doc(db, path), { isCompleted: !currentStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const remove = async (id: string) => {
    if (!db || !auth?.currentUser) return;
    const path = `users/${auth.currentUser.uid}/reminders/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !auth?.currentUser || !newName || !newDate) return;
    
    const path = `users/${auth.currentUser.uid}/reminders`;
    try {
      await addDoc(collection(db, path), {
        userId: auth.currentUser.uid,
        medicineName: newName,
        dosage: newDosage,
        nextRefillDate: newDate,
        isCompleted: false,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewName('');
      setNewDosage('');
      setNewDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto pb-24">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Refill Tracker</h1>
          <p className="text-slate-500 text-sm">Monthly prescription reminders.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-primary p-2 rounded-xl text-white shadow-lg shadow-emerald-200 active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="bg-brand-primary rounded-3xl p-6 text-white overflow-hidden relative shadow-inner">
        <div className="relative z-10">
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-1">Health Literacy Tip</p>
          <h2 className="text-lg font-bold mb-2 italic">"Generic medicines pass the same strict quality tests as branded ones!"</h2>
          <div className="flex items-center gap-2 text-sm text-emerald-100">
            <CheckCircle2 className="w-4 h-4" />
            <span>WHO GMP Certified</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
      </div>

      <div className="space-y-4 mt-2">
        <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest px-2">Active Reminders</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-primary rounded-full animate-spin" />
            </div>
          ) : reminders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm">No reminders yet. Add one to track your refills.</p>
            </div>
          ) : (
            <AnimatePresence>
              {reminders.map((r, i) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    r.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggle(r.id, r.completed)} className="text-brand-primary">
                      {r.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                    </button>
                    <div>
                      <p className={`font-bold ${r.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>{r.name}</p>
                      <div className="flex items-center gap-3 text-xs mt-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {r.dosage}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {!r.completed && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Refill</p>
                        <p className="text-sm font-black text-brand-accent">{r.nextRefill}</p>
                      </div>
                    )}
                    <button onClick={() => remove(r.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
      
      {/* Add Reminder Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-end p-0 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full rounded-t-[2.5rem] p-8 pb-12 shadow-2xl relative"
            >
              <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Add Reminder</h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={addReminder} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Medicine Name</label>
                  <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Metformin, Amlodipine" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-primary" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Dosage</label>
                    <input 
                      type="text" 
                      value={newDosage}
                      onChange={e => setNewDosage(e.target.value)}
                      placeholder="e.g. 500mg" 
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-primary" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Refill Date</label>
                    <input 
                      type="date" 
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-brand-primary" 
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-brand-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-200/50 mt-4 active:scale-95 transition-transform"
                >
                  Create Reminder
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">Notifications are enabled for refill alerts.</p>
        </div>
      </div>
    </div>
  );
}
