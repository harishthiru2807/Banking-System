import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Camera, RefreshCw } from 'lucide-react';

export default function ScannerOverlay({ onScan, onClose }) {
  const [isScanning, setIsScanning] = useState(true);
  const [showResult, setShowResult] = useState(false);

  // Mock scan success after a short delay or on button click
  const handleSimulateScan = () => {
    setIsScanning(false);
    setShowResult(true);
    // Simulate finding the default test user or a random one
    setTimeout(() => {
       onScan('9123456789'); 
    }, 1200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-between py-12 px-6"
    >
      <div className="w-full flex justify-between items-center px-4">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full text-white backdrop-blur-md transition-all active:scale-90">
          <X size={24} />
        </button>
        <span className="text-white/60 text-xs font-bold uppercase tracking-widest">QR Scanner</span>
        <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
            <Zap size={20} className="text-yellow-400" />
        </div>
      </div>

      {/* Viewfinder */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Corner Brackets */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

        {/* Animated Scan Line */}
        <AnimatePresence>
          {isScanning && (
            <motion.div 
              animate={{ top: ['5%', '90%', '5%'] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              className="absolute left-4 right-4 h-0.5 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] z-10"
            />
          )}
        </AnimatePresence>

        {/* Camera Feed Placeholder (Animated Noise) */}
        <div className="w-full h-full bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center isolate">
          <motion.div 
             animate={{ opacity: [0.3, 0.4, 0.3] }}
             transition={{ repeat: Infinity, duration: 0.1 }}
             className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"
          />
          <Camera size={48} className="text-white/10" />
        </div>

        {/* Success Overlay */}
        <AnimatePresence>
          {showResult && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-20 border-2 border-emerald-500/50"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-black mb-3 shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                 <RefreshCw size={32} className="animate-spin-slow" />
              </div>
              <p className="text-white font-bold text-sm">Code Detected</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Manual Actions */}
      <div className="w-full flex flex-col items-center">
        <p className="text-white/40 text-[11px] mb-8 font-medium text-center px-10 leading-relaxed uppercase tracking-tighter">
          Align the QR code within the frame to start scanning automatically
        </p>
        
        <button 
          onClick={handleSimulateScan}
          disabled={!isScanning}
          className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 h-16 rounded-[2rem] font-bold flex items-center justify-center space-x-3 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <Camera size={20} />
          <span>SIMULATE SCAN</span>
        </button>
      </div>
    </motion.div>
  );
}
