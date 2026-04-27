import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useNetwork } from '../context/NetworkContext';
import { ArrowLeft, Wifi, WifiOff, Zap, CheckCircle2, QrCode, Clock, ShieldAlert } from 'lucide-react';
import MeshVisualizer from '../components/MeshVisualizer';
import QRScanner from '../components/QRScanner';
import DeviceDiscovery from '../components/DeviceDiscovery';

export default function PaymentScreen() {
  const navigate = useNavigate();
  const { isOnline, addTransaction } = useNetwork();
  
  // 1: Amount&Mode, 2: Confirmation, 3: DeviceDiscovery, 4: MeshRouting, 5: Success/Pending, 6: Scanner
  const [step, setStep] = useState(1); 
  const [amount, setAmount] = useState('0');
  const [recipient, setRecipient] = useState('');
  const [paymentMode, setPaymentMode] = useState(isOnline ? 'Online' : 'Mesh');

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [txnId, setTxnId] = useState(null);

  // Auto-switch mode if offline
  React.useEffect(() => {
    if (!isOnline) {
      setPaymentMode('Mesh');
    }
  }, [isOnline]);

  const handleNumber = (n) => {
    if (amount === '0') setAmount(n);
    else setAmount(prev => prev + n);
  };
  const handleDel = () => {
    if (amount.length > 1) setAmount(prev => prev.slice(0, -1));
    else setAmount('0');
  };

  const handleScan = (data) => {
    let parsedName = data;
    if (data.toLowerCase().startsWith('upi://')) {
      const urlParams = new URLSearchParams(data.split('?')[1]);
      parsedName = urlParams.get('pn') || urlParams.get('pa') || data;
    }
    setRecipient(parsedName);
    setStep(1); 
  };

  const handleInitiate = () => {
    if (amount === '0' || !recipient) return;
    setStep(2); // Go to Confirmation
  };

  const handleSendSecurely = async () => {
    if (paymentMode === 'Mesh') {
      // Mesh Flow
      setStep(3); // Device Discovery
    } else {
      // Online Flow
      setIsProcessing(true);
      setError('');
      try {
        await addTransaction({
          amount: parseFloat(amount),
          name: recipient,
          method: 'Online',
        });
        setStep(5);
      } catch (err) {
        setError(err.message);
        setStep(1);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleDeviceDiscoveryComplete = () => {
    setStep(4); // Mesh Routing
  };

  const handleMeshRoutingComplete = async () => {
    try {
      const id = await addTransaction({
        amount: parseFloat(amount),
        name: recipient,
        method: 'Mesh',
      });
      setTxnId(id);
      setStep(5);
    } catch (err) {
      setError(err.message);
      setStep(1);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[var(--color-canvas)]">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <button onClick={() => {
          if (step > 1 && step < 3) setStep(step - 1);
          else navigate('/mepay/');
        }} className="p-2 bg-[var(--color-surface)] rounded-full text-white active:scale-95 transition-transform border border-white/5"><ArrowLeft size={20}/></button>
        <span className="text-white font-bold tracking-wide">
          {step === 2 ? 'Confirm Payment' : 'Send Payment'}
        </span>
        <div className="w-10"></div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col px-6 pt-2 pb-6 min-h-0">
            
            <div className="flex-1 flex flex-col max-h-[300px]">
              <div className="text-center mb-6 relative">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Sending to</span>
                <div className="flex items-center justify-center mt-2 relative">
                   <input 
                     type="text" 
                     placeholder="Enter Mobile Number" 
                     value={recipient}
                     onChange={e => setRecipient(e.target.value)}
                     className="w-full bg-transparent border-none text-center text-[22px] text-[var(--text-main)] font-bold outline-none placeholder-gray-600 focus:ring-0 px-12" 
                   />
                   <button 
                     onClick={() => setStep(6)} 
                     className="absolute right-2 p-2 text-emerald-500 bg-emerald-500/10 rounded-full hover:bg-emerald-500/20 transition-colors"
                   >
                     <QrCode size={20} />
                   </button>
                </div>
              </div>

              <div className="text-center flex justify-center items-center mt-2 pb-6 border-b border-white/5">
                <span className="text-[28px] font-semibold text-emerald-500 mr-1 mt-2">$</span>
                <span className="text-[64px] font-bold text-white tracking-tight leading-none">{amount}</span>
              </div>
              
              <AnimatePresence>
                {error && (
                  <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-500 text-xs font-bold text-center uppercase tracking-wide">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mode Selection */}
            <div className="mt-auto mb-6 shrink-0">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider ml-2 mb-2 block">Payment Mode</span>
              <div className="flex space-x-2">
                <button 
                  onClick={() => isOnline && setPaymentMode('Online')}
                  className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${paymentMode === 'Online' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-[var(--color-surface)] border-white/5 text-gray-400'} ${!isOnline && 'opacity-50 grayscale'}`}
                >
                  <Wifi size={18} />
                  <span className="text-sm font-bold">Online</span>
                </button>
                <button 
                  onClick={() => setPaymentMode('Mesh')}
                  className={`flex-1 py-3 px-4 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${paymentMode === 'Mesh' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-[var(--color-surface)] border-white/5 text-gray-400'}`}
                >
                  <Zap size={18} />
                  <span className="text-sm font-bold">Mesh (Offline)</span>
                </button>
              </div>
              {paymentMode === 'Mesh' && (
                <p className="text-xs text-purple-400/80 mt-3 px-2 text-center">
                  This payment will be securely routed through nearby devices and completed when internet becomes available.
                </p>
              )}
            </div>

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-3 mb-5 shrink-0">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((n, i) => (
                <button key={i} onClick={() => handleNumber(n.toString())} className="h-[3.5rem] rounded-[1.25rem] bg-[var(--color-surface)] text-white text-[22px] font-semibold active:bg-white/10 transition-colors border border-white/5">
                  {n}
                </button>
              ))}
              <button onClick={handleDel} className="h-[3.5rem] rounded-[1.25rem] bg-[var(--color-surface)] text-gray-400 text-sm tracking-widest font-bold active:bg-white/10 transition-colors flex items-center justify-center border border-white/5">
                DEL
              </button>
            </div>

            <button 
              disabled={amount === '0' || !recipient}
              onClick={handleInitiate}
              className={`w-full disabled:opacity-50 disabled:grayscale text-black py-4 rounded-full font-extrabold text-[15px] shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center shrink-0 uppercase tracking-wide ${paymentMode === 'Mesh' ? 'bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.3)]' : 'bg-[var(--color-primary)]'}`}
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col px-6 pt-4 pb-6 h-full">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center mb-6 border border-white/10">
                <span className="text-3xl font-bold text-white">${amount}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{recipient}</h3>
              <p className="text-gray-400 text-sm mb-8">
                Mode: <span className={paymentMode === 'Mesh' ? 'text-purple-400 font-bold' : 'text-emerald-400 font-bold'}>{paymentMode === 'Mesh' ? 'Offline Mesh' : 'Online Transfer'}</span>
              </p>

              {paymentMode === 'Mesh' ? (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start space-x-3 text-left">
                  <ShieldAlert className="text-orange-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-orange-400 font-bold text-sm mb-1">Confirmation Warning</h4>
                    <p className="text-orange-300/80 text-xs leading-relaxed">
                      Money will be locked locally and deducted only after confirmation from the network.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start space-x-3 text-left">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-emerald-400 font-bold text-sm mb-1">Instant Transfer</h4>
                    <p className="text-emerald-300/80 text-xs leading-relaxed">
                      Money will be transferred instantly via the secure banking server.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={handleSendSecurely}
              disabled={isProcessing}
              className={`w-full py-4 rounded-full font-extrabold text-[15px] transition-all flex items-center justify-center uppercase tracking-wide text-black ${paymentMode === 'Mesh' ? 'bg-purple-400 shadow-[0_0_20px_rgba(192,132,252,0.3)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
            >
              {isProcessing ? 'Processing...' : 'Send Securely'}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full h-full">
            <DeviceDiscovery onComplete={handleDeviceDiscoveryComplete} />
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 w-full h-full pb-6 px-4">
            <MeshVisualizer recipientName={recipient} onComplete={handleMeshRoutingComplete} />
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            {paymentMode === 'Mesh' ? (
              <>
                <div className="w-24 h-24 bg-orange-500/20 text-orange-400 rounded-[2rem] flex items-center justify-center mb-8 border border-orange-500/50 shadow-[0_0_40px_rgba(249,115,22,0.2)] relative">
                  <Clock size={48} />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-orange-500/50 rounded-[2rem]"></motion.div>
                </div>
                <h2 className="text-[28px] font-bold text-white mb-2 leading-tight">Payment Sent<br/><span className="text-orange-400 text-xl">(Pending Confirmation)</span></h2>
                
                <div className="p-4 bg-[var(--color-surface)] rounded-2xl w-full max-w-[240px] mb-6 border border-white/5 text-left mt-4">
                  <div className="flex justify-between mb-2"><span className="text-gray-400 text-sm">Amount</span><span className="text-white font-bold">${amount}</span></div>
                  <div className="flex justify-between mb-2"><span className="text-gray-400 text-sm">To</span><span className="text-white font-bold">{recipient}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400 text-sm">Txn ID</span><span className="text-gray-500 text-xs font-mono">{txnId || '...'}</span></div>
                </div>

                <p className="text-gray-400 text-[13px] mb-8 leading-relaxed max-w-[280px]">
                  This payment will complete automatically when any device in the network gets internet access.
                </p>
              </>
            ) : (
              <>
                <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-[2rem] flex items-center justify-center mb-8 border border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 size={48} />
                </div>
                <h2 className="text-[28px] font-bold text-white mb-3">Successful</h2>
                <p className="text-gray-400 text-[15px] mb-10 max-w-[240px] leading-relaxed">
                  Your payment of <strong className="text-white">${amount}</strong> was sent to <strong className="text-white">{recipient}</strong>.
                </p>
              </>
            )}

            <div className="w-full flex space-x-3">
              <button 
                onClick={() => navigate('/mepay/history')}
                className="flex-1 bg-[var(--color-surface)] text-[var(--text-main)] py-4 rounded-full font-bold active:bg-white/5 transition-colors border border-white/5"
              >
                View Details
              </button>
              <button 
                onClick={() => navigate('/mepay/')}
                className={`flex-1 text-black py-4 rounded-full font-bold active:scale-[0.98] transition-transform ${paymentMode === 'Mesh' ? 'bg-purple-400' : 'bg-emerald-500'}`}
              >
                Done
              </button>
            </div>
          </motion.div>
        )}

        {step === 6 && (
          <motion.div key="step6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute inset-0 z-50">
            <QRScanner 
              onScan={handleScan} 
              onClose={() => setStep(1)} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
