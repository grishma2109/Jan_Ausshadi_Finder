import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pill, ShieldCheck, HeartPulse, Mail, Lock, ArrowRight, UserPlus } from 'lucide-react';
import { signInWithEmail, signUpWithEmail } from '../firebase';

export function Auth({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onAuthenticated();
    } catch (err: any) {
      console.error(err);
      let msg = "An error occurred during authentication.";
      if (err.code === 'auth/user-not-found') msg = "No user found with this email.";
      if (err.code === 'auth/wrong-password') msg = "Incorrect password.";
      if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      if (err.code === 'auth/invalid-email') msg = "Invalid email format.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-600 to-emerald-800 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-40 -mt-40 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-400/20 rounded-full -ml-40 -mb-40 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 w-full max-w-sm space-y-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-emerald-900/30"
          >
            <Pill className="w-12 h-12 text-emerald-600" />
          </motion.div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight">Jan-Aushadhi</h1>
            <p className="text-emerald-50/70 text-sm font-medium">Affordable Healthcare for Everyone</p>
          </div>
        </div>

        <motion.div 
          layout
          className="bg-white/10 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-xl font-bold text-center mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-200/50 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-emerald-100/30 transition-all"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-200/50 group-focus-within:text-white transition-colors" />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 placeholder:text-emerald-100/30 transition-all"
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-center p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-xs text-red-100 font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-emerald-800 font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-emerald-50 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-emerald-700/30 border-t-emerald-700 rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? (
                    <>Sign In <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <>Sign Up <UserPlus className="w-5 h-5" /></>
                  )}
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
                className="text-xs font-bold text-emerald-100/60 hover:text-white transition-colors uppercase tracking-widest"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5 text-center">
            <ShieldCheck className="w-5 h-5 mb-2 mx-auto text-emerald-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/50">Trusted Quality</p>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/5 text-center">
            <HeartPulse className="w-5 h-5 mb-2 mx-auto text-emerald-300" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/50">Govt. Certified</p>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 flex flex-col items-center opacity-30">
        <p className="text-[10px] font-black tracking-[0.4em] uppercase">Healthcare Literacy Portal</p>
        <div className="w-12 h-0.5 bg-white mt-2 rounded-full" />
      </div>
    </div>
  );
}
