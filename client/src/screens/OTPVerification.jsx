import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OTPVerification = () => {
  const [otp, setOtp] = useState('123456');
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://localhost:5000/auth/otp/verify', { userId, otpCode: otp });
      navigate('/set-pin');
    } catch (err) {
      setError('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setError('');
    await axios.post('http://localhost:5000/auth/otp/send', { userId });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ padding: '40px 24px' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Verify Identity</h2>
      <p style={{ color: '#A0A0A0', marginBottom: '40px' }}>Enter the 6-digit code sent to your phone.</p>

      {error && <p style={{ color: '#FF4B4B', marginBottom: '20px' }}>{error}</p>}

      <div className="input-group">
        <input 
          type="text" 
          maxLength="6"
          className="input-field" 
          placeholder="000000" 
          style={{ textAlign: 'center', fontSize: '32px', letterSpacing: '8px' }}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          autoFocus
        />
      </div>

      <p style={{ textAlign: 'center', color: '#A0A0A0', marginBottom: '40px' }}>
        Resend code in <span style={{ color: '#00FF9C' }}>{timer}s</span>
      </p>

      <button className="btn" onClick={handleVerify} disabled={loading || otp.length < 6}>
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>

      {timer === 0 && (
        <button className="btn btn-secondary" onClick={handleResend} style={{ marginTop: '16px' }}>
          Resend OTP
        </button>
      )}
    </motion.div>
  );
};

export default OTPVerification;
