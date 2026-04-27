import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, Wifi, Loader2 } from 'lucide-react';

export default function DeviceDiscovery({ onComplete }) {
  const [devices, setDevices] = useState([]);
  const [selected, setSelected] = useState(null);
  
  useEffect(() => {
    const t1 = setTimeout(() => {
      setDevices([{ id: 1, name: "Rahul's Phone", strength: "Strong", power: 90 }]);
    }, 1500);
    
    const t2 = setTimeout(() => {
      setDevices(prev => [...prev, { id: 2, name: "Device B", strength: "Medium", power: 60 }]);
    }, 2500);
    
    const t3 = setTimeout(() => {
      setSelected(1);
    }, 4000);
    
    const t4 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5500);
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        className="w-24 h-24 mb-6 rounded-full border-2 border-dashed border-emerald-500/50 flex items-center justify-center relative"
      >
        <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-pulse"></div>
        <Smartphone className="text-emerald-400" size={32} />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white mb-2">Searching for Nearby Devices...</h2>
      <p className="text-gray-400 text-sm mb-8">Looking for nodes to route your payment securely</p>
      
      <div className="w-full max-w-sm space-y-3">
        <AnimatePresence>
          {devices.map((device, i) => (
            <motion.div 
              key={device.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 ${selected === device.id ? 'bg-emerald-500/20 border-emerald-500 text-white' : 'bg-[var(--color-surface)] border-white/5 text-gray-300'}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${selected === device.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'}`}>
                  <Smartphone size={18} />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-sm">{device.name}</div>
                  <div className={`text-xs ${selected === device.id ? 'text-emerald-400' : 'text-gray-500'}`}>{device.strength} Signal</div>
                </div>
              </div>
              
              {selected === device.id ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center space-x-1 text-emerald-400 text-xs font-bold">
                  <span>Selected</span>
                </motion.div>
              ) : (
                <Wifi size={18} className={device.power > 70 ? 'text-emerald-500' : 'text-yellow-500'} />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {devices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm">Scanning P2P Network</span>
          </div>
        )}
      </div>
    </div>
  );
}
