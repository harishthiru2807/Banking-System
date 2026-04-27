import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0B0B0B'
      }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {/* Placeholder for the logo I generated */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #00FF9C 0%, #00B36D 100%)',
          borderRadius: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 0 30px rgba(0, 255, 156, 0.3)'
        }}>
          <span style={{ fontSize: '48px', fontWeight: 'bold', color: '#000' }}>H</span>
        </div>
      </motion.div>
      
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ marginTop: '24px', fontSize: '24px', letterSpacing: '4px', color: '#FFF' }}
      >
        HALORA
      </motion.h1>
    </motion.div>
  );
};

export default SplashScreen;
