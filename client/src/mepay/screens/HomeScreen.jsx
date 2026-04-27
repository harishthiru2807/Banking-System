import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';
import { Send, QrCode, ArrowUpRight, ArrowDownLeft, WifiOff, History } from 'lucide-react';

export default function HomeScreen() {
  const navigate = useNavigate();
  const { isOnline, balance, transactions } = useNetwork();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="p-5 h-full flex flex-col space-y-6"
    >
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-[2rem] p-6 text-white shadow-xl isolate border border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-950 -z-10" />
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-400 opacity-20 blur-2xl z-0" />
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-emerald-100/80 text-sm font-medium mb-1">Total Balance</p>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-semibold opacity-80">$</span>
              <span className="text-4xl font-bold tracking-tight">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {!isOnline && (
          <div className="relative z-10 mt-6 inline-flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-yellow-500/20 text-yellow-100">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse box-shadow" style={{boxShadow: '0 0 8px rgba(250, 204, 21, 0.8)'}} />
            <span>Offline Mesh Active</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button 
          onClick={() => navigate('/mepay/pay')}
          className="flex-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-colors group active:scale-95"
        >
          <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors shrink-0">
            <Send className="text-emerald-500 ml-1" size={24} />
          </div>
          <span className="text-sm font-semibold text-gray-200">Pay</span>
        </button>
        <button 
          onClick={() => navigate('/mepay/receive')}
          className="flex-1 bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] border border-white/5 p-4 rounded-3xl flex flex-col items-center justify-center space-y-3 transition-colors group active:scale-95"
        >
          <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
            <QrCode className="text-blue-500" size={24} />
          </div>
          <span className="text-sm font-semibold text-gray-200">Receive</span>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="flex-1 flex flex-col pt-2 min-h-0">
        <div className="flex items-center justify-between mx-2 mb-4 shrink-0">
          <h3 className="text-lg font-bold text-gray-100">Recent</h3>
          <button className="text-xs text-[var(--color-primary)] font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors">See All</button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pb-8 pr-1 custom-scrollbar">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-[var(--color-surface)] rounded-[1.25rem] border border-white/5">
              <div className="flex items-center space-x-3.5">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'send' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                }`}>
                  {tx.type === 'send' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                <div>
                  <p className="text-[15px] font-bold text-gray-200 truncate max-w-[120px]">{tx.name}</p>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-[11px] font-medium text-gray-500">{tx.time}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600 block" />
                    <span className="text-[11px] font-semibold text-gray-400 flex items-center">
                      {tx.method === 'Mesh' ? <WifiOff size={10} className="mr-0.5 text-yellow-500" /> : null}
                      {tx.method}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[15px] font-bold ${tx.type === 'send' ? 'text-gray-200' : 'text-emerald-400'}`}>
                  {tx.type === 'send' ? '-' : '+'}${tx.amount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
             <div className="flex flex-col items-center justify-center h-32 text-gray-500">
               <History size={32} className="mb-2 opacity-50" />
               <p className="text-sm font-medium">No recent transactions</p>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
