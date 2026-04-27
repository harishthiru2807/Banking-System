import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

import SplashScreen from './screens/SplashScreen';
import Onboarding from './screens/Onboarding';
import SignupPage from './screens/SignupPage';
import OTPVerification from './screens/OTPVerification';
import SetPinPage from './screens/SetPinPage';
import BiometricSetup from './screens/BiometricSetup';
import LoginPage from './screens/LoginPage';
import ForgotPassword from './screens/ForgotPassword';
import KYCFlow from './screens/KYCFlow';
import KYCStatus from './screens/KYCStatus';
import Dashboard from './screens/Dashboard';
import MepayApp from './mepay/App';


const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/set-pin" element={<SetPinPage />} />
        <Route path="/biometrics" element={<BiometricSetup />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/kyc" element={<KYCFlow />} />
        <Route path="/kyc-status" element={<KYCStatus />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mepay/*" element={<MepayApp />} />
      </Routes>
    </AnimatePresence>
  );
};

const LanguageSwitcher = () => {
  const [lang, setLang] = useState('English');
  const location = useLocation();
  
  if (location.pathname.startsWith('/mepay')) return null;

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      background: 'rgba(255,255,255,0.05)',
      padding: '4px 12px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '12px',
      color: '#A0A0A0'
    }} onClick={() => {
      const langs = ['English', 'Tamil', 'Hindi'];
      const next = langs[(langs.indexOf(lang) + 1) % langs.length];
      setLang(next);
    }}>
      <Globe size={14} />
      {lang}
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <div className="mobile-frame">
          <LanguageSwitcher />
          <AnimatedRoutes />
        </div>
      </div>
    </Router>
  );
}

export default App;
