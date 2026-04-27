import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Wallet, ArrowRight, Smartphone } from 'lucide-react';

export default function LoginScreen({ onNext }) {
  const [phone, setPhone] = useState('8098719903');
  
  const handleContinue = (e) => {
    e.preventDefault();
    if (phone.length > 0) {
      onNext(phone);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col px-8 pt-12 pb-10 h-full"
    >
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
          <Wallet className="text-[var(--color-primary)]" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">MeshPay</h1>
        <p className="text-gray-400 text-sm font-medium">Safe Offline Payments</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Mobile Number</label>
          <div className="mt-2 relative flex items-center">
            <div className="absolute left-5 text-gray-400 font-bold border-r border-white/10 pr-4 py-1 flex items-center">
              <span className="text-sm">+91</span>
            </div>
            <input 
              type="tel" 
              placeholder="00000 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-[var(--color-surface)] border border-white/5 rounded-3xl py-5 pl-20 pr-6 text-xl text-white font-bold tracking-[0.2em] outline-none focus:border-emerald-500/50 transition-colors placeholder:text-gray-700"
            />
          </div>
        </div>
        
        <p className="text-[11px] text-gray-500 mt-4 leading-relaxed px-1">
          By continuing, you agree to our Terms of Service and Privacy Policy. We'll send a virtual PIN check for security.
        </p>

        <button 
          onClick={handleContinue}
          disabled={phone.length === 0}
          className="mt-auto w-full bg-[var(--color-primary)] disabled:opacity-30 disabled:grayscale text-black h-16 rounded-[2rem] font-extrabold flex items-center justify-center space-x-3 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <span className="uppercase tracking-widest text-sm">Continue</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </motion.div>
  );
}
