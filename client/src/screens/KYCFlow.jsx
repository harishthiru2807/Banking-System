import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, CreditCard, Upload, CheckCircle } from 'lucide-react';
import axios from 'axios';

const KYCIntro = ({ onStart }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '40px 24px', textAlign: 'center' }}>
    <ShieldCheck size={80} color="#00FF9C" style={{ marginBottom: '24px' }} />
    <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Complete Your KYC</h2>
    <p style={{ color: '#A0A0A0', marginBottom: '32px', lineHeight: '1.6' }}>
      To start using banking services, please verify your identity. This helps us keep your account secure and comply with regulations.
    </p>
    <div style={{ textAlign: 'left', marginBottom: '40px', background: '#121212', padding: '20px', borderRadius: '16px' }}>
      <p style={{ color: '#00FF9C', fontWeight: 'bold', marginBottom: '12px' }}>Benefits:</p>
      <ul style={{ color: '#A0A0A0', fontSize: '14px', listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '8px' }}>• Secure transactions</li>
        <li style={{ marginBottom: '8px' }}>• Regulatory compliance</li>
        <li>• Full access to all features</li>
      </ul>
    </div>
    <button className="btn" onClick={onStart}>Start KYC</button>
  </motion.div>
);

const KYCFlow = () => {
  const [step, setStep] = useState(0); // 0: Intro, 1: Profile, 2: Identity, 3: Upload, 4: Review
  const [formData, setFormData] = useState({
    dob: '', address: '', city: '', state: '', pincode: '',
    aadhaar: '', pan: '',
    files: { aadhaarFront: null, aadhaarBack: null, panCard: null, selfie: null }
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId');

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // 1. Save Profile
      await axios.post('http://localhost:5000/kyc/profile', { 
        userId, ...formData 
      });
      // 2. Verify Identity
      await axios.post('http://localhost:5000/kyc/verify', { 
        userId, aadhaar: formData.aadhaar, pan: formData.pan 
      });
      // 3. Final Submit
      await axios.post('http://localhost:5000/kyc/submit', { userId });
      navigate('/dashboard');
    } catch (err) {
      console.warn('KYC Submission: proceeding to dashboard (demo mode)');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <KYCIntro onStart={() => setStep(1)} />;
      case 1: return (
        <div className="fade-in">
          <h3 style={{ marginBottom: '24px' }}>Step 1: Profile Setup</h3>
          <div className="input-group">
            <label className="input-label">Date of Birth</label>
            <input type="date" className="input-field" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">Address</label>
            <input type="text" className="input-field" placeholder="House No, Street" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label className="input-label">City</label>
              <input type="text" className="input-field" placeholder="City" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className="input-group">
              <label className="input-label">PIN Code</label>
              <input type="text" className="input-field" placeholder="123456" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} />
            </div>
          </div>
          <button className="btn" onClick={handleNext}>Continue</button>
        </div>
      );
      case 2: return (
        <div className="fade-in">
          <h3 style={{ marginBottom: '24px' }}>Step 2: Identity Verification</h3>
          <div className="input-group">
            <label className="input-label">Aadhaar Number</label>
            <input type="text" maxLength="12" className="input-field" placeholder="0000 0000 0000" value={formData.aadhaar} onChange={(e) => setFormData({...formData, aadhaar: e.target.value})} />
          </div>
          <div className="input-group">
            <label className="input-label">PAN Number</label>
            <input type="text" className="input-field" placeholder="ABCDE1234F" style={{ textTransform: 'uppercase' }} value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value.toUpperCase()})} />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            <input type="checkbox" required />
            <span style={{ fontSize: '12px', color: '#A0A0A0' }}>I consent to Halora using my Aadhaar/PAN for verification.</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
            <button className="btn" onClick={handleNext}>Verify</button>
          </div>
        </div>
      );
      case 3: return (
        <div className="fade-in">
          <h3 style={{ marginBottom: '24px' }}>Step 3: Document Upload</h3>
          <p style={{ color: '#A0A0A0', marginBottom: '24px', fontSize: '14px' }}>Upload clear photos of your documents.</p>
          {['Aadhaar Front', 'Aadhaar Back', 'PAN Card', 'Selfie'].map(type => (
            <div key={type} style={{ background: '#121212', padding: '16px', borderRadius: '12px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>{type}</span>
              <Upload size={20} color="#00FF9C" style={{ cursor: 'pointer' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
            <button className="btn" onClick={handleNext}>Preview</button>
          </div>
        </div>
      );
      case 4: return (
        <div className="fade-in">
          <h3 style={{ marginBottom: '24px' }}>Step 4: Review & Submit</h3>
          <div style={{ background: '#121212', padding: '20px', borderRadius: '16px', marginBottom: '32px', fontSize: '14px' }}>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#A0A0A0' }}>Name:</span> Demo User</p>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#A0A0A0' }}>DOB:</span> {formData.dob}</p>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#A0A0A0' }}>Address:</span> {formData.address}</p>
            <p style={{ marginBottom: '8px' }}><span style={{ color: '#A0A0A0' }}>Aadhaar:</span> **** **** {formData.aadhaar.slice(-4)}</p>
            <p><span style={{ color: '#A0A0A0' }}>PAN:</span> {formData.pan}</p>
          </div>
          <button className="btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Confirm & Submit'}
          </button>
          <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ marginTop: '16px' }}>Edit Details</button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto' }}>
      {step > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#A0A0A0', marginBottom: '8px' }}>
            <span>Step {step} of 4</span>
            <span>{Math.round((step/4)*100)}% Complete</span>
          </div>
          <div style={{ height: '4px', background: '#222', borderRadius: '2px' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(step/4)*100}%` }}
              style={{ height: '100%', background: '#00FF9C', borderRadius: '2px' }}
            />
          </div>
        </div>
      )}
      {renderStep()}
    </div>
  );
};

export default KYCFlow;
