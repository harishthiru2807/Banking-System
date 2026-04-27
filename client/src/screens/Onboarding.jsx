import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Smartphone, TrendingUp } from 'lucide-react';

const slides = [
  {
    title: "Secure Banking",
    description: "Multi-layered security protocols to keep your assets safe and sound.",
    icon: <Shield size={80} color="#00FF9C" />
  },
  {
    title: "Privacy First",
    description: "Your data is yours. We use advanced encryption to protect your identity.",
    icon: <Smartphone size={80} color="#00FF9C" />
  },
  {
    title: "Smart Insights",
    description: "AI-driven financial advice tailored to your spending patterns.",
    icon: <TrendingUp size={80} color="#00FF9C" />
  }
];

const Onboarding = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/signup');
    }
  };

  return (
    <div style={{ padding: '40px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'center' }}>
              {slides[currentSlide].icon}
            </div>
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>{slides[currentSlide].title}</h2>
            <p style={{ color: '#A0A0A0', fontSize: '18px', lineHeight: '1.6' }}>
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px' }}>
          {slides.map((_, i) => (
            <div 
              key={i}
              style={{ 
                width: i === currentSlide ? '24px' : '8px', 
                height: '8px', 
                borderRadius: '4px', 
                background: i === currentSlide ? '#00FF9C' : '#333',
                transition: 'all 0.3s'
              }} 
            />
          ))}
        </div>
        <button className="btn" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
