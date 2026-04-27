import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Lock } from 'lucide-react';

export default function PinScreen({ phone, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { login } = useAuth();

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBack = () => {
    if (pin.length > 0) setPin(prev => prev.slice(0, -1));
    else onBack();
  };

  useEffect(() => {
    if (pin.length === 4) {
      handleVerify();
    }
  }, [pin]);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      await login(phone, pin);
    } catch (err) {
      setError(err.message);
      setPin('');
      setIsVerifying(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col items-center pt-8 pb-10 px-8 h-full"
    >
      <div className="w-full flex justify-start mb-10">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 active:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center mb-12">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
          <Lock className="text-gray-400" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Security PIN</h2>
        <p className="text-gray-500 text-sm font-medium">Enter your 4-digit PIN for {phone}</p>
      </div>

      <motion.div 
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        className="flex space-x-5 mb-4"
      >
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              pin.length > i 
                ? 'bg-[var(--color-primary)] border-[var(--color-primary)] scale-110 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : 'border-white/20 scale-100'
            }`} 
          />
        ))}
      </motion.div>

      <div className="h-6 mb-12">
        <AnimatePresence>
          {error && (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-red-500 text-xs font-bold uppercase tracking-wider">
              {error}
            </motion.p>
          )}
          {isVerifying && !error && (
            <motion.p initial={{opacity:0}} animate={{opacity:1}} className="text-emerald-500 text-xs font-bold uppercase tracking-widest animate-pulse">
              Verifying...
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Numeric Keypad */}
      <div className="mt-auto w-full grid grid-cols-3 gap-y-4 gap-x-8 max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            onClick={() => handleKeyPress(num.toString())}
            className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-white/5 active:scale-90 transition-all"
          >
            {num}
          </button>
        ))}
        <div />
        <button 
          onClick={() => handleKeyPress('0')}
          className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white hover:bg-white/5 active:scale-90 transition-all"
        >
          0
        </button>
        <button 
          onClick={handleBack}
          className="h-16 w-16 rounded-full flex items-center justify-center text-sm font-bold text-gray-400 hover:text-white active:scale-90 transition-all uppercase tracking-widest"
        >
          DEL
        </button>
      </div>
    </motion.div>
  );
}
