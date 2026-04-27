import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import axios from 'axios';

const BiometricSetup = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleEnable = async () => {
    setLoading(true);
    // Simulate biometric prompt
    setTimeout(async () => {
      try {
        await axios.post('http://localhost:5000/auth/biometric-enable', { userId, enabled: true });
        navigate('/login');
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
    >
      <div style={{ marginBottom: '40px' }}>
        <Fingerprint size={100} color="#00FF9C" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 156, 0.5))' }} />
      </div>
      <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Enable Biometrics</h2>
      <p style={{ color: '#A0A0A0', marginBottom: '40px', lineHeight: '1.6' }}>
        Use Fingerprint or Face ID for faster and more secure logins.
      </p>

      <button className="btn" onClick={handleEnable} disabled={loading}>
        {loading ? "Enabling..." : "Enable Biometrics"}
      </button>
      
      <button className="btn btn-secondary" style={{ marginTop: '16px' }} onClick={() => navigate('/login')} disabled={loading}>
        Skip for now
      </button>
    </motion.div>
  );
};

export default BiometricSetup;
