import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function MeshVisualizer({ recipientName, onComplete }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Sequence mapping:
    // 0: Locating devices (0-2s)
    // 1: Establishing encrypted connection (2-4s)
    // 2: Routing via Relay (multi-hop simulation) (4-7s)
    // 3: Transaction confirmed (7-9s)
    
    const t1 = setTimeout(() => setPhase(1), 2000);
    const t2 = setTimeout(() => setPhase(2), 4000);
    const t3 = setTimeout(() => setPhase(3), 7000);
    const t4 = setTimeout(() => onComplete(), 9000);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); }
  }, [onComplete]);

  const nodes = [
    { id: 'me', label: 'You', x: 20, y: 80, activeAt: 0 },
    { id: 'n2', label: 'Relay Node', x: 50, y: 40, activeAt: 2 },
    { id: 'target', label: recipientName, x: 80, y: 15, activeAt: 2 },
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] text-white rounded-[2rem] overflow-hidden">
      <div className="p-6 pb-2 text-center relative z-20">
        <AnimatePresence mode="wait">
          {phase === 0 && <motion.h2 key="0" initial={{opacity:0, y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} className="text-lg font-bold text-yellow-400 flex items-center justify-center"><Zap size={20} className="mr-2"/> Scanning P2P Network...</motion.h2>}
          {phase === 1 && <motion.h2 key="1" initial={{opacity:0, y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} className="text-lg font-bold text-blue-400 flex items-center justify-center"><ShieldCheck size={20} className="mr-2"/> Encrypting & Signing...</motion.h2>}
          {phase === 2 && <motion.h2 key="2" initial={{opacity:0, y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} className="text-lg font-bold text-purple-400 flex items-center justify-center">Routing via Mesh Links...</motion.h2>}
          {phase === 3 && <motion.h2 key="3" initial={{opacity:0, y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} className="text-lg font-bold text-emerald-400 flex items-center justify-center"><CheckCircle2 size={20} className="mr-2"/> Delivered to {recipientName}</motion.h2>}
        </AnimatePresence>
      </div>

      <div className="relative flex-1 bg-black/40 mx-4 mt-6 mb-8 rounded-3xl overflow-hidden border border-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
        {/* Radar sweep effect */}
        {phase < 3 && (
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute top-[80%] left-[20%] w-[200%] h-[200%] -ml-[100%] -mt-[100%] z-0"
            style={{
              background: 'conic-gradient(from 0deg, transparent 70%, rgba(16,185,129,0.05) 80%, rgba(16,185,129,0.2) 100%)',
              borderRadius: '50%'
            }}
          />
        )}
        
        {/* Nodes */}
        {nodes.map(node => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: phase >= node.activeAt ? 1 : 0.3, scale: phase >= node.activeAt ? 1 : 0.8 }}
            className={`absolute flex flex-col items-center z-10 transition-all duration-700`}
            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl relative transition-colors duration-500 backdrop-blur-sm ${
              node.id === 'target' && phase >= 3 ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400' : 
              node.id === 'me' ? 'bg-blue-500/20 border-2 border-blue-400 text-blue-400' :
              (phase >= node.activeAt ? 'bg-purple-500/20 border-2 border-purple-400 text-purple-400' : 'bg-gray-800/80 border border-gray-600 text-gray-500')
            }`}>
              <Smartphone size={22} className={node.id === 'target' && phase >= 3 ? 'drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]' : ''} />
              {(phase === node.activeAt && node.id !== 'target') && (
                <span className="absolute flex h-full w-full">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${node.id==='me'?'bg-blue-400':'bg-purple-400'}`}></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold tracking-wider text-gray-300 mt-3 whitespace-nowrap bg-black/80 px-2.5 py-1 rounded-md border border-white/5">{node.label}</span>
          </motion.div>
        ))}

        {/* Pulse to Network */}
        {phase === 1 && (
          <motion.div 
            className="absolute rounded-full border-2 border-blue-500/30 bg-blue-500/5"
            initial={{ width: 0, height: 0, left: '20%', top: '80%', opacity: 1, x: '-50%', y: '-50%' }}
            animate={{ width: '250%', height: '250%', opacity: 0 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
        )}

        {/* Route visualization lines */}
        {phase >= 2 && (
          <svg className="absolute inset-0 w-full h-full z-0 pointer-events-none">
            {/* Me to Relay */}
            <motion.line 
              x1="20%" y1="80%" x2="50%" y2="40%"
              className="stroke-purple-500/60"
              strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }}
            />
            {/* Relay to Target */}
            <motion.line 
              x1="50%" y1="40%" x2="80%" y2="15%"
              className="stroke-emerald-500/60"
              strokeWidth="2" strokeDasharray="4 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8, delay: 0.8 }}
            />
          </svg>
        )}
        
        {/* Packet Animation */}
        {phase === 2 && (
          <>
            <motion.div 
              className="absolute w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,1)] z-20"
              initial={{ left: '20%', top: '80%', x: '-50%', y: '-50%' }}
              animate={{ left: '50%', top: '40%' }}
              transition={{ duration: 0.8, ease: "linear" }}
            />
            <motion.div 
              className="absolute w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_rgba(192,132,252,1)] z-20"
              initial={{ left: '50%', top: '40%', x: '-50%', y: '-50%', opacity: 0 }}
              animate={{ left: '80%', top: '15%', opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "linear" }}
            />
          </>
        )}
      </div>
    </div>
  );
}
