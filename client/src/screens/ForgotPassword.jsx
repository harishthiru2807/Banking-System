import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: Done
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    // In a real app, this would trigger an email
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ padding: '40px 24px' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Reset Password</h2>
      
      {step === 1 ? (
        <>
          <p style={{ color: '#A0A0A0', marginBottom: '40px' }}>Enter your email and we'll send you instructions to reset your password.</p>
          <form onSubmit={handleReset}>
            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#A0A0A0', marginBottom: '40px', lineHeight: '1.6' }}>
            Check your email. We've sent a recovery link to <strong>{email}</strong>.
          </p>
          <button className="btn" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: '24px', color: '#00FF9C', cursor: 'pointer' }} onClick={() => navigate('/login')}>
        Cancel
      </p>
    </motion.div>
  );
};

export default ForgotPassword;
