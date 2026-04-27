import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';
import axios from 'axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { 
        email: email.trim(), 
        password: password.trim(),
        device_id: 'browser-demo-device'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', res.data.user.id || 1); // For demo

      // Check KYC status
      const kycRes = await axios.get(`http://localhost:5000/kyc/status?userId=${localStorage.getItem('userId')}`);
      if (kycRes.data.status !== 'approved') {
        navigate('/kyc');
      } else {
        alert('Login Successful! Welcome to Halora.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Biometric Login Successful!');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '40px 24px' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Welcome Back</h2>
      <p style={{ color: '#A0A0A0', marginBottom: '40px' }}>Enter your details to access your account.</p>

      {error && <p style={{ color: '#FF4B4B', marginBottom: '20px' }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label className="input-label">Email or Phone</label>
          <input 
            type="text" 
            className="input-field" 
            placeholder="john@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input 
            type="password" 
            className="input-field" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <p style={{ textAlign: 'right', color: '#00FF9C', fontSize: '14px', marginBottom: '24px', cursor: 'pointer' }} onClick={() => navigate('/forgot-password')}>
          Forgot Password?
        </p>

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={{ margin: '32px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ flex: 1, height: '1px', background: '#222' }} />
        <span style={{ color: '#444', fontSize: '14px' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: '#222' }} />
      </div>

      <button className="btn btn-secondary" onClick={handleBiometricLogin} disabled={loading}>
        <Fingerprint size={20} />
        Login with Biometrics
      </button>

      <p style={{ textAlign: 'center', marginTop: '32px', color: '#A0A0A0' }}>
        Don't have an account? <span style={{ color: '#00FF9C', cursor: 'pointer' }} onClick={() => navigate('/signup')}>Sign Up</span>
      </p>

      <button 
        className="btn" 
        style={{ marginTop: '40px', background: '#333', color: '#666', fontSize: '12px' }} 
        onClick={() => {
          localStorage.setItem('userId', '999');
          localStorage.setItem('token', 'bypass-token');
          navigate('/kyc');
        }}
      >
        DEVELOPER BYPASS (SKIP LOGIN)
      </button>
    </motion.div>
  );
};

export default LoginPage;
