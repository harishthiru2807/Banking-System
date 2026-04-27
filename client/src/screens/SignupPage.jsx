import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simple validation
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/auth/signup', formData);
      localStorage.setItem('userId', res.data.userId);
      navigate('/otp');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '40px 24px' }}
    >
      <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Create Account</h2>
      <p style={{ color: '#A0A0A0', marginBottom: '40px' }}>Join Halora for a premium banking experience.</p>

      {error && <p style={{ color: '#FF4B4B', marginBottom: '20px' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Full Name</label>
          <input 
            type="text" 
            name="name" 
            className="input-field" 
            placeholder="John Doe" 
            required 
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Email Address</label>
          <input 
            type="email" 
            name="email" 
            className="input-field" 
            placeholder="john@example.com" 
            required 
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Phone Number</label>
          <input 
            type="tel" 
            name="phone" 
            className="input-field" 
            placeholder="+1 234 567 890" 
            required 
            onChange={handleChange}
          />
        </div>
        <div className="input-group">
          <label className="input-label">Password</label>
          <input 
            type="password" 
            name="password" 
            className="input-field" 
            placeholder="••••••••" 
            required 
            onChange={handleChange}
          />
        </div>

        <button className="btn" type="submit" disabled={loading} style={{ marginTop: '20px' }}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '24px', color: '#A0A0A0' }}>
        Already have an account? <span style={{ color: '#00FF9C', cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
      </p>
    </motion.div>
  );
};

export default SignupPage;
