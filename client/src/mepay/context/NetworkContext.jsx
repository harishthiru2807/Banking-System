import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NetworkContext = createContext(null);

export function NetworkProvider({ children }) {
  const { user, refreshProfile } = useAuth();
  const [isOnline, setIsOnline] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [offlineTransactions, setOfflineTransactions] = useState([]);

  // Load offline transactions on mount
  useEffect(() => {
    const stored = localStorage.getItem('meshpay_offline_txs');
    if (stored) {
      setOfflineTransactions(JSON.parse(stored));
    }
  }, []);

  // Save offline transactions when updated
  useEffect(() => {
    localStorage.setItem('meshpay_offline_txs', JSON.stringify(offlineTransactions));
  }, [offlineTransactions]);

  const fetchTransactions = async () => {
    const token = localStorage.getItem('meshpay_token');
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const transformed = data.map(tx => ({
          id: tx.id.toString(),
          type: tx.sender_id === user?.id ? 'send' : 'receive',
          amount: tx.amount,
          name: tx.sender_id === user?.id ? `To ${tx.receiver_phone}` : 'Incoming Transfer',
          method: tx.method,
          status: tx.status,
          time: new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setTransactions(transformed);
      }
    } catch (err) {
      console.error("Fetch transactions failed", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Sync offline transactions when internet becomes available
  useEffect(() => {
    if (isOnline && offlineTransactions.length > 0 && user) {
      syncOfflineTransactions();
    }
  }, [isOnline, user]);

  const syncOfflineTransactions = async () => {
    const token = localStorage.getItem('meshpay_token');
    if (!token) return;
    
    // Get only pending
    const pendingTxs = offlineTransactions.filter(tx => tx.status === 'pending');
    if (pendingTxs.length === 0) return;

    try {
      const response = await fetch('http://localhost:5000/api/sync-mesh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactions: pendingTxs })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update local statuses based on result
        const updatedOffline = [...offlineTransactions];
        
        result.results.forEach(res => {
          const tx = updatedOffline.find(t => t.id === res.id);
          if (tx) {
            tx.status = res.status;
          }
        });

        // Filter out completed ones, or keep them as 'completed'
        setOfflineTransactions(updatedOffline.filter(tx => tx.status !== 'completed'));
        
        await refreshProfile();
        await fetchTransactions();
      }
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  const toggleConnection = () => {
    setIsOnline(!isOnline);
  };

  const initiateMeshPayment = (txData) => {
    // Generate unique ID and basic signature
    const txn_id = 'mesh_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const signature = btoa(txn_id + txData.amount + 'secure');

    const newTx = {
      id: txn_id,
      sender_id: user?.id,
      receiverPhone: txData.name,
      amount: parseFloat(txData.amount),
      status: 'pending',
      method: 'Mesh',
      timestamp: new Date().toISOString(),
      signature
    };

    setOfflineTransactions([...offlineTransactions, newTx]);
    return txn_id;
  };

  const addTransaction = async (txData) => {
    if (txData.method === 'Mesh') {
      return initiateMeshPayment(txData);
    }

    const token = localStorage.getItem('meshpay_token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/pay', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverPhone: txData.name,
          amount: txData.amount,
          method: txData.method
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Payment failed');
      }

      await refreshProfile();
      await fetchTransactions();
    } catch (err) {
      throw err;
    }
  };

  // Calculate locked balance
  const lockedBalance = offlineTransactions
    .filter(tx => tx.status === 'pending')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const availableBalance = (user?.balance || 0) - lockedBalance;

  return (
    <NetworkContext.Provider value={{ 
      isOnline, 
      toggleConnection, 
      balance: availableBalance, 
      transactions, 
      offlineTransactions,
      addTransaction, 
      fetchTransactions 
    }}>
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
