import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SetPinPage = () => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleSetPin = async () => {
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    if (pin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/auth/set-pin', { userId, pin });
      navigate('/biometrics');
    } catch (err) {
      setError('Failed to set PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '40px 24px' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Set Secure PIN</h2>
      <p style={{ color: '#A0A0A0', marginBottom: '40px' }}>Create a 4-6 digit PIN for quick access to your account.</p>

      {error && <p style={{ color: '#FF4B4B', marginBottom: '20px' }}>{error}</p>}

      <div className="input-group">
        <label className="input-label">New PIN</label>
        <input 
          type="password" 
          maxLength="6"
          className="input-field" 
          placeholder="••••" 
          style={{ textAlign: 'center', fontSize: '24px' }}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label className="input-label">Confirm PIN</label>
        <input 
          type="password" 
          maxLength="6"
          className="input-field" 
          placeholder="••••" 
          style={{ textAlign: 'center', fontSize: '24px' }}
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value)}
        />
      </div>

      <button className="btn" onClick={handleSetPin} disabled={loading || pin.length < 4}>
        {loading ? "Setting PIN..." : "Confirm PIN"}
      </button>
    </motion.div>
  );
};

export default SetPinPage;
