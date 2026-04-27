import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';
import { ArrowLeft, QrCode } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

export default function ReceiveScreen() {
  const navigate = useNavigate();
  const { isOnline } = useNetwork();
  const { user } = useAuth();
  
  return (
    <div className="h-full flex flex-col bg-[var(--color-canvas)]">
      <div className="px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <button onClick={() => navigate('/mepay/')} className="p-2 bg-[var(--color-surface)] border border-white/5 rounded-full text-white active:scale-95 transition-transform"><ArrowLeft size={20}/></button>
        <span className="text-white font-bold tracking-wide">Receive Payment</span>
        <div className="w-10"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col items-center justify-center px-8 pb-10">
        
        <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative isolate w-full aspect-square max-w-[240px] flex items-center justify-center border-8 border-[var(--color-surface)] mb-8">
          <QRCodeCanvas 
            value={user?.phone || '0000000000'}
            size={160}
            level="H"
            includeMargin={false}
            imageSettings={{
              src: "/vite.svg", // Using a placeholder for the logo
              x: undefined,
              y: undefined,
              height: 24,
              width: 24,
              excavate: true,
            }}
          />
          <div className="absolute inset-0 border-[3px] border-blue-500/50 rounded-[1.8rem] z-10 pointer-events-none" />
          
          {/* Scanning line animation */}
          <motion.div 
            animate={{ top: ['5%', '90%', '5%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute left-[10%] right-[10%] h-[3px] rounded-full bg-blue-500/80 shadow-[0_0_12px_rgba(59,130,246,1)] z-20"
          />
        </div>

        <h2 className="text-[22px] font-bold text-white mb-2">My QR Code</h2>
        <p className="text-gray-400 text-[13px] text-center mb-8 px-4 leading-relaxed">
          Ask the sender to scan this code with their MeshPay app.
        </p>

        <div className={`w-full p-4 rounded-2xl border ${isOnline ? 'bg-[var(--color-surface)] border-white/5' : 'bg-yellow-500/10 border-yellow-500/20'} flex items-center justify-center space-x-3`}>
          {!isOnline ? (
            <>
              <div className="relative flex w-3 h-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
              </div>
              <span className="text-[13px] font-bold text-yellow-100">Broadcasting via Device</span>
            </>
          ) : (
             <span className="text-[13px] font-bold text-gray-300">Ready to receive securely</span>
          )}
        </div>

      </motion.div>
    </div>
  );
}
