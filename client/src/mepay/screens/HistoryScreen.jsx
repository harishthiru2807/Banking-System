import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';

export default function HistoryScreen() {
  const navigate = useNavigate();
  const { transactions, offlineTransactions } = useNetwork();

  // Combine and sort transactions
  const allTxs = [
    ...transactions,
    ...offlineTransactions.map(tx => ({
      id: tx.id,
      type: 'send',
      amount: tx.amount,
      name: `To ${tx.receiverPhone}`,
      method: 'Mesh',
      status: tx.status, // pending, completed, failed
      time: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: tx.timestamp
    }))
  ].sort((a, b) => new Date(b.timestamp || new Date(`1970/01/01 ${b.time}`)) - new Date(a.timestamp || new Date(`1970/01/01 ${a.time}`)));

  const getStatusIcon = (status, method) => {
    if (status === 'pending') return <Clock size={16} className="text-orange-400" />;
    if (status === 'failed') return <XCircle size={16} className="text-red-400" />;
    return <CheckCircle2 size={16} className="text-emerald-400" />;
  };

  const getStatusColor = (status) => {
    if (status === 'pending') return 'text-orange-400';
    if (status === 'failed') return 'text-red-400';
    return 'text-emerald-400';
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-canvas)]">
      <div className="px-4 py-3 flex items-center justify-between z-10 shrink-0 border-b border-white/5">
        <button onClick={() => navigate('/mepay/')} className="p-2 bg-[var(--color-surface)] rounded-full text-white active:scale-95 transition-transform border border-white/5"><ArrowLeft size={20}/></button>
        <span className="text-white font-bold tracking-wide">Transaction History</span>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {allTxs.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            No transactions found
          </div>
        ) : (
          allTxs.map(tx => (
            <motion.div 
              key={tx.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[var(--color-surface)] rounded-2xl border border-white/5 flex items-center justify-between"
            >
              <div>
                <div className="text-white font-semibold text-sm mb-1">{tx.name}</div>
                <div className="flex items-center space-x-1.5 text-xs">
                  {getStatusIcon(tx.status, tx.method)}
                  <span className={`${getStatusColor(tx.status)} capitalize font-medium`}>
                    {tx.status} {tx.method === 'Mesh' && tx.status === 'pending' ? '(Mesh)' : ''}
                  </span>
                  <span className="text-gray-500 mx-1">•</span>
                  <span className="text-gray-500">{tx.time}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${tx.type === 'send' ? 'text-white' : 'text-emerald-400'}`}>
                  {tx.type === 'send' ? '-' : '+'}${tx.amount}
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">{tx.method}</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
