import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const KYCStatus = () => {
  const [status, setStatus] = useState('pending'); // pending, approved, rejected
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/kyc/status?userId=${userId}`);
      setStatus(res.data.status);
      setReason(res.data.rejection_reason);
    } catch (err) {
      console.warn('KYC Status fetch failed, using fallback status: pending');
      setStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 10 seconds for demo purposes
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <>
            <Clock size={80} color="#FFB800" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Verification In Progress</h2>
            <p style={{ color: '#A0A0A0', marginBottom: '40px', lineHeight: '1.6' }}>
              We're reviewing your documents. This usually takes 24-48 hours. We'll notify you once it's completed.
            </p>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Logout</button>
          </>
        );
      case 'approved':
        return (
          <>
            <CheckCircle size={80} color="#00FF9C" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>KYC Approved! 🎉</h2>
            <p style={{ color: '#A0A0A0', marginBottom: '40px', lineHeight: '1.6' }}>
              Congratulations! Your identity has been verified. You now have full access to all banking features.
            </p>
            <button className="btn" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          </>
        );
      case 'rejected':
        return (
          <>
            <AlertCircle size={80} color="#FF4B4B" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>KYC Rejected</h2>
            <p style={{ color: '#FF4B4B', marginBottom: '12px' }}>Reason: {reason || 'Documents unclear'}</p>
            <p style={{ color: '#A0A0A0', marginBottom: '40px', lineHeight: '1.6' }}>
              Please review the reason and resubmit your documents for verification.
            </p>
            <button className="btn" onClick={() => navigate('/kyc')}>Resubmit KYC</button>
          </>
        );
      case 'not_started':
      case 'in_progress':
        // If they haven't started or are in progress, redirect them to the KYC flow
        navigate('/kyc');
        return null;
      default:
        return <p>Checking status...</p>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ padding: '40px 24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
    >
      {loading ? <RefreshCw className="animate-spin" size={40} color="#00FF9C" /> : renderContent()}
    </motion.div>
  );
};

export default KYCStatus;
